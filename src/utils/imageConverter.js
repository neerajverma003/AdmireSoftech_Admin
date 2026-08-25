/**
 * Image Converter Utility
 * Automatically converts raster images (JPEG, PNG, BMP, TIFF) to WebP format
 * using the browser's native C++ libwebp compression engine (HTML5 Canvas).
 * Bypasses non-images (PDF, DOCX) and preserves SVGs / animated GIFs.
 */

/**
 * Checks if a given file or mime type is a convertible raster image.
 * @param {File|Blob} file 
 * @returns {boolean}
 */
export const isConvertibleImage = (file) => {
  if (!file || !file.type) return false;
  const type = file.type.toLowerCase();
  
  // Must be an image
  if (!type.startsWith('image/')) return false;

  // Don't convert SVG (vector) or GIF (animation)
  if (type === 'image/svg+xml' || type === 'image/gif') return false;

  return true;
};

/**
 * Automatically converts an image File or Blob to WebP format.
 * If the file is not an image (e.g. PDF resume) or if conversion is not possible,
 * it returns the original file untouched.
 * 
 * @param {File|Blob} file - The file to convert
 * @param {Object} [options] - Conversion options
 * @param {number} [options.quality=0.85] - WebP quality compression ratio (0.0 to 1.0)
 * @param {number} [options.maxWidth=2560] - Optional maximum width constraint
 * @param {number} [options.maxHeight=2560] - Optional maximum height constraint
 * @returns {Promise<File|Blob>} - Converted WebP file (or original file on bypass/fallback)
 */
export const convertImageToWebP = async (file, options = {}) => {
  const {
    quality = 0.85,
    maxWidth = 2560,
    maxHeight = 2560,
  } = options;

  if (!isConvertibleImage(file)) {
    return file; // Bypass non-images, SVGs, and GIFs
  }

  return new Promise((resolve) => {
    // If the browser doesn't support Image or Canvas (rare SSR/old environments)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Maintain aspect ratio while respecting maximum bounds
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas contents to WebP Blob via native browser encoder
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original if encoding fails
            }

            // Create new WebP File preserving original base name
            const originalName = file.name || 'image.webp';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const webpFilename = `${baseName}.webp`;

            const webpFile = new File([blob], webpFilename, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      } catch (err) {
        console.warn('[imageConverter] WebP conversion failed, using original file:', err);
        resolve(file);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('[imageConverter] Failed to load image for conversion, using original file:', err);
      resolve(file);
    };

    img.src = objectUrl;
  });
};
