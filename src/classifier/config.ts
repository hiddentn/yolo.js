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
const tinydarknetConfig: ClassifierConfig = {
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

export {darknetRefrenceConfig, darknet19Config, tinydarknetConfig  };
