import * as tf from '@tensorflow/tfjs';

// tslint:disable: no-console
const version = tf.version.tfjs;
const backEnd = tf.getBackend();
console.log(`Using Tensorflow/tfjs : ${version}`);
console.log(`Using backend : ${backEnd}`);
console.log(tf.ENV);

export { tf };
