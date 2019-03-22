import { DarknetClassifierConfig } from "./classifier";
import { darknetImagnetLabels } from "../shared/darknet_imagenet_labels";
const darknetRefrence: DarknetClassifierConfig = {
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
const tinydarknet: DarknetClassifierConfig = {
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
const darknet19: DarknetClassifierConfig = {
    modelName:'darknet-19',
    modelURL:'',
    modelSize: 448,
    classProbThreshold: .6,
    topK: 5,
    resizeOption:{
        ResizeOption:'Bilinear',
        AlignCorners:true,
    },
    labels: darknetImagnetLabels,
};

export {darknetRefrence, darknet19, tinydarknet  };