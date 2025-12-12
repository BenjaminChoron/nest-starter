import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder?: string): Promise<string> {
    const defaultFolder = this.configService.get<string>('CLOUDINARY_DEFAULT_FOLDER', 'profile-pictures');
    const imageWidth = this.configService.get<string | number>('CLOUDINARY_IMAGE_WIDTH', 500);
    const imageHeight = this.configService.get<string | number>('CLOUDINARY_IMAGE_HEIGHT', 500);
    const imageQuality = this.configService.get<string>('CLOUDINARY_IMAGE_QUALITY', 'auto:good');

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder || defaultFolder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
          transformation: [
            { width: Number(imageWidth), height: Number(imageHeight), crop: 'limit' },
            { quality: imageQuality },
          ],
        },
        (error, result) => {
          if (error) return reject(new Error(error.message || 'Upload failed'));
          if (!result?.secure_url) return reject(new Error('Upload failed: No URL returned'));
          resolve(result.secure_url);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async deleteImage(publicUrl: string): Promise<void> {
    try {
      const publicId = this.getPublicIdFromUrl(publicUrl);
      if (!publicId) return;

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }

  private getPublicIdFromUrl(url: string): string | null {
    try {
      if (!url.startsWith('https://res.cloudinary.com/')) {
        return null;
      }

      const urlParts = url.split('/');
      // We expect: https://res.cloudinary.com/cloud-name/folder/filename.ext
      // So minimum 5 parts: ['https:', '', 'res.cloudinary.com', 'cloud-name', 'folder', 'filename.ext']
      if (urlParts.length < 6) {
        return null;
      }

      const filename = urlParts[urlParts.length - 1];
      if (!filename.includes('.')) {
        return null;
      }

      const publicId = filename.split('.')[0];
      const folder = urlParts[urlParts.length - 2];
      return `${folder}/${publicId}`;
    } catch {
      return null;
    }
  }
}
