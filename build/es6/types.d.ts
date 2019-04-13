import { tf } from './tf';
declare type Input = HTMLCanvasElement | HTMLVideoElement | ImageData | HTMLImageElement | tf.Tensor;
declare type YOLOVersion = 'v2' | 'v3';
declare type ImageResizeOption = 'NearestNeighbor' | 'Bilinear';
declare type modelSize = 128 | 160 | 192 | 224 | 256 | 288 | 320 | 352 | 384 | 416 | 448 | 480 | 512 | 544 | 576 | 608;
interface ImageOptions {
    ResizeOption: ImageResizeOption;
    AlignCorners: boolean;
}
interface Classification {
    label: string;
    labelIndex: number;
    score: number;
}
interface Detection extends Classification {
    x: number;
    y: number;
    w: number;
    h: number;
}
export { Detection, Classification, ImageOptions, modelSize, ImageResizeOption, YOLOVersion, Input };
