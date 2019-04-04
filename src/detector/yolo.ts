import * as tf from '@tensorflow/tfjs-node';
import { Detection , ImageOptions, Input , modelSize , YOLOVersion} from '../types';
import { draw } from '../utils/draw';
import { preProcess  } from '../utils/preProcess' ;
import { Detector, YOLODetectorConfig } from './detector';

export class YOLODetector implements Detector, YOLODetectorConfig {

    public model: tf.LayersModel;

    public modelName: string;
    public modelURL: string;
    public version: YOLOVersion;
    public modelSize: modelSize;
    public iouThreshold: number;
    public classProbThreshold: number;
    public maxOutput: number;
    public labels: string[];
    public anchors: number[][];
    public masks: number[][];
    public resizeOption: ImageOptions;

    constructor(options: YOLODetectorConfig) {
      this.modelName = options.modelName;
      this.modelURL = options.modelURL;
      this.version = options.version;
      this.modelSize = options.modelSize;
      this.iouThreshold = options.iouThreshold;
      this.classProbThreshold = options.classProbThreshold;
      this.maxOutput = options.maxOutput;
      this.labels = options.labels;
      this.anchors = options.anchors;
      this.masks = options.masks;
      this.resizeOption = options.resizeOption;
    }

       /**
   * Loads the model from `modelURL`
   */
  public async loadFromDisk(handler:any): Promise<boolean> {
    if (tf == null) {
      throw new Error(
          'Cannot find TensorFlow.js. If you are using a <script> tag, please ' +
          'also include @tensorflow/tfjs on the page before using this model.');
    }
    try {
      if (handler) {
        this.model = await tf.loadLayersModel(handler);
      }
      else {
        this.model = await tf.loadLayersModel(this.modelURL);
      }
      return true;
    } catch (e) {
      return e;
    }
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
      } catch (e) {
        return false;
      }
    }
    /**
     * Caches the model
     */
    public cache(): void {
      const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
      this.detectSync(dummy);
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

    public detectSyncCPU(image: Input): Detection[] {
      const results = this.predictInternal(image);
      const numBoxes = results[0].shape[0]; // || results[1].shape[0];
      const numClasses = results[1].shape[1];
      const boxArray = results[0].dataSync<'float32'>();
      const scoreArray = results[1].dataSync<'float32'>();
      tf.dispose(results);
      const prev = tf.getBackend();
      tf.setBackend('cpu');
      const [maxScores, classes] = this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses);
      const boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
      const indexTensor = tf.image.nonMaxSuppression(boxes2, maxScores, this.maxOutput, this.iouThreshold, this.classProbThreshold);
      const indexArray = indexTensor.dataSync<'int32'>();
      tf.dispose(boxes2);
      tf.dispose(indexTensor);
      const finalBoxes = this.createFinalBoxes(boxArray, maxScores, classes, indexArray);
      tf.setBackend(prev);
      return finalBoxes;
    }

    public async detectCPU(image: Input): Promise<Detection[]> {
      await tf.nextFrame();
      const results = this.predictInternal(image);
      const numBoxes = results[0].shape[0]; // || results[1].shape[0];
      const numClasses = results[1].shape[1];
      const boxArray = await results[0].data<'float32'>();
      const scoreArray = await results[1].data<'float32'>();
      tf.dispose(results);
      const prev = tf.getBackend();
      tf.setBackend('cpu');
      const [maxScores, classes] = this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses);
      const boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
      const indexTensor = await tf.image.nonMaxSuppressionAsync(boxes2, maxScores, this.maxOutput,
                                                                this.iouThreshold, this.classProbThreshold);
      const indexArray = await indexTensor.data<'int32'>();
      tf.dispose(boxes2);
      tf.dispose(indexTensor);
      const finalBoxes = this.createFinalBoxes(boxArray, maxScores, classes, indexArray);
      tf.setBackend(prev);
      return finalBoxes;
    }

    public detectSync(image: Input): Detection[] {
      const [boxes, scores, classes] = tf.tidy('', () => {
        const results = this.predictInternal(image);
        return this.filterBoxes(results[0], results[1], this.classProbThreshold);
      });
      const boxArr = boxes.dataSync<'float32'>();
      const scoresArr = scores.dataSync<'float32'>();
      const classesArr = classes.dataSync<'int32'>();
      tf.dispose([boxes, scores, classes]);
      const rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
      return  this.createDetectionArray(rawBoxes);
    }

    public async detect(image: Input): Promise<Detection[]> {
      await tf.nextFrame();
      const results = this.predictInternal(image);
      const filtred = await this.filterBoxesAsync(results[0], results[1], this.classProbThreshold);
      const [boxArr, scoresArr, classesArr] = await  Promise.all([filtred[0].data<'float32'>(),
                                                                  filtred[1].data<'float32'>(),
                                                                  filtred[2].data<'int32'>()]);
      tf.dispose(results);
      tf.dispose(filtred);
      const rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
      const dets = this.createDetectionArray(rawBoxes);
      return dets;

    }

    /**
     * Draw the detections on a `HTMLCanvasElement`
     * @param detections  detections to be drawn
     * @param canvas `HTMLCanvasElement` to draw to
     */
    public draw(detections: Detection[], canvas: HTMLCanvasElement): void {
      const ctx = canvas.getContext('2d');
      const lablesLen = this.labels.length;
      draw(detections, ctx, lablesLen);
    }

    /**
     * the main function that handles the infrence it returns a `tf.Tensor[]` that containes the boxes the their scores
     * @param image the input image `Input`
     *
     * @return a `tf.Tensor[]` that contain `[Boxes, Scores]`
     * `Boxes` with a shape of `[numBoxes, 4]`
     * Each `box` is defined by `[maxY, maxX, minY, minX]`
     * Score with a shape of `[numBoxes, numClasses]`
     */
    private predictInternal(image: Input): tf.Tensor[] {
      return tf.tidy(() => {
      const [imgWidth, imgHeight, data] = preProcess(image, this.modelSize, this.resizeOption);
      const preds = this.model.predict(data, {batchSize: 1});
      const [boxes, scores] = this.postProcessRawPrediction(preds);
      const scaledBoxes = this.rescaleBoxes(boxes, imgWidth, imgHeight);
      return [scaledBoxes, scores];
      });
    }

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
    private postProcessRawPrediction(rawPrediction: tf.Tensor[] | tf.Tensor): tf.Tensor[] {
      const layers: Array<tf.Tensor<tf.Rank>> = [];
      if (this.isTensorOrTensorArray(rawPrediction)) {
        // its a single Tensor (v2)
        layers.push(rawPrediction);
      } else {
        rawPrediction.forEach((layer) => layers.push(layer));
      }
      const boxes: tf.Tensor[] = [];
      const probs: tf.Tensor[] = [];

      for (let i = 0; i < layers.length; i++) {
        const mask = this.masks[i];
        const numAnchors = mask.length;
        const anchorsArr = [];
        for (let j = 0; j < numAnchors; j++) {
          anchorsArr.push(this.anchors[mask[j]]);
        }
        const anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, numAnchors, 2]);
        const classesLength = this.labels.length;
        // remove the batch dim
        const squeezed = layers[i].squeeze([0]);
        const [box, prob] = this.processLayer(squeezed, anchorsTensor, this.modelSize, classesLength, this.version);
        boxes.push(box);
        probs.push(prob);
      }
      const boxesTensor = tf.concat(boxes, 0);
      const probsTensor = tf.concat(probs, 0);

      return [boxesTensor, probsTensor];
    }

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
    // tslint:disable-next-line: no-shadowed-variable
    private processLayer(prediction: tf.Tensor, anchorsTensor: tf.Tensor, modelSize: number, classesLen: number, version: string): tf.Tensor[] {
      const [outputWidth, outputHeight] = [prediction.shape[0], prediction.shape[1]];
      const anchorsLen = anchorsTensor.shape[2];
      const numBoxes = outputWidth * outputHeight * anchorsLen;
      // classesLen + 5 =  classesLen + x + y + w + h + obj_score
      const reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);
      let boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
      let boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));
      const boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
      const boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen]))
                              .reshape([numBoxes, classesLen]);
      const classProbs = tf.mul(boxConfidence, boxClassProbs);
      // prep
      const boxIndex = tf.range(0, outputWidth);
      const boxHeightIndex = tf.tile(boxIndex, [outputHeight]);
      const boxWidthindex = tf.tile(tf.expandDims(boxIndex, 0), [outputWidth, 1]).transpose().flatten();
      const boxIndexGrid = tf.transpose(tf.stack([boxHeightIndex, boxWidthindex])).reshape([outputWidth, outputHeight, 1, 2]);
      const convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
      // end
      boxxy = tf.div(tf.add(boxxy, boxIndexGrid), convDims);
      boxwh = tf.mul(boxwh, anchorsTensor);
      if (version === 'v3') {
        boxwh = tf.div(boxwh, tf.tensor([modelSize]));
      } else {
        boxwh = tf.div(boxwh, convDims);
      }
      const boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);
      return [boxes, classProbs];
    }

    /**
     * transforms the yolo bounding box coordinates from `center` to `top left` and joins them.
     * @param boxXY a `tf.Tensor` representing the boxes `X, Y` coordinates.
     * @param boxWH a `tf.Tensor` representing the boxes `Width, Height` values.
     *
     * @returns a `tf.Tensor` representing the transformed & joined boxes coordinates
     */
    private boxesToCorners(boxXY: tf.Tensor, boxWH: tf.Tensor): tf.Tensor {
      const two = tf.scalar(2);
      const boxMins = tf.sub(boxXY, tf.div(boxWH, two));
      const boxMaxes = tf.add(boxXY, tf.div(boxWH, two));
      const dim0 = boxMins.shape[0];
      const dim1 = boxMins.shape[1];
      const dim2 = boxMins.shape[2];
      const size = [dim0, dim1, dim2, 1];
      return tf.concat([
        boxMins.slice([0, 0, 0, 1], size),
        boxMins.slice([0, 0, 0, 0], size),
        boxMaxes.slice([0, 0, 0, 1], size),
        boxMaxes.slice([0, 0, 0, 0], size),
      ], 3);
    }

    /**
     * rescales the boxes coordinates to the input image dimentions.
     * @param boxes a `tf.Tensor` representing the boxes coordinates. shape : `[numBoxes,4]`
     * @param imgWidth original input image Width.
     * @param imgHeight  original input image Height.
     *
     * @return a `tf.Tensor` representing the scaled boxes coordinates.
     */
    private rescaleBoxes(boxes: tf.Tensor, imgWidth: number, imgHeight: number): tf.Tensor {
      const width = tf.scalar(imgWidth);
      const height = tf.scalar(imgHeight);
      // this for y1 x1 y2 x2
      const imageDims = tf.stack([height, width, height, width]).reshape([1, 4]);
      // this for x y w h
      // const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
      return boxes.mul(imageDims);
    }

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
    private filterBoxes(boxes: tf.Tensor, scores: tf.Tensor, classProbThresh: number): tf.Tensor[] {
      const boxScore = tf.max(scores, -1);
      const boxClasses = tf.argMax(scores, -1);
      // score filter mask
      const filterThresh = tf.scalar(classProbThresh);
      const filterMask = tf.greaterEqual(boxScore, filterThresh);

      // this is somewhat a replacment for tf.boolean_mask
      const indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
      const negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
      const indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
      const filteredIndicesTensor = tf.tensor1d(indices.dataSync<'int32'> ().filter((i) => i >= 0));
      return [boxes.gather(filteredIndicesTensor), boxScore.gather(filteredIndicesTensor), boxClasses.gather(filteredIndicesTensor)];
    }

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
    private async filterBoxesAsync(boxes: tf.Tensor, scores: tf.Tensor, classProbThresh = .5): Promise < tf.Tensor[] > {
      const boxScore = tf.max(scores, -1);
      const boxClasses = tf.argMax(scores, -1);
      // filter mask
      const filterThresh = tf.scalar(classProbThresh);
      const filterMask = tf.greaterEqual(boxScore, filterThresh);
      // i think we can replace this with tf.setdiff1dAsync(x, y)
      // https://js.tensorflow.org/api/latest/#setdiff1dAsync
      const range = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]);
      const indicesTensor = range.toInt();
      const negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
      const indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
      const filteredIndicesTensor = tf.tensor1d((await indices.data<'int32'>()).filter((i) => i >= 0));
      //  END
      const filtredBoxes = boxes.gather(filteredIndicesTensor);
      const filtredScores = boxScore.gather(filteredIndicesTensor);
      const filtredClasses = boxClasses.gather(filteredIndicesTensor);

      tf.dispose([boxScore, boxClasses, filterThresh, filterMask,
                  range, indicesTensor, negativeIndicesTensor,
                  indices, filteredIndicesTensor]);

      return [filtredBoxes, filtredScores, filtredClasses];
    }

    /**
     *
     * @param scores
     * @param numBoxes
     * @param numClasses
     */
    private getMaxScoresAndClasses(scores: Float32Array, numBoxes: number, numClasses: number): [number[], number[]] {
      const maxes = [];
      const classes = [];
      for (let i = 0; i < numBoxes; i++) {
        let max = Number.MIN_VALUE;
        let index = -1;
        for (let j = 0; j < numClasses; j++) {
          if (scores[i * numClasses + j] > max) {
            max = scores[i * numClasses + j];
            index = j;
          }
        }
        maxes[i] = max;
        classes[i] = index;
      }
      return [maxes, classes];
    }

    /**
     * a small utility check to see if `toBeDetermined` is a `tf.Tensor` or a `tf.Tensor[]`
     *
     * @param  toBeDetermined `tf.Tensor` || `tf.Tensor[]`
     *
     * @returns a `boolean` indicating if it's a `tf.Tensor` or a `tf.Tensor[]`
     */
    private isTensorOrTensorArray(toBeDetermined: tf.Tensor | tf.Tensor[]): toBeDetermined is tf.Tensor {
      return (toBeDetermined as tf.Tensor).shape ? true : false;
    }

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
    private NonMaxSuppression(boxArr: Float32Array, scoreArr: Float32Array, classesArr: Int32Array, iouThresh: number): any[] {
      const zipped: any[] = [];
      for (let i = 0; i < scoreArr.length; i += 1) {
        zipped.push([
          [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
          scoreArr[i],
          classesArr[i],
        ]);
      }
      // Sort by descending order of scores (first index of zipped array)
      const sorted = zipped.sort((a, b) => b[1] - a[1]);
      const out = [];
      // Greedily go through boxes in descending score order and only
      // return boxes that are below the IoU threshold.
      for (let i = 0; i < sorted.length; i += 1) {
        let push = true;
        for (let j = 0; j < out.length; j += 1) {
          const IOU = this.iou(out[j][0], sorted[i][0]);
          if (IOU > iouThresh) {
            push = false;
            break;
          }
        }
        if (push) {
          out.push(sorted[i]);
        }
      }
      return out;
    }

    /**
     * Implement the intersection over union (IoU) between box1 and box2
     *
     * @param box1 -- first box, number list with coordinates `(x1, y1, x2, y2)`
     * @param box2 -- second box, number list with coordinates `(x1, y1, x2, y2)`
     *
     * @return the value of `interarea` /  `unionarea`
     */
    private iou(box1: number[], box2: number[]): number {
       // Calculate the (y1, x1, y2, x2) coordinates of the intersection of box1 and box2. Calculate its Area.
       const xi1 = Math.max(box1[0], box2[0]);
       const yi1 = Math.max(box1[1], box2[1]);
       const xi2 = Math.min(box1[2], box2[2]);
       const yi2 = Math.min(box1[3], box2[3]);
       const interarea = (yi2 - yi1) * (xi2 - xi1);
       // Calculate the Union area by using Formula: Union(A,B) = A + B - Inter(A,B)
       const box1area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
       const box2area = (box2[2] - box2[0]) * (box2[3] - box2[1]);
       const unionarea = (box1area + box2area) - interarea;
       // compute the IoU
       return interarea / unionarea;
    }

    /**
     * a function similar to `createDetectionArray()` that takes the yolo output and returns a `Detection[]`
     * @param boxes  a Float32Array containing the boxes coords:Length must be `numBoxes*4`
     * @param scores an array containing the boxes scores probability:Length must be `numBoxes`
     * @param classes an array  containing the detection label index:Length must be `numBoxes`
     * @param indexes a Float32Array containing the indexes of the boxes that we want to keep:Length must be `numBoxes`
     *
     * @return a `Detection[]` with the final collected boxes
     */
    private createFinalBoxes(boxes: Float32Array, scores: number[], classes: number[], indexes: Int32Array): Detection[] {
      const count = indexes.length;
      const objects: Detection[] = [];
      for (let i = 0; i < count; i++) {
        const bbox = [];
        for (let j = 0; j < 4; j++) {
          bbox[j] = boxes[indexes[i] * 4 + j];
        }
        const maxY = bbox[0];
        const maxX = bbox[1];
        const minY = bbox[2];
        const minX = bbox[3];
        const w = minX - maxX ;
        const h = minY - maxY ;
        // const x = maxX + (w / 2);
        // const y = maxY - (h / 2);
        const classIndex = classes[indexes[i]];
        const detection = {
          label: this.labels[classIndex],
          labelIndex: classIndex,
          score: scores[indexes[i]],
          x: maxX,
          y: maxY,
          w,
          h,
        };
        objects.push(detection);
      }
      return objects;
    }

    /**
     * The final phase in the post processing that outputs the final `Detection[]`
     *
     * @param finalBoxes an array containing the raw box information
     *
     * @return a `Detection[]` with the final collected boxes
     */
    private createDetectionArray(finalBoxes: any[]): Detection[] {
      const detections: Detection[] = [];
      for (let i = 0; i < finalBoxes.length; i += 1) {
        // add any out put you want
        // choose output format
        // currently its x1,y1,x2,y2
        // x1 = x - (w/2)
        // y1 = y - (h/2)
        // x2 = x + (w/2)
        // y2 = y + (h/2)
        // as for x y w h
        // Warning !  x and y are for the center of the bounding box
        // w = x2-x1
        // h = y2-y1
        // x = x1 + (w/2) || x2 - (w/2)
        // y = y1 - (h/2) || y2 + (h/2)
        const [maxY, maxX, minY, minX] = finalBoxes[i][0];
        const classIndex = finalBoxes[i][2];
        // // Warning !  x and y are for the center of the bounding box
        // const w = minX - maxX;
        // const h = minY - maxY;
        const detection: Detection = {
          labelIndex: classIndex,
          label: this.labels[classIndex],
          score: finalBoxes[i][1],
          x: maxX,
          y: maxY,
          w: minX - maxX,
          h: minY - maxY,
        };
        detections.push(detection);
      }
      return detections;
    }
}
