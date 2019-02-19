import { YOLODetectorConfig } from '../types';
declare const TinyYOLOv3Config: YOLODetectorConfig;
declare const TinyYOLOv2Config: YOLODetectorConfig;
declare const YOLOv3Config: {
    version: string;
    modelSize: number;
    iouThreshold: number;
    classProbThreshold: number;
    labels: string[];
    anchors: number[][];
    masks: number[][];
    ResizeOption: {
        ResizeOption: string;
        AlignCorners: boolean;
    };
};
export { YOLOv3Config, TinyYOLOv2Config, TinyYOLOv3Config };
