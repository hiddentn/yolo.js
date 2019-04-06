import { Injectable } from '@angular/core';
import { ClassifierConfig, darknet19Config, darknetRefrenceConfig, darknetTinyConfig, tinyYOLOLiteConfig, tinyYOLOv2Config, tinyYOLOv3Config, YOLODetectorConfig, yolov3Config } from '@hiddentn/yolo.js';

@Injectable({
  providedIn: 'root',
})
export class ModelsService {

  constructor() { }

  public getDetectorConfig(modelName: string): YOLODetectorConfig {
    let config: YOLODetectorConfig;
    if (modelName === 'tiny-yolo-v2') {
      config = {
        ...tinyYOLOv2Config,
        modelURL: 'http://localhost:5000/models/objectdetection/yolov2-tiny/model.json',
      };
    } else if (modelName === 'tiny-yolo-v3') {
      config = {
        ...tinyYOLOv3Config,
        modelURL: 'http://localhost:5000/models/objectdetection/yolov3-tiny/model.json',
      };
    } else if (modelName === 'tiny-yolo-v2-lite') {
      config = {
        ...tinyYOLOLiteConfig,
        modelURL: 'http://localhost:5000/models/objectdetection/yolov2-lite/model.json',
      };
    } else if (modelName === 'yolo-v3') {
      config = {
        ...yolov3Config,
        modelURL: 'http://localhost:5000/models/objectdetection/yolov3/model.json',
      };
    }
    return config;
  }
  public getClassifierConfig(modelName: string): ClassifierConfig {
    let config: ClassifierConfig;
    if (modelName === 'darknet-tiny') {
      config = {
        ...darknetTinyConfig,
        modelURL: 'http://localhost:5000/models/classifiers/darknet-tiny/model.json',
      };
    } else if (modelName === 'darknet-refrence') {
      config = {
        ...darknetRefrenceConfig,
        modelURL: 'http://localhost:5000/models/classifiers/darknet-reference/model.json',
      };
    } else if (modelName === 'darknet-19') {
      config = {
        ...darknet19Config,
        modelURL: 'http://localhost:5000/models/classifiers/darknet-19/model.json',
      };
    } else if (modelName === 'darknet-9000') {
      config = {
        ...darknetRefrenceConfig,
        modelURL: 'http://localhost:5000/models/classifiers/darknet-9000/model.json',
      };
    }
    return config;
  }
}
