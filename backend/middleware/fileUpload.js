import multer from "multer";
import path from "path";
import fs from "fs";
import { File } from "../models/model.js";

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

// Middleware: handles upload, saves to DB, attaches filesId to req, cleans up on error
export function uploadAndSaveFiles(fields) {
  const upload = multer({ storage }).fields(fields);
  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        res.locals.response.success = false;
        res.locals.response.status = 400;
        res.locals.response.message = "File upload error";
        return sendResponse(res);
      }
      try {
        if (!req.files) return next();
        const filesArr = Object.values(req.files).flat();
        const filesId = {};
        for (const file of filesArr) {
          const dbFile = await File.create({
            originalName: file.originalname,
            fileName: file.filename,
            relativePath: path.relative(process.cwd(), file.path),
            mimeType: file.mimetype,
            size: file.size,
          });
          filesId[file.fieldname] = dbFile._id;
        }
        req.filesId = filesId;
        next();
      } catch (e) {
        // Cleanup: delete files from disk and DB
        const filesArr = Object.values(req.files).flat();
        for (const file of filesArr) {
          if (file?.path && fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch {}
          }
          if (file?.filename) {
            await File.deleteOne({ fileName: file.filename });
          }
        }
        res.locals.response.success = false;
        res.locals.response.message = "File save error";
        res.locals.response.status = 500;
        return sendResponse(res);
      }
    });
  };
}

// Utility: delete one or many files (by DB _id or file object) from disk and DB
export async function deleteFiles(filesOrIds) {
  if (!filesOrIds) return;
  const arr = Array.isArray(filesOrIds) ? filesOrIds : [filesOrIds];
  for (const item of arr) {
    let dbFile = null;
    if (typeof item === "string" || typeof item === "number") {
      // Assume it's a DB _id
      dbFile = await File.findById(item);
    } else if (item && item._id) {
      dbFile = item;
    }
    if (dbFile) {
      const absPath = path.join(process.cwd(), dbFile.relativePath);
      if (fs.existsSync(absPath)) {
        try { fs.unlinkSync(absPath); } catch {}
      }
      await File.deleteOne({ _id: dbFile._id });
    }
  }
}