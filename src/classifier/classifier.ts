import { Input, Classification, ImageOptions, modelSize } from "../types";

interface Classifier {
  load(): Promise<boolean>;
  cache(): void;
  dispose(): void;
  ClassifyAsync(image: Input): Promise<Classification[]>;
  Classify(image: Input): Classification[];
}

interface DarknetClassifierConfig {

  modelName:string;
  modelURL: string;
  modelSize: modelSize;

  classProbThreshold: number;
  topK: number;

  labels: string[];
  //misc
  resizeOption: ImageOptions;
}

export { Classifier, DarknetClassifierConfig };
