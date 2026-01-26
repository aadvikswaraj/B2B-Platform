// service.js - File service with StorageAdapter
import { File } from "../../../models/model.js";
import crypto from "crypto";
import path from "path";
import {
  compressImage,
  isCompressibleImage,
  getOptimizedExtension,
} from "../../../utils/imageCompression.js";
import { createStorageAdapter } from "./storageAdapter.js";

// Initialize Storage Adapter
const storage = createStorageAdapter();

export async function uploadFile(file, fileBuffer, folder = "uploads") {
  try {
    let finalBuffer = fileBuffer;
    let finalMimeType = file.mimetype;
    let finalSize = file.size;
    let compressionInfo = null;

    // Compress images if applicable
    if (isCompressibleImage(file.mimetype)) {
      console.log(
        `[FileService] Processing image: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`,
      );

      const result = await compressImage(fileBuffer, file.mimetype);

      finalBuffer = result.buffer;
      finalMimeType = result.mimeType;
      finalSize = result.compressedSize;

      if (result.wasCompressed) {
        compressionInfo = {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savings: result.savings,
          savingsPercent: result.savingsPercent,
        };
        console.log(
          `[FileService] Image compressed: ${result.savingsPercent}% reduction`,
        );
      }
    }

    // Generate unique filename with appropriate extension
    const fileExt = isCompressibleImage(file.mimetype)
      ? getOptimizedExtension(finalMimeType)
      : path.extname(file.originalname || "");
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${fileExt}`;

    // Upload using adapter
    const relativePath = await storage.upload(
      finalBuffer,
      uniqueName,
      finalMimeType,
      folder,
    );

    // Save file metadata to MongoDB
    const fileDoc = new File({
      originalName: file.originalname,
      fileName: uniqueName,
      relativePath: relativePath,
      mimeType: finalMimeType,
      size: finalSize,
      // Store compression info for analytics if needed
      ...(compressionInfo && {
        compression: compressionInfo,
      }),
    });

    await fileDoc.save();
    return fileDoc;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}

export async function deleteFile(fileId) {
  try {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      throw new Error("File not found");
    }

    // Delete from Storage
    await storage.delete(fileDoc.relativePath);

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

    // Check if file exists in Storage
    const exists = await storage.checkExists(fileDoc.relativePath);
    if (!exists) {
      await File.findByIdAndDelete(fileId); // Clean up DB record
      throw new Error("File not found in storage");
    }

    // Generate URL
    const url = await storage.generateReadUrl(fileDoc.relativePath, expiresIn);

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
    throw new Error("Failed to generate file URL: " + error.message);
  }
}
