import {
  yolov3Config,
  tinyYOLOv3Config,
  tinyYOLOv2Config,
  tinyYOLOLiteConfig,
  YOLODetector
} from "./detector/index";

import {
  darknetRefrenceConfig,
  darknet19Config,
  tinydarknetConfig,
  DarknetClassifier
} from "./classifier/index";

// these are just alias until i figure out if i decide to add more types of classifiers/detectors
// tslint:disable-next-line: variable-name
const Detector = (options) => new YOLODetector(options);
// tslint:disable-next-line: variable-name
const Classifier = (options) => new DarknetClassifier(options);

export {
  yolov3Config,
  tinyYOLOv3Config,
  tinyYOLOv2Config,
  tinyYOLOLiteConfig,
  Detector,
  darknetRefrenceConfig,
  darknet19Config,
  tinydarknetConfig,
  Classifier
};
