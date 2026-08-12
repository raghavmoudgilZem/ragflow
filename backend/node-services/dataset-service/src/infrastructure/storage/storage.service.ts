import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class StorageService implements OnModuleInit {
  private storageType: string;
  private minioClient: Minio.Client;
  private bucketName: string;
  private uploadDir: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.storageType = this.configService.get("storage.type");

    if (this.storageType === "minio") {
      this.minioClient = new Minio.Client({
        endPoint: this.configService.get("storage.endpoint"),
        port: this.configService.get("storage.port"),
        useSSL: this.configService.get("storage.useSSL"),
        accessKey: this.configService.get("storage.accessKey"),
        secretKey: this.configService.get("storage.secretKey"),
      });

      this.bucketName = this.configService.get("storage.bucketName");

      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, "us-east-1");
      }
    } else {
      this.uploadDir = path.join(
        process.cwd(),
        this.configService.get("storage.uploadDir"),
      );
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(fileName: string, buffer: Buffer): Promise<void> {
    if (this.storageType === "minio") {
      await this.minioClient.putObject(this.bucketName, fileName, buffer);
    } else {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
    }
  }

  async getFile(fileName: string): Promise<Buffer> {
    if (this.storageType === "minio") {
      const stream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    } else {
      const filePath = path.join(this.uploadDir, fileName);
      return await fs.readFile(filePath);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (this.storageType === "minio") {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } else {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    }
  }
}
