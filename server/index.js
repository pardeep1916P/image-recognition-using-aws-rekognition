/* ---------- 0. Setup ---------- */
require('dotenv').config();
const express = require('express');
const multer  = require('multer');
const AWS     = require('aws-sdk');
const cors    = require('cors');

const app  = express();
const port = process.env.PORT || 5000;

/* ---------- 1. Helpers ---------- */
const TOP_N_LABELS = 2;

function getTopLabels(labels, n = TOP_N_LABELS) {
  if (!Array.isArray(labels)) return [];
  return [...labels]
    .sort((a, b) => b.Confidence - a.Confidence)
    .slice(0, n)
    .map((l) => ({
      Name: l.Name,
      Confidence: +l.Confidence.toFixed(2),
      Boxes: (l.Instances || []).map((inst) => ({
        Confidence: +inst.Confidence.toFixed(2),
        ...(inst.BoundingBox || {}),
      })),
    }));
}

function logTopLabels(prefix, labels) {
  const top = getTopLabels(labels);
  top.forEach((l) =>
    l.Boxes.forEach((b, i) => {
      console.log(
        `${prefix} → ${l.Name} (${l.Confidence}%) #${i + 1} ` +
          `[x:${(b.Left || 0).toFixed(2)} y:${(b.Top || 0).toFixed(2)} ` +
          `w:${(b.Width || 0).toFixed(2)} h:${(b.Height || 0).toFixed(2)}]`
      );
    })
  );
}

/* ---------- 2. Middleware ---------- */
app.use(cors({ origin: '*' }));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- 3. AWS SDK ---------- */
AWS.config.update({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();
const s3          = new AWS.S3();
const UPLOAD_BUCKET = process.env.AWS_UPLOAD_BUCKET;

/* ---------- 4. Routes ---------- */

// 4‑A. Detect labels (image file sent from client)
app.post('/detect-labels', upload.single('image'), async (req, res) => {
  console.log('📥  /detect-labels called');

  if (!req.file) {
    console.log('❌  No file attached');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log(`✅  File received: ${req.file.originalname} (${req.file.size} bytes)`);

  let rekogParams;
  let s3Key = null;

  try {
    // Optional: upload to S3 first
    if (UPLOAD_BUCKET) {
      s3Key = `uploads/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      console.log(`📤  Uploading image to s3://${UPLOAD_BUCKET}/${s3Key}`);

      await s3
        .putObject({
          Bucket: UPLOAD_BUCKET,
          Key:    s3Key,
          Body:   req.file.buffer,
          ContentType: req.file.mimetype,
        })
        .promise();

      rekogParams = {
        Image: { S3Object: { Bucket: UPLOAD_BUCKET, Name: s3Key } },
        MaxLabels: 10,
        MinConfidence: 70,
      };
    } else {
      rekogParams = {
        Image: { Bytes: req.file.buffer },
        MaxLabels: 10,
        MinConfidence: 70,
      };
    }

    console.log('🔍  Calling Rekognition.detectLabels …');

    rekognition.detectLabels(rekogParams, (err, data) => {
      if (err) {
        console.error('💥  Rekognition error:', err.message || err);
        return res.status(500).json({ error: 'Failed to analyse image', details: err.message });
      }

      console.log('✅  Rekognition success');
      logTopLabels('📊  Top', data.Labels);

      res.json({
        TopLabels: getTopLabels(data.Labels),
        S3Object:  s3Key ? { Bucket: UPLOAD_BUCKET, Key: s3Key } : null,
        Raw:       data,
      });
    });
  } catch (err) {
    console.error('💥  Internal error:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// 4‑B. Detect labels directly from an existing S3 object
app.post('/detect-labels-s3', async (req, res) => {
  const { key, bucket } = req.body;
  if (!key) return res.status(400).json({ error: "'key' is required" });

  const Bucket = bucket || process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  if (!Bucket) return res.status(500).json({ error: 'No S3 bucket specified' });

  console.log(`🔍  Rekognition for s3://${Bucket}/${key}`);

  rekognition.detectLabels(
    {
      Image: { S3Object: { Bucket, Name: key } },
      MaxLabels: 10,
      MinConfidence: 70,
    },
    (err, data) => {
      if (err) {
        console.error('💥  Rekognition error:', err.message || err);
        return res.status(500).json({ error: 'Rekognition failed', details: err.message });
      }
      logTopLabels('📊  Top', data.Labels);
      res.json({ TopLabels: getTopLabels(data.Labels) });
    }
  );
});

/* ---------- 5. Startup ---------- */
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀  Server running on http://0.0.0.0:${port}`);
});
