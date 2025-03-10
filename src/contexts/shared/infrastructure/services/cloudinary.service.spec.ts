import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { Writable } from 'stream';

type CloudinaryCallback = (error: Error | null, result: { secure_url?: string } | null) => void;

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockConfig = {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key: keyof typeof mockConfig) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure cloudinary with correct credentials', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: mockConfig.CLOUDINARY_CLOUD_NAME,
      api_key: mockConfig.CLOUDINARY_API_KEY,
      api_secret: mockConfig.CLOUDINARY_API_SECRET,
    });
  });

  describe('uploadImage', () => {
    const mockFile = {
      buffer: Buffer.from('test-image'),
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    it('should successfully upload an image', async () => {
      const mockSecureUrl = 'https://cloudinary.com/test-image.jpg';

      const mockWritableStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      const mockUploadStream = jest.fn().mockImplementation((options: unknown, callback: CloudinaryCallback) => {
        process.nextTick(() => {
          callback(null, { secure_url: mockSecureUrl });
        });
        return mockWritableStream;
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      const result = await service.uploadImage(mockFile);
      expect(result).toBe(mockSecureUrl);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'profile-pictures',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        }),
        expect.any(Function),
      );
    });

    it('should throw error when upload fails', async () => {
      const mockError = new Error('Upload failed');

      const mockWritableStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      const mockUploadStream = jest.fn().mockImplementation((options: unknown, callback: CloudinaryCallback) => {
        process.nextTick(() => {
          callback(mockError, null);
        });
        return mockWritableStream;
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should throw error when no secure URL is returned', async () => {
      const mockWritableStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      const mockUploadStream = jest.fn().mockImplementation((options: unknown, callback: CloudinaryCallback) => {
        process.nextTick(() => {
          callback(null, { secure_url: undefined });
        });
        return mockWritableStream;
      });

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(mockUploadStream);

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed: No URL returned');
    });
  });

  describe('deleteImage', () => {
    it('should successfully delete an image', async () => {
      const mockUrl = 'https://res.cloudinary.com/test-cloud/profile-pictures/test-image.jpg';
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      await service.deleteImage(mockUrl);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('profile-pictures/test-image');
    });

    it('should handle invalid URLs gracefully', async () => {
      const invalidUrls = [
        'invalid-url',
        'http://wrong-domain.com/image.jpg',
        'https://res.cloudinary.com',
        'https://res.cloudinary.com/test-cloud',
      ];

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      for (const invalidUrl of invalidUrls) {
        jest.clearAllMocks();
        await service.deleteImage(invalidUrl);
        expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle deletion errors gracefully', async () => {
      const mockUrl = 'https://res.cloudinary.com/test-cloud/profile-pictures/test-image.jpg';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Deletion failed');

      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(mockError);

      await service.deleteImage(mockUrl);

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting image from Cloudinary:', mockError);
      consoleSpy.mockRestore();
    });
  });
});
