import { cocoLabels } from "../shared/coco_labels";
import { YOLODetectorConfig } from '../types';

const tinyYOLOv3Config: YOLODetectorConfig  = {
    modelURL:'',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: cocoLabels,
    version: 'v3',  
    anchors: [[10, 14],[23, 27],[37, 58],[81, 82],[135, 169],[344, 319]],
    masks: [[3, 4, 5],[0, 1, 2]],
};

const tinyYOLOv2Config: YOLODetectorConfig = {
    modelURL:'',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: cocoLabels,
    version: 'v2',
    masks: [[0, 1, 2, 3, 4]],
    anchors: [[0.57273, 0.677385],[1.87446, 2.06253],[3.33843, 5.47434],[7.88282, 3.52778],[9.77052, 9.16828]],
};

const yolov3Config: YOLODetectorConfig  = {
    modelURL:'',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: cocoLabels,
    version: 'v3',
    anchors: [[10, 13],[16, 30],[33, 23],[30, 61],[62, 45],[59, 119],[116, 90],[156, 198],[373, 326]],
    masks: [[6, 7, 8],[3, 4, 5],[0, 1, 2]],
};

const tinyYOLOLiteConfig: YOLODetectorConfig = {
    modelURL:'',
    modelSize: 224,
    iouThreshold: .2,
    classProbThreshold: .4,
    maxOutput: 10,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: cocoLabels,
    version: 'v2',
    masks: [[0, 1, 2, 3, 4]],
    anchors:[[1.08,1.19],[3.42,4.41],[6.63,11.38],[9.42,5.11],[16.62,10.52]],
};

export {yolov3Config, tinyYOLOv2Config, tinyYOLOv3Config, tinyYOLOLiteConfig };