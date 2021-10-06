import { tf } from '../tf';

/**
 * a small utility check to see if `toBeDetermined` is a `tf.Tensor` or a `tf.Tensor[]`
 * @param  toBeDetermined `tf.Tensor` || `tf.Tensor[]`
 * @returns a `boolean` indicating if it's a `tf.Tensor` or a `tf.Tensor[]`
 */
export function isTensorArray(toBeDetermined: tf.Tensor | tf.Tensor[]): toBeDetermined is tf.Tensor[] {
    return (toBeDetermined as tf.Tensor).shape ? false : true;
}
