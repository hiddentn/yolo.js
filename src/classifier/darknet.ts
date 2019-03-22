import { Input, Classification, ImageOptions, modelSize } from "../types";
import { Classifier, DarknetClassifierConfig } from "./classifier";
import { preProcess } from "../utils/preProcess";
import * as tf from "@tensorflow/tfjs";

export class DarknetClassifier implements Classifier, DarknetClassifierConfig {
  model: tf.LayersModel;

  modelName: string;
  modelURL: string;
  modelSize: modelSize;
  classProbThreshold: number;
  topK: number;
  labels: string[];
  resizeOption: ImageOptions;

  constructor(options: DarknetClassifierConfig) {
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
          `Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
          `also include @tensorflow/tfjs on the page before using this model.`);
    }
    try {
      this.model = await tf.loadLayersModel(this.modelURL);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Caches the model
   */
  public cache(): void {
    const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
    this.Classify(dummy);
    tf.dispose(dummy);
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

  public async ClassifyAsync(image: Input): Promise<Classification[]> {
    const { values, indices } = tf.tidy(() => {
      const logits = this.ClassifyInternal(image);
      const classes = tf.softmax(logits as tf.Tensor);
      return tf.topk(classes, this.topK, true);
    });
    const valuesArray = await values.data<'float32'>();
    const indicesArray = await indices.data<'int32'>();
    tf.dispose({values, indices});
    return this.createClassifications(valuesArray,indicesArray);
  }

  public Classify(image: Input): Classification[] {
    const { values, indices } = tf.tidy(() => {
      const logits = this.ClassifyInternal(image);
      const classes = tf.softmax(logits as tf.Tensor);
      return tf.topk(classes, this.topK, true);
    });
    const valuesArray =  values.dataSync<'float32'>();
    const indicesArray = indices.dataSync<'int32'>();
    tf.dispose({values, indices});
    return this.createClassifications(valuesArray,indicesArray);
  }

  private ClassifyInternal(image: Input): tf.Tensor | tf.Tensor[] {
    return tf.tidy(() => {
      const data = preProcess(image,this.modelSize,this.resizeOption
      );
      return this.model.predict(data[2]);
    });
  }

  private createClassifications(values: Float32Array,indices: Int32Array): Classification[] {
    const classifications:Classification[] = [];
    for (let i = 0; i < indices.length; i++) {
      const c :Classification = {
        label:this.labels[indices[i]],
        labelIndex:indices[i],
        score:values[i],
      };
      classifications.push(c);
    }
    return classifications;
  }
}
