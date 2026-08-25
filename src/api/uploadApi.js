import { apiRequest } from './client';
import { convertImageToWebP } from '../utils/imageConverter';

/**
 * Upload a file directly to AWS S3 using a Presigned PUT URL with contextual folder hierarchy.
 * Automatically converts image files (JPEG, PNG, BMP, TIFF) to WebP format before upload.
 * Non-image files (PDFs, DOCX resumes) pass through untouched.
 *
 * @param {File} file - The file object from <input type="file" />
 * @param {Object|string} options - Upload context options or legacy folder string
 * @param {string} [options.module='avatars'] - 'avatars' | 'careers' | 'freelance' | 'assets'
 * @param {string} [options.category=''] - User role or asset category
 * @param {string} [options.experience=''] - Additional metadata
 * @param {string} [options.email=''] - User email address
 * @param {string} [options.candidateName=''] - User or administrator full name
 * @param {string} [options.folder=''] - Custom folder fallback
 * @param {number} [options.quality=0.85] - WebP compression quality (0.0 to 1.0)
 * @returns {Promise<{ publicUrl: string, previewUrl: string, key: string, fileName: string }>}
 */
export const uploadFileToS3 = async (file, options = {}) => {
  if (!file) throw new Error('No file provided for upload');

  // Support both object options and legacy folder string parameter
  const uploadOptions = typeof options === 'string'
    ? { folder: options, module: options }
    : options;

  const {
    module = 'avatars',
    category = '',
    experience = '',
    email = '',
    candidateName = '',
    folder = '',
    quality = 0.85,
  } = uploadOptions;

  try {
    // 1. Automatically convert image to optimized WebP format (bypasses non-images/PDFs/SVGs)
    const fileToUpload = await convertImageToWebP(file, { quality });

    // 2. Request Presigned PUT URL with contextual metadata
    const presignedData = await apiRequest('/upload/generate-presigned-url', {
      method: 'POST',
      body: JSON.stringify({
        filename: fileToUpload.name,
        contentType: fileToUpload.type || 'application/octet-stream',
        module,
        category,
        experience,
        email: email || candidateName,
        candidateName,
        folder,
      }),
    });

    if (!presignedData || !presignedData.presignedUrl) {
      throw new Error(presignedData?.message || 'Failed to acquire S3 presigned URL');
    }

    const { presignedUrl, publicUrl, previewUrl, key } = presignedData;

    // 3. Direct HTTP PUT upload from Browser directly to Amazon S3
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileToUpload.type || 'application/octet-stream',
      },
      body: fileToUpload,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Direct S3 upload failed with HTTP status: ${uploadResponse.status}`);
    }

    return {
      publicUrl,
      previewUrl,
      key,
      fileName: fileToUpload.name,
    };
  } catch (err) {
    console.error('[UploadApi] Error during direct S3 upload:', err);
    throw err;
  }
};
