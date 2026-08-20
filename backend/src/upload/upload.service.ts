import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get<string>('cloudinary.cloudName'),
      api_key: this.config.get<string>('cloudinary.apiKey'),
      api_secret: this.config.get<string>('cloudinary.apiSecret'),
    });
  }

  uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (!this.config.get('cloudinary.cloudName')) {
      throw new InternalServerErrorException(
        'File uploads are not configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.',
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'task-manager', resource_type: 'auto' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(new InternalServerErrorException('File upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      // Non-fatal: an orphaned Cloudinary asset is not worth failing the request over.
    }
  }
}
