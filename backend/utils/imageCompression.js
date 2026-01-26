/**
 * Image Compression Utility
 * Uses sharp to compress images while maintaining quality and dimensions
 */
import sharp from "sharp";

// Configuration for image compression - Target max 500KB
const COMPRESSION_CONFIG = {
  // Target maximum file size in bytes (strict 500KB limit)
  TARGET_SIZE_MAX: 500 * 1024, // 500KB - HARD LIMIT
  TARGET_SIZE_MIN: 300 * 1024, // 300KB

  // Quality settings for different formats (more aggressive)
  JPEG: {
    initialQuality: 85,
    minQuality: 40, // Lower minimum to ensure we hit target
    qualityStep: 5,
  },
  WEBP: {
    initialQuality: 85,
    minQuality: 40, // Lower minimum to ensure we hit target
    qualityStep: 5,
  },
  PNG: {
    compressionLevel: 9, // Max compression for PNG
    effort: 10,
  },

  // Maximum dimensions (reduced for better compression)
  MAX_WIDTH: 1600,
  MAX_HEIGHT: 1600,
};

/**
 * Check if the file is an image that can be processed by sharp
 */
export function isCompressibleImage(mimeType) {
  const compressibleTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/tiff",
  ];
  return compressibleTypes.includes(mimeType?.toLowerCase());
}

/**
 * Compress an image buffer to target file size while maintaining quality
 *
 * @param {Buffer} inputBuffer - Original image buffer
 * @param {string} mimeType - Original MIME type
 * @param {Object} options - Compression options
 * @returns {Object} - { buffer, mimeType, originalSize, compressedSize, wasCompressed }
 */
export async function compressImage(inputBuffer, mimeType, options = {}) {
  const config = { ...COMPRESSION_CONFIG, ...options };
  const originalSize = inputBuffer.length;

  // If already under target size and not forcing compression, skip
  if (originalSize <= config.TARGET_SIZE_MAX && !options.forceCompress) {
    console.log(
      `[ImageCompression] Image already within target size (${(originalSize / 1024).toFixed(1)}KB), skipping compression`,
    );
    return {
      buffer: inputBuffer,
      mimeType,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
    };
  }

  console.log(
    `[ImageCompression] Compressing image from ${(originalSize / 1024).toFixed(1)}KB`,
  );

  try {
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    console.log(
      `[ImageCompression] Original dimensions: ${metadata.width}x${metadata.height}`,
    );

    // Determine output format - prefer WebP for better compression, fallback to JPEG
    let outputFormat = "webp";
    let outputMimeType = "image/webp";

    // Keep PNG for images with transparency
    if (mimeType === "image/png" && metadata.hasAlpha) {
      outputFormat = "png";
      outputMimeType = "image/png";
    }

    // Start with original dimensions, but cap at max
    let targetWidth = Math.min(metadata.width, config.MAX_WIDTH);
    let targetHeight = Math.min(metadata.height, config.MAX_HEIGHT);

    // Calculate aspect ratio
    const aspectRatio = metadata.width / metadata.height;

    // If we need to resize to fit within max dimensions
    if (
      metadata.width > config.MAX_WIDTH ||
      metadata.height > config.MAX_HEIGHT
    ) {
      if (aspectRatio > 1) {
        // Landscape
        targetWidth = config.MAX_WIDTH;
        targetHeight = Math.round(config.MAX_WIDTH / aspectRatio);
      } else {
        // Portrait or square
        targetHeight = config.MAX_HEIGHT;
        targetWidth = Math.round(config.MAX_HEIGHT * aspectRatio);
      }
      console.log(
        `[ImageCompression] Resizing to ${targetWidth}x${targetHeight}`,
      );
    }

    // Initial compression pass
    let compressedBuffer;
    let quality =
      outputFormat === "webp"
        ? config.WEBP.initialQuality
        : config.JPEG.initialQuality;
    const minQuality =
      outputFormat === "webp" ? config.WEBP.minQuality : config.JPEG.minQuality;
    const qualityStep =
      outputFormat === "webp"
        ? config.WEBP.qualityStep
        : config.JPEG.qualityStep;

    // Start with resizing if needed
    let pipeline = sharp(inputBuffer);

    if (targetWidth !== metadata.width || targetHeight !== metadata.height) {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Iteratively compress until we hit target size or minimum quality
    while (quality >= minQuality) {
      if (outputFormat === "webp") {
        compressedBuffer = await pipeline
          .clone()
          .webp({ quality, effort: 6 })
          .toBuffer();
      } else if (outputFormat === "png") {
        compressedBuffer = await pipeline
          .clone()
          .png({
            compressionLevel: config.PNG.compressionLevel,
            effort: config.PNG.effort,
          })
          .toBuffer();
        // PNG doesn't have quality control, so break after first attempt
        break;
      } else {
        compressedBuffer = await pipeline
          .clone()
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
      }

      console.log(
        `[ImageCompression] Quality ${quality}: ${(compressedBuffer.length / 1024).toFixed(1)}KB`,
      );

      // Check if we've hit our target range
      if (compressedBuffer.length <= config.TARGET_SIZE_MAX) {
        console.log(
          `[ImageCompression] Target size achieved at quality ${quality}`,
        );
        break;
      }

      quality -= qualityStep;
    }

    // If still too large after quality reduction, progressively resize more aggressively
    if (
      compressedBuffer.length > config.TARGET_SIZE_MAX &&
      outputFormat !== "png"
    ) {
      console.log(
        `[ImageCompression] Still too large (${(compressedBuffer.length / 1024).toFixed(1)}KB), trying aggressive dimension reduction`,
      );

      let scaleFactor = 0.85;

      // More aggressive loop - go down to 30% if needed
      while (
        compressedBuffer.length > config.TARGET_SIZE_MAX &&
        scaleFactor >= 0.3
      ) {
        const newWidth = Math.round(targetWidth * scaleFactor);
        const newHeight = Math.round(targetHeight * scaleFactor);

        pipeline = sharp(inputBuffer).resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });

        if (outputFormat === "webp") {
          compressedBuffer = await pipeline
            .webp({ quality: minQuality, effort: 6 })
            .toBuffer();
        } else {
          compressedBuffer = await pipeline
            .jpeg({ quality: minQuality, mozjpeg: true })
            .toBuffer();
        }

        console.log(
          `[ImageCompression] Scale ${(scaleFactor * 100).toFixed(0)}% (${newWidth}x${newHeight}): ${(compressedBuffer.length / 1024).toFixed(1)}KB`,
        );

        // More aggressive step when far from target
        if (compressedBuffer.length > config.TARGET_SIZE_MAX * 1.5) {
          scaleFactor -= 0.15; // Bigger step when way over
        } else {
          scaleFactor -= 0.1;
        }
      }
    }

    const compressedSize = compressedBuffer.length;
    const savings = originalSize - compressedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    console.log(
      `[ImageCompression] Compression complete: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${savingsPercent}% reduction)`,
    );

    return {
      buffer: compressedBuffer,
      mimeType: outputMimeType,
      originalSize,
      compressedSize,
      wasCompressed: true,
      savings,
      savingsPercent: parseFloat(savingsPercent),
    };
  } catch (error) {
    console.error("[ImageCompression] Compression failed:", error.message);
    // Return original buffer if compression fails
    return {
      buffer: inputBuffer,
      mimeType,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      error: error.message,
    };
  }
}

/**
 * Get optimized file extension based on output format
 */
export function getOptimizedExtension(mimeType) {
  const extensionMap = {
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
  };
  return extensionMap[mimeType] || ".jpg";
}
