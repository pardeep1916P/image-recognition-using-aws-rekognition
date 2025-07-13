require("dotenv").config();
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

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
  top.forEach((l) => {
    l.Boxes.forEach((b, idx) => {
    });
  });
}

app.use(cors({ origin: "*" }));
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

const UPLOAD_BUCKET = process.env.AWS_UPLOAD_BUCKET;

app.post("/detect-labels", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let rekogParams;
    let s3Key = null;

    if (UPLOAD_BUCKET) {
      s3Key = `uploads/${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
      await s3
        .putObject({
          Bucket: UPLOAD_BUCKET,
          Key: s3Key,
          Body: req.file.buffer,
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

    rekognition.detectLabels(rekogParams, (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Failed to analyse image" });
      }

      logTopLabels("Labels (uploaded)" + (s3Key ? ` [${s3Key}]` : ""), data.Labels);
      return res.json({
        TopLabels: getTopLabels(data.Labels),
        S3Object: s3Key ? { Bucket: UPLOAD_BUCKET, Key: s3Key } : null,
        Raw: data,
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/detect-labels-s3", async (req, res) => {
  try {
    const { key, bucket } = req.body;
    if (!key) return res.status(400).json({ error: "'key' is required" });

    const Bucket = bucket || process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
    if (!Bucket) return res.status(500).json({ error: "S3 bucket name not specified" });

    const labels = await detectLabelsFromS3(Bucket, key);
    res.json({ TopLabels: labels });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function detectLabelsFromS3(bucket, key) {
  return new Promise((resolve, reject) => {
    rekognition.detectLabels(
      {
        Image: { S3Object: { Bucket: bucket, Name: key } },
        MaxLabels: 10,
        MinConfidence: 70,
      },
      (err, data) => {
        if (err) return reject(err);
        logTopLabels(`Labels (S3:${bucket}/${key})`, data.Labels);
        resolve(getTopLabels(data.Labels));
      }
    );
  });
}

async function runStartupRecognition() {
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  const key = process.env.IMAGE_FILE;
  if (!bucket || !key) return;
  try {
    await detectLabelsFromS3(bucket, key);
  } catch (e) {
    console.error("Startup Rekognition failed:", e.message || e);
  }
}

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  runStartupRecognition();
});
