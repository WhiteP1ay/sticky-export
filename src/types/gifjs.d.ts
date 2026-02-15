declare module 'gif.js.optimized' {
  class GIF {
    constructor(options: {
      workers?: number;
      quality?: number;
      width?: number;
      height?: number;
      backgroundColor?: string;
      transparent?: string | null;
      repeat?: number;
      dither?: boolean;
      workerScript?: string;
    });

    addFrame(canvas: CanvasRenderingContext2D | HTMLCanvasElement, options?: {
      delay?: number;
      copy?: boolean;
    }): void;

    render(): void;

    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
  }

  export default GIF;
}
