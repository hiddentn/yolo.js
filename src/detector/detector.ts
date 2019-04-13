import { Detection, ImageOptions, Input, modelSize, YOLOVersion } from '../types';
interface Detector {
  load(): Promise<void>;
  cache(): Promise<void>;
  dispose(): void;
  detect(image: Input): Promise<Detection[]>;
  detectSync(image: Input): Detection[];
  draw(detections: Detection[], canvas: HTMLCanvasElement): void;
}

interface DetectorConfig {
  modelName: string;
  modelURL: string;
  iouThreshold: number;
  classProbThreshold: number;
  maxOutput: number;
  labels: string[];
  resizeOption: ImageOptions;
}
interface YOLODetectorConfig extends DetectorConfig {
  version: YOLOVersion;
  modelSize: modelSize;
  anchors: number[][];
  masks: number[][];
}
export { Detector, YOLODetectorConfig, DetectorConfig };
