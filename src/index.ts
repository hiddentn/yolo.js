import  { TinyYOLOv2Config } from './yolo/config';
import  { YOLODetector } from './yolo/yolo';
import * as tf from '@tensorflow/tfjs';

module.exports = {
    TinyYOLOv2Config,
    YOLODetector,
    tf,
  };