declare module 'gifenc' {
  interface GIFEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  interface WriteFrameOptions {
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    palette?: number[][];
    repeat?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  interface GifEncoder {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    writeHeader(): void;
    writeFrame(index: Uint8Array, width: number, height: number, options?: WriteFrameOptions): void;
    get buffer(): ArrayBuffer;
    get stream(): any;
  }

  function GIFEncoder(options?: GIFEncoderOptions): GifEncoder;
  function quantize(data: Uint8ClampedArray, maxColors: number): number[][];
  function applyPalette(data: Uint8ClampedArray, palette: number[][]): Uint8Array;

  export {
    GIFEncoder,
    quantize,
    applyPalette
  };
}
