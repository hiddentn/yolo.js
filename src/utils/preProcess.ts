import * as tf from '@tensorflow/tfjs-node';
import { ImageOptions, Input, modelSize} from '../types';

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
export function preProcess(input: Input, size: modelSize, options: ImageOptions): [number, number, tf.Tensor<tf.Rank>] {
  return tf.tidy('preprocessing the yolo/darknet CNN', () => {
    let image: tf.Tensor;
    if (input instanceof tf.Tensor) {
      image = input;
    } else {
      if ( input instanceof HTMLImageElement ||
           input instanceof HTMLVideoElement ||
           input instanceof ImageData ||
           input instanceof HTMLCanvasElement) {
        image = tf.browser.fromPixels(input);
      }
    }
    const [imgWidth, imgHeight] = [image.shape[1], image.shape[0]];
    // Normalize the image from [0, 255] to [0, 1].
    const normalized = image.toFloat().div(tf.scalar(255));
    let resized = normalized;
    if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
      const alignCorners = options.AlignCorners;
      if (options.ResizeOption === 'Bilinear') {
        resized = tf.image.resizeNearestNeighbor(normalized as tf.Tensor<tf.Rank.R3>, [size, size], alignCorners);
      } else {
        resized = tf.image.resizeBilinear(normalized as tf.Tensor<tf.Rank.R3>, [size, size], alignCorners);
      }
    }
    // Reshape to a single-element batch so we can pass it to predict.
    const batched = resized.reshape([1, size, size, 3]);
    return [imgWidth, imgHeight, batched];
  }) as [number, number, tf.Tensor<tf.Rank.R4>];
}
