import { darknet9000Labels } from '../shared/darknet9000_labels';
import { darknetImagnetLabels } from '../shared/darknet_imagenet_labels';
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
    labels: darknetImagnetLabels,
};
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
    labels: darknetImagnetLabels,
};
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
    labels: darknetImagnetLabels,
};
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
    labels: darknet9000Labels,
};
export { darknetRefrenceConfig, darknet19Config, darknetTinyConfig, darknet9000Config };
//# sourceMappingURL=config.js.map