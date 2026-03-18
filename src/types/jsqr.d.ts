declare module 'jsqr' {
  export interface QRCode {
    data: string;
    chunks?: unknown[];
    version?: number;
    location?: unknown;
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): QRCode | null;
}

