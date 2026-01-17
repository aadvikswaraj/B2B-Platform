/**
 * File Cleanup Utility
 * 
 * This utility handles safe file deletion to avoid data loss when:
 * 1. User removes file from form but doesn't save
 * 2. User uploads new file (replacing old one) but doesn't save
 * 
 * Instead of immediate deletion, files are tracked and cleaned up
 * when the actual entity (category, brand, etc.) is saved.
 * 
 * Usage:
 * - When updating an entity with a new file, call cleanupOldFile()
 * - Pass the old file ID that should be deleted after successful save
 */

import { File } from "../models/model.js";
import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Initialize S3 client (reuse from file service pattern)
const s3Client = new S3Client({
  region: AWS_REGION || "us-east-1",
  credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

/**
 * Delete a file from S3 and MongoDB
 * @param {string} fileId - MongoDB ObjectId of the file to delete
 * @returns {Promise<boolean>} - true if deleted, false if not found
 */
export async function deleteFileById(fileId) {
  if (!fileId) return false;
  
  try {
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return false; // File doesn't exist, nothing to delete
    }

    // Delete from S3 if path exists
    if (fileDoc.relativePath && BUCKET_NAME) {
      try {
        const deleteParams = {
          Bucket: BUCKET_NAME,
          Key: fileDoc.relativePath,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      } catch (s3Error) {
        // Log but don't fail - S3 file might already be deleted
        console.warn(`S3 delete warning for ${fileId}:`, s3Error.message);
      }
    }

    // Delete from MongoDB
    await File.findByIdAndDelete(fileId);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    throw error;
  }
}

/**
 * Safely cleanup old file when entity is updated with new file
 * Call this AFTER successful entity save to avoid orphaned files
 * 
 * @param {string} oldFileId - The old file ID to delete
 * @param {string} newFileId - The new file ID (to ensure we don't delete it)
 * @returns {Promise<boolean>} - true if cleaned up, false otherwise
 */
export async function cleanupOldFile(oldFileId, newFileId) {
  // Don't delete if same file or no old file
  if (!oldFileId || oldFileId === newFileId) {
    return false;
  }

  // Convert ObjectIds to strings for comparison
  const oldId = oldFileId?.toString?.() || oldFileId;
  const newId = newFileId?.toString?.() || newFileId;

  if (oldId === newId) {
    return false;
  }

  try {
    return await deleteFileById(oldId);
  } catch (error) {
    // Log but don't throw - cleanup failure shouldn't break the main operation
    console.error(`Failed to cleanup old file ${oldId}:`, error);
    return false;
  }
}

/**
 * Cleanup multiple old files when entity is updated
 * Useful for entities with multiple file fields
 * 
 * @param {Array<{oldFileId: string, newFileId: string}>} filePairs - Array of old/new file ID pairs
 * @returns {Promise<number>} - Number of files successfully cleaned up
 */
export async function cleanupOldFiles(filePairs) {
  if (!Array.isArray(filePairs) || filePairs.length === 0) {
    return 0;
  }

  let cleanedCount = 0;
  
  for (const { oldFileId, newFileId } of filePairs) {
    const cleaned = await cleanupOldFile(oldFileId, newFileId);
    if (cleaned) cleanedCount++;
  }

  return cleanedCount;
}

/**
 * Get file info without generating signed URL
 * Useful for checking if file exists before cleanup
 * 
 * @param {string} fileId - MongoDB ObjectId of the file
 * @returns {Promise<Object|null>} - File document or null
 */
export async function getFileInfo(fileId) {
  if (!fileId) return null;
  
  try {
    return await File.findById(fileId).lean();
  } catch (error) {
    return null;
  }
}
