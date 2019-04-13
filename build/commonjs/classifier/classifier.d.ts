import { Classification, ImageOptions, Input, modelSize } from '../types';
interface Classifier {
    load(): Promise<void>;
    cache(): Promise<void>;
    dispose(): void;
    classify(image: Input): Promise<Classification[]>;
    classifySync(image: Input): Classification[];
}
interface ClassifierConfig {
    modelName: string;
    modelURL: string;
    modelSize: modelSize;
    classProbThreshold: number;
    topK: number;
    labels: string[];
    resizeOption: ImageOptions;
}
export { Classifier, ClassifierConfig };
