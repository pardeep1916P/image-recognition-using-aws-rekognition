# 🖼️ Image Recognition using AWS Rekognition

![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![API Gateway](https://img.shields.io/badge/AWS%20API%20Gateway-FF4F8B?style=for-the-badge&logo=amazonapigateway&logoColor=white)
![Rekognition](https://img.shields.io/badge/AWS%20Rekognition-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Frontend:** React (Vercel Hosted)  
**Backend:** AWS EC2 + API Gateway  
**Image Processing:** AWS Rekognition  
**Storage:** Amazon S3 (with lifecycle policy)  

---

## 📌 Overview
A **cloud-based image recognition system** leveraging **AWS Rekognition** to detect and analyze objects in images.

Key Points:
- Amazon S3 temporarily stores uploaded images.
- Lifecycle Policies delete images automatically after 1 day.
- Vercel hosts the React frontend for a smooth user experience.
- Ensures cost-efficiency, privacy, and scalability.

---

## 🏗️ Cloud Architecture

```plaintext
          🖥️ User
            │
            ▼
   🎨 Frontend (React on Vercel)
            │
            ▼
    🌐 API Gateway (REST API)
            │
            ▼
  ⚙️ Backend (AWS EC2 Server)
            │
            ▼
 📂 S3 Bucket (Auto-delete in 1 Day)
            │
            ▼
🔍 AWS Rekognition (Image Analysis)
```
---
##🚀 Features
- Upload an image for real-time recognition
- Detects objects, scenes, and faces
- Auto-deletes images after 1 day (S3 Lifecycle Policy)
- Secure communication via IAM Roles & API Gateway
- Fully deployed backend on AWS EC2
- Responsive Vercel-hosted frontend

---
##🛠️ AWS Services & Responsibilities

```plaintext
Service           Purpose
----------------  ---------------------------------------------------
Amazon EC2        Host backend API server
API Gateway       Route API requests securely
Amazon S3         Temporary storage for uploaded images
Lifecycle Policy  Auto-delete files after 1 day
AWS Rekognition   Image analysis for objects, scenes, and faces
IAM               Secure AWS resource access
Vercel            Host React frontend
```

---
##💼 My Role as Cloud Engineer

- Architected entire AWS infrastructure
- Deployed backend API on Amazon EC2
- Integrated API Gateway for secure requests
- Configured S3 Lifecycle Policy for auto-deletion
- Implemented recognition workflow using AWS Rekognition
- Applied least-privilege IAM roles
- Hosted frontend on Vercel
- Delivered cost-efficient, automated image processing

---


##🌐 Live Deployment

Backend API https: https://<your-api-id>.execute-api.<region>.amazonaws.com/prod

Frontend (Vercel): https://image-recognition-using-aws-rekogni.vercel.app/

---

##🧪 Local Development

1️⃣ Clone the repo
```plaintext
git clone https://github.com/pardeep1916P/image-recognition-using-aws-rekognition.git
cd image-recognition-using-aws-rekognition
```
#2️⃣ Install frontend dependencies
```plaintext
npm install
```
#3️⃣ Install backend dependencies
```plaintext
cd ../server
npm install
```
#4️⃣ Start backend locally
```plaintext
npm start
```

---
##📂 Project Structure

```plaintext
client/
 ├── build/
 │    ├── static/                 # Compiled frontend assets
 │    ├── asset-manifest.json
 │    ├── index.html
 │    └── logo.png
 ├── public/
 │    ├── index.html               # Public HTML entry point
 │    └── logo.png
 ├── src/
 │    ├── components/              # React components
 │    │    └── App.tsx
 │    ├── index.css
 │    ├── index.tsx
 │    └── utils.ts                  # Helper functions
 ├── package-lock.json
 ├── package.json
 └── tsconfig.json
server/
 ├── index.js                       # Backend entry point
 ├── package-lock.json
 └── package.json
```

---
##✅ Impact

- Created a secure, scalable AWS-based image recognition platform
- Reduced storage costs via automatic deletion
- Ensured high availability with EC2 deployment
- Improved data privacy with API Gateway + IAM
- Delivered a modern, fast, and responsive UI via Vercel
