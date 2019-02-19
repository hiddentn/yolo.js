import { YOLODetector } from './yolo/yolo';
import * as tf from '@tensorflow/tfjs';
declare const YOLO: {
    TinyYOLOv2Config: import("./types").YOLODetectorConfig;
    YOLODetector: typeof YOLODetector;
    tf: typeof tf;
};
export { YOLO };
