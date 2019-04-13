"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coco_labels_1 = require("../shared/coco_labels");
// tslint:disable: variable-name
var YOLOV3TinyConfig = {
    modelName: 'tiny-yolo-v3',
    modelURL: '',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
    labels: coco_labels_1.cocoLabels,
    version: 'v3',
    anchors: [[10, 14], [23, 27], [37, 58], [81, 82], [135, 169], [344, 319]],
    masks: [[3, 4, 5], [0, 1, 2]],
};
exports.YOLOV3TinyConfig = YOLOV3TinyConfig;
var YOLOV2TinyConfig = {
    modelName: 'tiny-yolo-v2',
    modelURL: '',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
    labels: coco_labels_1.cocoLabels,
    version: 'v2',
    masks: [[0, 1, 2, 3, 4]],
    anchors: [[0.57273, 0.677385], [1.87446, 2.06253], [3.33843, 5.47434], [7.88282, 3.52778], [9.77052, 9.16828]],
};
exports.YOLOV2TinyConfig = YOLOV2TinyConfig;
var YOLOV3Config = {
    modelName: 'yolo-v3',
    modelURL: '',
    modelSize: 224,
    iouThreshold: .5,
    classProbThreshold: .5,
    maxOutput: 10,
    resizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
    labels: coco_labels_1.cocoLabels,
    version: 'v3',
    anchors: [[10, 13], [16, 30], [33, 23], [30, 61], [62, 45], [59, 119], [116, 90], [156, 198], [373, 326]],
    masks: [[6, 7, 8], [3, 4, 5], [0, 1, 2]],
};
exports.YOLOV3Config = YOLOV3Config;
var YOLOLiteConfig = {
    modelName: 'tiny-yolo-v2-lite',
    modelURL: '',
    modelSize: 224,
    iouThreshold: .2,
    classProbThreshold: .4,
    maxOutput: 10,
    resizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
    labels: coco_labels_1.cocoLabels,
    version: 'v2',
    masks: [[0, 1, 2, 3, 4]],
    anchors: [[1.08, 1.19], [3.42, 4.41], [6.63, 11.38], [9.42, 5.11], [16.62, 10.52]],
};
exports.YOLOLiteConfig = YOLOLiteConfig;
//# sourceMappingURL=config.js.map