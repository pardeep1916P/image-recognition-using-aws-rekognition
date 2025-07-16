import formidable from 'formidable';
import fs from 'fs';
import AWS from 'aws-sdk';

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Error parsing the file' });
    }

    try {
      const imageFile = files?.image;
      if (!imageFile) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      // Read file as buffer
      const imageBuffer = fs.readFileSync(imageFile.filepath);

      // Configure AWS Rekognition
      const rekognition = new AWS.Rekognition({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // Detect labels
      const result = await rekognition
        .detectLabels({
          Image: { Bytes: imageBuffer },
          MaxLabels: 10,
          MinConfidence: 70,
        })
        .promise();

      res.status(200).json(result);
    } catch (error) {
      console.error('Rekognition error:', error);
      res.status(500).json({ error: 'Label detection failed' });
    }
  });
};

export default handler;
