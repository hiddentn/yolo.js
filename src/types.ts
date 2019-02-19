import { Tensor } from "@tensorflow/tfjs";

export type  YOLOInput = HTMLCanvasElement | HTMLVideoElement | ImageData | HTMLImageElement | Tensor;
export type  YOLOVersion = 'v2' | 'v3';
export type  ImageResizeOption = 'NearestNeighbor' | 'Bilinear';
export type  modelSize = 128 | 160 | 192 | 224 | 256 | 288 | 320 | 352 | 384 | 416;

export interface ImageOptions {
    ResizeOption:ImageResizeOption;
    AlignCorners:boolean;
}
export interface YOLODetectorConfig {

    modelURL: string,
    version: YOLOVersion,
    modelSize: modelSize,

    iouThreshold: number,
    classProbThreshold: number,

    labels:string[]
    anchors: number[][],
    masks:number[][],
    //misc
    ResizeOption:ImageOptions
}

export interface RawBox {

    Coords:number[]
    Class:number;
    Prob:number;
}


export interface Detection {

    label:string,
    labelIndex:number,
    classProb:number,
    x:number,
    y:number,
    w:number,
    h:number,
}