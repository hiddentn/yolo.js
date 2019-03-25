import {
  Input,
  Detection,
  YOLOVersion,
  ImageOptions,
  modelSize
} from "../types";
interface Detector {
  load(): Promise<boolean>;
  cache(): void;
  dispose(): void;
  detectAsync(image: Input): Promise<Detection[]>;
  detect(image: Input): Detection[];
  detectAsyncCPU(image: Input): Promise<Detection[]>;
  detectCPU(image: Input): Detection[];
  draw(detections: Detection[], canvas: HTMLCanvasElement): void;
}

interface DetectorConfig {
  modelName: string;
  modelURL: string;

  iouThreshold: number;
  classProbThreshold: number;
  maxOutput: number;
  labels: string[];
  //misc
  resizeOption: ImageOptions;
}
interface YOLODetectorConfig extends DetectorConfig {
  
  version: YOLOVersion;
  modelSize: modelSize;
  anchors: number[][];
  masks: number[][];
}
export { Detector, YOLODetectorConfig, DetectorConfig };
