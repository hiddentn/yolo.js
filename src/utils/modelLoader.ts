import { tf } from '../tf';

export async function loadModel(modelURL: string): Promise<tf.LayersModel> {

    if (tf == null) {
        throw new Error(
            'Cannot find TensorFlow.js. If you are using a <script> tag, please ' +
            'also include @tensorflow/tfjs on the page before using this lib.');
    }
    // TODO : implement model loading for nodejs
    // tf.io.Handler
    // TODO : maybe implement progress
    return await tf.loadLayersModel(modelURL);
}
