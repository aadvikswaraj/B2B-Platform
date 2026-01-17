import { sendResponse } from "../../../middleware/responseTemplate.js";
import * as fileService from "./service.js";

/**
 * Upload file - receives raw binary body with metadata in headers
 */
export async function uploadFile(req, res) {
  try {
    // Get metadata from headers
    const originalName = req.headers["x-file-name"];
    const mimeType = req.headers["content-type"];
    const folder = req.headers["x-folder"] || "uploads";
    const fileBuffer = req.body; // raw Buffer

    if (!originalName || !mimeType || !fileBuffer?.length) {
      res.locals.response = {
        success: false,
        message: "Missing file data or headers (x-file-name, content-type)",
        status: 400,
      };
      return sendResponse(res);
    }

    // Build file object for service
    const file = {
      originalname: decodeURIComponent(originalName),
      mimetype: mimeType,
      size: fileBuffer.length,
    };

    const fileDoc = await fileService.uploadFile(file, fileBuffer, folder);
    res.locals.response = {
      success: true,
      message: "File uploaded successfully",
      status: 201,
      data: fileDoc,
    };
  } catch (error) {
    console.error("Upload file error:", error);
    res.locals.response = {
      success: false,
      message: error.message || "Failed to upload file",
      status: 500,
    };
  }
  return sendResponse(res);
}

export async function removeFile(req, res) {
  try {
    const { fileId } = req.params;

    await fileService.deleteFile(fileId);
    
    res.locals.response = {
      success: true,
      message: "File deleted successfully",
      status: 200,
    };
  
  } catch (error) {
    console.error("Delete file error:", error);
    res.locals.response = {
      success: false,
      message:  "Failed to delete file" + (error.message || "Unknown error"),
      status: 500,
    };
  }
  return sendResponse(res);
}

export async function getFileById(req, res) {
  try {
    const { fileId } = req.params;
    const fileData = await fileService.generateReadUrl(fileId);
    res.locals.response = {
      success: true,
      data: { file: fileData },
      message: "File URL generated successfully",
      status: 200,
    };
  } catch (error) {
    res.locals.response = {
      success: false,
      message: "Failed to generate file URL: " + (error.message || "Unknown error"),
      status: error.message?.includes("not found") ? 404 : 500,
    };
  }
  return sendResponse(res);
}

export async function redirectFileUrl(req, res) {
  try {
    const { fileId } = req.params;
    const fileData = await fileService.generateReadUrl(fileId);
    return res.redirect(fileData.url);
  } catch (error) {
    res.locals.response = {
      success: false,
      message: "Failed to redirect file URL: " + (error.message || "Unknown error"),
      status: error.message?.includes("not found")
        ? 404
        : 500,
    };
    return sendResponse(res);
  }
}
