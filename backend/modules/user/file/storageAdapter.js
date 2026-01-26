import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class StorageAdapter {
  async upload(fileBuffer, fileName, mimeType, folder) {
    throw new Error("Method not implemented");
  }

  async delete(relativePath) {
    throw new Error("Method not implemented");
  }

  async generateReadUrl(relativePath, expiresIn) {
    throw new Error("Method not implemented");
  }

  async checkExists(relativePath) {
    throw new Error("Method not implemented");
  }
}

export class S3StorageAdapter extends StorageAdapter {
  constructor(config) {
    super();
    this.bucketName = config.bucketName;
    this.client = new S3Client(config.clientConfig);
  }

  async upload(fileBuffer, fileName, mimeType, folder) {
    const s3Key = `${folder}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
    });
    await this.client.send(command);
    return s3Key;
  }

  async delete(relativePath) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: relativePath,
    });
    await this.client.send(command);
    return true;
  }

  async generateReadUrl(relativePath, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: relativePath,
    });
    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async checkExists(relativePath) {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: relativePath,
        }),
      );
      return true;
    } catch (error) {
      if (error.name === "NotFound") return false;
      throw error;
    }
  }
}

// Factory to create the right adapter
export function createStorageAdapter() {
  const AWS_REGION = process.env.AWS_REGION;
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

  if (
    !AWS_REGION ||
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !BUCKET_NAME
  ) {
    throw new Error(
      "S3 Configuration Missing: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME are required.",
    );
  }

  console.log("Using S3 Storage Adapter");
  return new S3StorageAdapter({
    bucketName: BUCKET_NAME,
    clientConfig: {
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    },
  });
}
