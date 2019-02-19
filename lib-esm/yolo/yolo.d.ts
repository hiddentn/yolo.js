import { YOLODetectorConfig, YOLOInput, Detection, YOLOVersion, ImageOptions, modelSize } from '../types';
import * as tf from '@tensorflow/tfjs';
interface IYOLODetector {
    Model: tf.Model;
    Load(): Promise<Boolean>;
    Cache(): Promise<void>;
    Dispose(): void;
    DetectSync(image: YOLOInput): Detection[];
}
export declare class YOLODetector implements IYOLODetector, YOLODetectorConfig {
    modelURL: string;
    version: YOLOVersion;
    modelSize: modelSize;
    iouThreshold: number;
    classProbThreshold: number;
    labels: string[];
    classesLength: number;
    anchors: number[][];
    masks: number[][];
    ResizeOption: ImageOptions;
    Model: tf.Model;
    constructor(options?: YOLODetectorConfig);
    Load(): Promise<Boolean>;
    Cache(): Promise<void>;
    Dispose(): void;
    Detect(image: YOLOInput): Promise<Detection[]>;
    DetectSync(image: YOLOInput): any;
    preProcess(img: YOLOInput): [number, number, tf.Tensor];
    private postProcessRawPrediction;
    private processFeats;
    private rescaleBoxes;
    private boxesToCorners;
    private filterBoxesSync;
    private boxIOU;
    private iou;
    private finnalize;
    private isTensorOrTensorArray;
}
export {};
