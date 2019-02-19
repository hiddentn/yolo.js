import  { TinyYOLOv2Config } from './yolo/config';
import  { YOLODetector } from './yolo/yolo';
import * as tf from '@tensorflow/tfjs';

const YOLO = {
    TinyYOLOv2Config,
    YOLODetector,
    tf,
}

export {YOLO}