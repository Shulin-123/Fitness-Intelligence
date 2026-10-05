// Image Utilities: Client-Side Resize and EXIF Stripping
// Ensures uploaded plate photos are never larger than 1024px and contain zero geolocation or camera metadata.

export async function processPlateImage(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  processedSizeBytes: number;
}> {
  return new Promise((resolve, reject) => {
    // Check file size (max 20MB raw input)
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image exceeds 20MB limit. Please choose a smaller photo.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        // Compute target dimensions (max 1024px on longest edge)
        const maxDim = 1024;
        let targetW = img.width;
        let targetH = img.height;

        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        // Draw to offscreen canvas (this naturally strips all EXIF metadata)
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // High quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Export as clean JPEG without metadata
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const processedSizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
          originalSizeBytes: file.size,
          processedSizeBytes,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
