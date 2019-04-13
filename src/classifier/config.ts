import { darknet9000Labels } from '../shared/darknet9000_labels';
import { darknetImagnetLabels } from '../shared/darknet_imagenet_labels';
import { ClassifierConfig } from './classifier';

const darknetRefrenceConfig: ClassifierConfig = {
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
const darknetTinyConfig: ClassifierConfig = {
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
const darknet19Config: ClassifierConfig = {
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
const darknet9000Config: ClassifierConfig = {
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
export { darknetRefrenceConfig, darknet19Config, darknetTinyConfig, darknet9000Config  };
