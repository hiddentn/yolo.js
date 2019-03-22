import { DarknetClassifierConfig } from "./classifier";
import { darknetImagnetLabels } from "../shared/darknet_imagenet_labels";
const darknetRefrenceConfig: DarknetClassifierConfig = {
    modelName:'darknet-refrence',
    modelURL:'',
    modelSize: 256,
    classProbThreshold: .6,
    topK: 5,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: darknetImagnetLabels,
};
const tinydarknetConfig: DarknetClassifierConfig = {
    modelName:'tiny-darknet',
    modelURL:'',
    modelSize: 224,
    classProbThreshold: .6,
    topK: 5,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: darknetImagnetLabels,
};
const darknet19Config: DarknetClassifierConfig = {
    modelName:'darknet-19',
    modelURL:'',
    modelSize: 416,
    classProbThreshold: .6,
    topK: 5,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: darknetImagnetLabels,
};

export {darknetRefrenceConfig, darknet19Config, tinydarknetConfig  };