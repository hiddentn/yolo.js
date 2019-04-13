import { tf } from '../tf';
import { Detection, ImageOptions, Input, modelSize, YOLOVersion } from '../types';
import { Detector, YOLODetectorConfig } from './detector';
export declare class YOLODetector implements Detector, YOLODetectorConfig {
    model: tf.LayersModel;
    modelName: string;
    modelURL: string;
    version: YOLOVersion;
    modelSize: modelSize;
    iouThreshold: number;
    classProbThreshold: number;
    maxOutput: number;
    labels: string[];
    anchors: number[][];
    masks: number[][];
    resizeOption: ImageOptions;
    constructor(options: YOLODetectorConfig);
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
    detectSyncCPU(image: Input): Detection[];
    detectCPU(image: Input): Promise<Detection[]>;
    detectSync(image: Input): Detection[];
    detect(image: Input): Promise<Detection[]>;
    /**
     * Draw the detections on a `HTMLCanvasElement`
     * @param detections  detections to be drawn
     * @param canvas `HTMLCanvasElement` to draw to
     */
    draw(detections: Detection[], canvas: HTMLCanvasElement): void;
    /**
     * the main function that handles the infrence it returns a `tf.Tensor[]` that containes the boxes the their scores
     * @param image the input image `Input`
     *
     * @return a `tf.Tensor[]` that contain `[Boxes, Scores]`
     * `Boxes` with a shape of `[numBoxes, 4]`
     * Each `box` is defined by `[maxY, maxX, minY, minX]`
     * Score with a shape of `[numBoxes, numClasses]`
     */
    private predictInternal;
    /**
     * the postprocessing function for the yolo object detection algorithm
     * @param rawPrediction can be a `tf.Tensor` representing a single output (yolov2)
     * or a `tf.Tensor[]` representing multiple outputs (yolov3 has 3 outputs ).
     * each output has the shape of `[size, size, (numClasses+5) * numAnchors]`
     * with the 5 representing : Box Coodinates [4] + BoxConfidence [1]
     *
     * @return a `tf.Tensor[]` that contain `[Boxes, Scores]`
     * `Boxes` with a shape of `[numBoxes, 4]`
     * Each `box` is defined by `[maxY, maxX, minY, minX]`
     * Score with a shape of `[numBoxes, numClasses]`
     */
    private postProcessRawPrediction;
    /**
     * Process 1 layer of the yolo output
     * @param prediction a `tf.Tensor` representing 1 output of  the neural net
     * @param anchorsTensor a `tf.Tensor` representing the anchors that correspond with the output
     * shape : `[numAnchors, 2]`
     * @param modelSize the input size for the neural net
     * @param classesLen the number of classes/labels that the neural net predicts
     * @param version yolo version `v2` || `v3`
     *
     * @return a `tf.Tensor[]` that containes `[boxes , Scores]` that correspond to the specific layer
     */
    private processLayer;
    /**
     * transforms the yolo bounding box coordinates from `center` to `top left` and joins them.
     * @param boxXY a `tf.Tensor` representing the boxes `X, Y` coordinates.
     * @param boxWH a `tf.Tensor` representing the boxes `Width, Height` values.
     *
     * @returns a `tf.Tensor` representing the transformed & joined boxes coordinates
     */
    private boxesToCorners;
    /**
     * rescales the boxes coordinates to the input image dimentions.
     * @param boxes a `tf.Tensor` representing the boxes coordinates. shape : `[numBoxes,4]`
     * @param imgWidth original input image Width.
     * @param imgHeight  original input image Height.
     *
     * @return a `tf.Tensor` representing the scaled boxes coordinates.
     */
    private rescaleBoxes;
    /**
     * filters boxes synchronously by a `classProbThresh` Threshold
     * @param boxes a 2D box `tf.Tensor` with the shape of `[numBoxes,4]`
     * @param scores a 2D scores  `tf.Tensor`  with the shape of `[numBoxes,labelsLength]`
     * @param classProbThresh  a number indecating the score threshold defaults to .5
     *
     * @return a  `tf.Tensor[]` constaining `[filtredBoxes, filtredScores, filtredClasses]`
     *
     * normaly this would be inside a tf.tidy
     * so i skipped on the memory managment
     */
    private filterBoxes;
    /**
     * filters boxes asynchronously by a `classProbThresh` Threshold
     * @param boxes a 2D box `tf.Tensor` with the shape of `[numBoxes,4]`
     * @param scores a 2D scores  `tf.Tensor`  with the shape of `[numBoxes,labelsLength]`
     * @param classProbThresh  a number indecating the score threshold defaults to .5
     *
     * @return a  `tf.Tensor[]` constaining `[filtredBoxes, filtredScores, filtredClasses]`
     *
     * this is gooing to be called outside tf.tidy so we need to do memory managment manually
     * the input & output tensors will be clean outside so we should cleaned only the local variables
     */
    private filterBoxesAsync;
    /**
     *
     * @param scores
     * @param numBoxes
     * @param numClasses
     */
    private getMaxScoresAndClasses;
    /**
     * a small utility check to see if `toBeDetermined` is a `tf.Tensor` or a `tf.Tensor[]`
     *
     * @param  toBeDetermined `tf.Tensor` || `tf.Tensor[]`
     *
     * @returns a `boolean` indicating if it's a `tf.Tensor` or a `tf.Tensor[]`
     */
    private isTensorArray;
    /**
     * Implements Non-max Suppression
     *
     * @param boxArr an array containing the boxes coords:Length must be `numBoxes*4`
     * @param scoreArr an array  containing the boxes scores probability:Length must be `numBoxes`
     * @param classesArr an array  containing the detection label index:Length must be `numBoxes`
     * @param iou_thresh  Non-max Suppression Threshold
     *
     * @return RawDetection
     */
    private NonMaxSuppression;
    /**
     * Implement the intersection over union (IoU) between box1 and box2
     *
     * @param box1 -- first box, number list with coordinates `(x1, y1, x2, y2)`
     * @param box2 -- second box, number list with coordinates `(x1, y1, x2, y2)`
     *
     * @return the value of `interarea` /  `unionarea`
     */
    private iou;
    /**
     * a function similar to `createDetectionArray()` that takes the yolo output and returns a `Detection[]`
     * @param boxes  a Float32Array containing the boxes coords:Length must be `numBoxes*4`
     * @param scores an array containing the boxes scores probability:Length must be `numBoxes`
     * @param classes an array  containing the detection label index:Length must be `numBoxes`
     * @param indexes a Float32Array containing the indexes of the boxes that we want to keep:Length must be `numBoxes`
     *
     * @return a `Detection[]` with the final collected boxes
     */
    private createFinalBoxes;
    /**
     * The final phase in the post processing that outputs the final `Detection[]`
     *
     * @param finalBoxes an array containing the raw box information
     *
     * @return a `Detection[]` with the final collected boxes
     */
    private createDetectionArray;
}
