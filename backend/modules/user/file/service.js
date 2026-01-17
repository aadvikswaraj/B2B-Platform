// service.js - File service with AWS S3 operations
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from "../../../models/model.js";
import crypto from "crypto";
import path from "path";

// Validate AWS config
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.warn("⚠️  AWS S3 not configured. File uploads will fail.");
  console.warn("   Required env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME");
}

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION || "us-east-1",
  credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function uploadFile(file, fileBuffer, folder = "uploads") {
  // Check S3 configuration
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME not configured");
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured");
  }

  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname || "");
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${fileExt}`;
    const s3Key = `${folder}/${uniqueName}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.mimetype
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Save file metadata to MongoDB
    const fileDoc = new File({
      originalName: file.originalname,
      fileName: uniqueName,
      relativePath: s3Key,
      mimeType: file.mimetype,
      size: file.size
    });

    await fileDoc.save();
    return fileDoc;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

export async function deleteFile(fileId) {
  try {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      throw new Error("File not found");
    }
    // Delete from S3
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: fileDoc.relativePath,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    
    // Delete from MongoDB
    await File.findByIdAndDelete(fileId);
    
    return true;
  } catch (error) {
    throw new Error("Failed to delete file");
  }
}

export async function generateReadUrl(fileId) {
  try {
    const expiresIn = 3600; // Default to 1 hour
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      throw new Error("File not found");
    }

    // Check if file exists in S3
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileDoc.relativePath,
        })
      );
    } catch (error) {
      if (error.name === "NotFound") {
        await File.findByIdAndDelete(fileId); // Clean up DB record
        throw new Error("File not found in storage");
      }
      throw error;
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileDoc.relativePath,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      _id: fileDoc._id,
      originalName: fileDoc.originalName,
      fileName: fileDoc.fileName,
      mimeType: fileDoc.mimeType,
      size: fileDoc.size,
      url,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  } catch (error) {
    throw new Error("Failed to generate file URL");
  }
}
