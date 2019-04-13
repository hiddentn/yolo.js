import { tf } from '../tf';
import { Classification, ImageOptions, Input, modelSize } from '../types';
import { Classifier, ClassifierConfig } from './classifier';
export declare class DarknetClassifier implements Classifier, ClassifierConfig {
    model: tf.LayersModel;
    modelName: string;
    modelURL: string;
    modelSize: modelSize;
    classProbThreshold: number;
    topK: number;
    labels: string[];
    resizeOption: ImageOptions;
    constructor(options: ClassifierConfig);
    /**
     * Loads the model from `modelURL`
     */
    load(): Promise<void>;
    /**
     * Caches the model
     */
    cache(): Promise<void>;
    /**
     * Dispose of the tensors allocated by the model. You should call this when you
     * are done with the detection.
     */
    dispose(): void;
    /**
     * the main function that handles the infrence it returns a `Classification[]` that containes the classifications the their scores
     * @param image the input image `Input`
     *
     * @return a `Pormise` that resolves to a `Classification[]`
     */
    classify(image: Input): Promise<Classification[]>;
    /**
     * the main function that handles the infrence it returns a `Classification[]` that containes the classifications the their scores
     * @param image the input image `Input`
     *
     * @return a `Classification[]`
     */
    classifySync(image: Input): Classification[];
    private classifyInternal;
    private createClassificationsArray;
}
