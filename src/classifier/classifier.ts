import { Classification, ImageOptions, Input, modelSize } from '../types';

interface Classifier {
  load(): Promise<void>;
  cache(): Promise<void>;
  dispose(): void;
  classify(image: Input): Promise<Classification[]>;
  classifySync(image: Input): Classification[];
}

interface ClassifierConfig {

  // model definition
  modelName: string;
  modelURL: string;
  modelSize: modelSize;

  // variables defenition
  classProbThreshold: number;
  topK: number;
  labels: string[];

  // misc
  resizeOption: ImageOptions;
}

export { Classifier, ClassifierConfig };
