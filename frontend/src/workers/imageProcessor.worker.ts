/**
 * AgroScan AI - Dedicated Image Processing Web Worker.
 *
 * Runs offscreen on a secondary browser thread to prevent UI freezing
 * when farmers capture high-resolution photos (12MP - 48MP) on mobile devices.
 * Uses OffscreenCanvas to downscale to 1024x1024 max dimensions and compress to JPEG 0.85.
 */

import { WorkerProcessRequest, WorkerProcessResponse } from '../types';

// Web worker global scope listener
self.onmessage = async (event: MessageEvent<WorkerProcessRequest>) => {
  const startTime = performance.now();
  const { imageFile, maxWidth = 1024, maxHeight = 1024, quality = 0.85 } = event.data;

  try {
    if (!imageFile) {
      throw new Error('No image payload received for worker processing.');
    }

    const originalSizeBytes = imageFile.size;

    // Decode the image bitmap off the main thread
    const bitmap = await createImageBitmap(imageFile);
    const origWidth = bitmap.width;
    const origHeight = bitmap.height;

    // Calculate proportional dimensions maintaining aspect ratio
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (origWidth > maxWidth || origHeight > maxHeight) {
      const widthRatio = maxWidth / origWidth;
      const heightRatio = maxHeight / origHeight;
      const scalingFactor = Math.min(widthRatio, heightRatio);

      targetWidth = Math.round(origWidth * scalingFactor);
      targetHeight = Math.round(origHeight * scalingFactor);
    }

    // Allocate OffscreenCanvas for hardware-accelerated rasterization
    const offscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = offscreenCanvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('Unable to initialize 2D context on OffscreenCanvas.');
    }

    // Enable high-quality bilinear/bicubic resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw downscaled bitmap
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    // Free underlying ImageBitmap graphics memory immediately
    bitmap.close();

    // Export compressed JPEG Blob off-thread
    const optimizedBlob = await offscreenCanvas.convertToBlob({
      type: 'image/jpeg',
      quality: quality,
    });

    const optimizedSizeBytes = optimizedBlob.size;
    const compressionRatioPercent = Math.max(
      0,
      Math.round(((originalSizeBytes - optimizedSizeBytes) / originalSizeBytes) * 100)
    );
    const durationMs = Math.round(performance.now() - startTime);

    const response: WorkerProcessResponse = {
      success: true,
      optimizedBlob,
      originalWidth: origWidth,
      originalHeight: origHeight,
      optimizedWidth: targetWidth,
      optimizedHeight: targetHeight,
      originalSizeBytes,
      optimizedSizeBytes,
      compressionRatioPercent,
      durationMs,
    };

    // Return processed payload to main thread
    self.postMessage(response);
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - startTime);
    const response: WorkerProcessResponse = {
      success: false,
      error: error?.message || 'Unknown image processing worker error occurred.',
      durationMs,
    };
    self.postMessage(response);
  }
};
