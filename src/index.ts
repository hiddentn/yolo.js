import * as tf from '@tensorflow/tfjs';

import {
  yolov3Config,
  tinyYOLOv3Config,
  tinyYOLOv2Config,
  tinyYOLOLiteConfig,
  Detector,
} from './detector/index';

module.exports = {
  yolov3Config,
  tinyYOLOv3Config,
  tinyYOLOv2Config,
  tinyYOLOLiteConfig,
  Detector,
  tf,
};