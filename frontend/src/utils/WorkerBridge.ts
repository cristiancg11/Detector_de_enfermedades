/**
 * AgroScan AI - Web Worker Bridge Manager.
 *
 * Implements a robust bridge to communicate asynchronously with dedicated Web Workers.
 * Features promise-based request/response correlation, automatic worker lifecycle management,
 * timeout handling, and graceful main-thread fallback if Web Workers are unavailable.
 */

import { WorkerProcessRequest, WorkerProcessResponse } from '../types';

export class WorkerBridge {
  private static instance: WorkerBridge | null = null;
  private worker: Worker | null = null;
  private isProcessing: boolean = false;
  private pendingResolvers: Map<
    string,
    {
      resolve: (value: WorkerProcessResponse) => void;
      reject: (reason?: any) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  > = new Map();

  private constructor() {
    this.initWorker();
  }

  /**
   * Singleton accessor for global WorkerBridge instance.
   */
  public static getInstance(): WorkerBridge {
    if (!WorkerBridge.instance) {
      WorkerBridge.instance = new WorkerBridge();
    }
    return WorkerBridge.instance;
  }

  /**
   * Initializes or recreates the underlying Worker thread.
   */
  private initWorker(): void {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      console.warn('[WorkerBridge] Web Workers are not supported in this runtime environment.');
      return;
    }

    try {
      this.worker = new Worker(
        new URL('../workers/imageProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerProcessResponse>) => {
        this.isProcessing = false;
        // Resolve all active pending requests
        this.pendingResolvers.forEach(({ resolve, timer }) => {
          clearTimeout(timer);
          resolve(event.data);
        });
        this.pendingResolvers.clear();
      };

      this.worker.onerror = (errorEvent: ErrorEvent) => {
        this.isProcessing = false;
        console.error('[WorkerBridge] Worker error encountered:', errorEvent);
        this.pendingResolvers.forEach(({ reject, timer }) => {
          clearTimeout(timer);
          reject(new Error(errorEvent.message || 'Worker thread execution failed.'));
        });
        this.pendingResolvers.clear();
      };
    } catch (err) {
      console.error('[WorkerBridge] Failed to instantiate worker:', err);
      this.worker = null;
    }
  }

  /**
   * Dispatches an image processing job to the background worker.
   *
   * @param imageFile The raw File, Blob, base64 data URI, or ArrayBuffer.
   * @param options Processing parameters (dimensions, quality, base64 conversion).
   * @param timeoutMs Maximum allowable wait duration before aborting.
   */
  public async processImage(
    imageFile: File | Blob | string | ArrayBuffer,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      convertToBase64?: boolean;
    } = {},
    timeoutMs: number = 20000
  ): Promise<WorkerProcessResponse> {
    // Fallback if worker is not initialized or supported
    if (!this.worker) {
      console.warn('[WorkerBridge] Worker unavailable. Returning uncompressed fallback.');
      return this.fallbackProcess(imageFile);
    }

    const payload: WorkerProcessRequest = {
      imageFile,
      maxWidth: options.maxWidth ?? 1024,
      maxHeight: options.maxHeight ?? 1024,
      quality: options.quality ?? 0.85,
      convertToBase64: options.convertToBase64 ?? false,
    };

    return new Promise<WorkerProcessResponse>((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timer = setTimeout(() => {
        this.pendingResolvers.delete(requestId);
        this.isProcessing = false;
        reject(new Error(`[WorkerBridge] Request timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      this.pendingResolvers.set(requestId, { resolve, reject, timer });
      this.isProcessing = true;

      try {
        this.worker!.postMessage(payload);
      } catch (postErr) {
        clearTimeout(timer);
        this.pendingResolvers.delete(requestId);
        this.isProcessing = false;
        reject(postErr);
      }
    });
  }

  /**
   * Safe synchronous fallback if workers are not supported.
   */
  private fallbackProcess(imageFile: File | Blob | string | ArrayBuffer): WorkerProcessResponse {
    const isBlob = imageFile instanceof Blob;
    const blob = isBlob ? imageFile : new Blob([]);
    return {
      success: true,
      optimizedBlob: blob,
      originalSizeBytes: blob.size,
      optimizedSizeBytes: blob.size,
      compressionRatioPercent: 0,
      durationMs: 0,
    };
  }

  /**
   * Check if worker is currently busy.
   */
  public get isBusy(): boolean {
    return this.isProcessing;
  }

  /**
   * Terminates worker and cleans up resources.
   */
  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingResolvers.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error('[WorkerBridge] Worker was terminated.'));
    });
    this.pendingResolvers.clear();
    this.isProcessing = false;
    WorkerBridge.instance = null;
  }
}

