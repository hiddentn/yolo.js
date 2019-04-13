import { tf } from '../tf';
import { ImageOptions, Input, modelSize } from '../types';
/**
 * Performs the pre processing ops for the yolo/darknet CNN
 *
 * @param input can be  `HTMLCanvasElement` || `HTMLVideoElement` || `ImageData` || `HTMLImageElement` || `Tensor`;
 * @param size model input size
 * @param options some options regarding image resizing
 *
 * @return  an array the image original width and height and the preprocessed image tensor
 *          original image Width as a `number`
 *          original image Height as a `number`
 *          a 4D tensor with the shape of `[1,size,size,3]`
 */
export declare function preProcess(input: Input, size: modelSize, options: ImageOptions): [number, number, tf.Tensor<tf.Rank>];
