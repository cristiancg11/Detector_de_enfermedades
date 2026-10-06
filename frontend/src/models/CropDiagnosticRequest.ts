/**
 * AgroScan AI - Crop Diagnostic Request Model (OOP Domain Layer).
 *
 * Encapsulates client-side parameters for phytosanitary analysis,
 * handles validation, and constructs multipart FormData for FastAPI transmission.
 */

import { CropType } from '../types';

export class CropDiagnosticRequest {
  private readonly _cropType: CropType;
  private readonly _plotIdentifier: string;
  private readonly _imageBlob: Blob;
  private readonly _fileName: string;
  private readonly _createdAt: Date;
  private readonly _compressionDurationMs?: number;
  private readonly _originalSizeBytes?: number;

  /**
   * Initializes a new CropDiagnosticRequest instance.
   */
  constructor(params: {
    cropType: CropType;
    plotIdentifier: string;
    imageBlob: Blob;
    fileName?: string;
    compressionDurationMs?: number;
    originalSizeBytes?: number;
  }) {
    this._cropType = params.cropType;
    this._plotIdentifier = params.plotIdentifier.trim();
    this._imageBlob = params.imageBlob;
    this._fileName = params.fileName || `crop_${params.cropType.toLowerCase()}_${Date.now()}.jpg`;
    this._createdAt = new Date();
    this._compressionDurationMs = params.compressionDurationMs;
    this._originalSizeBytes = params.originalSizeBytes;
  }

  // Getters
  public get cropType(): CropType {
    return this._cropType;
  }

  public get plotIdentifier(): string {
    return this._plotIdentifier;
  }

  public get imageBlob(): Blob {
    return this._imageBlob;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get compressionDurationMs(): number | undefined {
    return this._compressionDurationMs;
  }

  public get originalSizeBytes(): number | undefined {
    return this._originalSizeBytes;
  }

  public get optimizedSizeBytes(): number {
    return this._imageBlob.size;
  }

  /**
   * Validates integrity of request fields.
   * Throws an error if required attributes are missing or invalid.
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this._plotIdentifier) {
      errors.push('Plot identifier cannot be empty. Please designate a lot or greenhouse sector.');
    }

    const validCrops: CropType[] = ['Potato', 'Coffee', 'Corn', 'Tomato'];
    if (!validCrops.includes(this._cropType)) {
      errors.push(`Crop type '${this._cropType}' is not among supported Andean crops.`);
    }

    if (!this._imageBlob || this._imageBlob.size === 0) {
      errors.push('Image payload is empty or corrupt. Please capture or upload a valid leaf photo.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transforms this domain entity into a standard multipart/form-data payload
   * ready for FastAPI POST transmission.
   */
  public toFormData(): FormData {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
    }

    const formData = new FormData();
    formData.append('image', this._imageBlob, this._fileName);
    formData.append('crop_type', this._cropType);
    formData.append('plot_identifier', this._plotIdentifier);

    return formData;
  }

  /**
   * Returns formatted human-readable size of the optimized payload.
   */
  public getFormattedOptimizedSize(): string {
    const kb = this._imageBlob.size / 1024;
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
    return `${Math.round(kb)} KB`;
  }

  /**
   * Formatted summary of this inspection dispatch.
   */
  public getDispatchSummary(): string {
    return `Analysis request for ${this._cropType} on plot "${this._plotIdentifier}" (${this.getFormattedOptimizedSize()})`;
  }
}
