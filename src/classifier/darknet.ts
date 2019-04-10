import * as tf from '@tensorflow/tfjs';
import { Classification, ImageOptions, Input, modelSize } from '../types';
import { preProcess } from '../utils/preProcess';
import { Classifier, ClassifierConfig } from './classifier';

export class DarknetClassifier implements Classifier, ClassifierConfig {
  public model: tf.LayersModel;

  public modelName: string;
  public modelURL: string;
  public modelSize: modelSize;
  public classProbThreshold: number;
  public topK: number;
  public labels: string[];
  public resizeOption: ImageOptions;

  constructor(options: ClassifierConfig) {
    this.modelName = options.modelName;
    this.modelURL = options.modelURL;
    this.modelSize = options.modelSize;
    this.classProbThreshold = options.classProbThreshold;
    this.topK = options.topK;
    this.labels = options.labels;
    this.resizeOption = options.resizeOption;
  }

  /**
   * Loads the model from `modelURL`
   */
  public async load(): Promise<boolean> {
    if (tf == null) {
      throw new Error(
          'Cannot find TensorFlow.js. If you are using a <script> tag, please ' +
          'also include @tensorflow/tfjs on the page before using this model.');
    }
    try {
      this.model = await tf.loadLayersModel(this.modelURL);
      return true;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Caches the model
   */
  public async cache(): Promise<void> {
    try {
      const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
      await this.classify(dummy);
      tf.dispose(dummy);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Dispose of the tensors allocated by the model. You should call this when you
   * are done with the detection.
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
  }

  public async classify(image: Input): Promise<Classification[]> {
    await tf.nextFrame();
    const { values, indices } = tf.tidy(() => {
      const logits = this.classifyInternal(image);
      const classes = tf.softmax(logits as tf.Tensor);
      return tf.topk(classes, this.topK, true);
    });
    const valuesArray = await values.data<'float32'>();
    const indicesArray = await indices.data<'int32'>();
    tf.dispose({values, indices});
    return this.createClassifications(valuesArray, indicesArray);
  }

  public classifySync(image: Input): Classification[] {
    const { values, indices } = tf.tidy(() => {
      const logits = this.classifyInternal(image);
      const classes = tf.softmax(logits as tf.Tensor);
      return tf.topk(classes, this.topK, true);
    });
    const valuesArray =  values.dataSync<'float32'>();
    const indicesArray = indices.dataSync<'int32'>();
    tf.dispose({values, indices});
    return this.createClassifications(valuesArray, indicesArray);
  }

  private classifyInternal(image: Input): tf.Tensor | tf.Tensor[] {
    return tf.tidy(() => {
      const data = preProcess(image, this.modelSize, this.resizeOption,
      );
      return this.model.predict(data[2]);
    });
  }

  private createClassifications(values: Float32Array, indices: Int32Array): Classification[] {
    const classifications: Classification[] = [];
    for (let i = 0; i < indices.length; i++) {
      const c: Classification = {
        label: this.labels[indices[i]],
        labelIndex: indices[i],
        score: values[i],
      };
      classifications.push(c);
    }
    return classifications;
  }
}
