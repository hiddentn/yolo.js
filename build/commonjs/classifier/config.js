"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var darknet9000_labels_1 = require("../shared/darknet9000_labels");
var darknet_imagenet_labels_1 = require("../shared/darknet_imagenet_labels");
var darknetRefrenceConfig = {
    modelName: 'darknet-refrence',
    modelURL: '',
    modelSize: 256,
    classProbThreshold: .6,
    topK: 5,
    resizeOption: {
        AlignCorners: true,
        ResizeOption: 'Bilinear',
    },
    labels: darknet_imagenet_labels_1.darknetImagnetLabels,
};
exports.darknetRefrenceConfig = darknetRefrenceConfig;
var darknetTinyConfig = {
    modelName: 'tiny-darknet',
    modelURL: '',
    modelSize: 224,
    classProbThreshold: .6,
    topK: 5,
    resizeOption: {
        AlignCorners: true,
        ResizeOption: 'Bilinear',
    },
    labels: darknet_imagenet_labels_1.darknetImagnetLabels,
};
exports.darknetTinyConfig = darknetTinyConfig;
var darknet19Config = {
    modelName: 'darknet-19',
    modelURL: '',
    modelSize: 416,
    classProbThreshold: .6,
    topK: 5,
    resizeOption: {
        AlignCorners: true,
        ResizeOption: 'Bilinear',
    },
    labels: darknet_imagenet_labels_1.darknetImagnetLabels,
};
exports.darknet19Config = darknet19Config;
var darknet9000Config = {
    modelName: 'darknet-9000',
    modelURL: '',
    modelSize: 416,
    classProbThreshold: .6,
    topK: 5,
    resizeOption: {
        AlignCorners: true,
        ResizeOption: 'Bilinear',
    },
    labels: darknet9000_labels_1.darknet9000Labels,
};
exports.darknet9000Config = darknet9000Config;
//# sourceMappingURL=config.js.map