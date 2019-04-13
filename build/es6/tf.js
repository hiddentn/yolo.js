import * as tf from '@tensorflow/tfjs';
// tslint:disable: no-console
var version = tf.version.tfjs;
var backEnd = tf.getBackend();
console.log("Using Tensorflow/tfjs : " + version);
console.log("Using backend : " + backEnd);
export { tf };
//# sourceMappingURL=tf.js.map