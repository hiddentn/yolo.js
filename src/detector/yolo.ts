import { YOLODetectorConfig, YOLOInput , Detection, YOLOVersion , ImageOptions , modelSize} from '../types'
import { TinyYOLOv2Config } from "./config";
import { draw } from '../utils/draw';
import * as tf from '@tensorflow/tfjs';

interface IYOLODetector {

  model:tf.LayersModel;
  load():Promise<Boolean>;
  cache():void;
  dispose():void;
  detectAsync(image:YOLOInput):Promise<Detection[]>;
  detect(image:YOLOInput):Detection[];
  detectAsyncCPU(image:YOLOInput):Promise<Detection[]>;
  detectCPU(image:YOLOInput):Detection[];
  draw(detections:Detection[],canvas:HTMLCanvasElement):void;
}

export class Detector implements IYOLODetector, YOLODetectorConfig {

    modelURL: string;
    version: YOLOVersion;
    modelSize: modelSize;
    iouThreshold: number;
    classProbThreshold: number;
    maxOutput: number;
    labels:string[];
    anchors: number[][];
    masks:number[][];
    ResizeOption:ImageOptions;
    model:tf.LayersModel;

    constructor(options:YOLODetectorConfig = TinyYOLOv2Config) {
      this.modelURL = options.modelURL;
      this.version= options.version;
      this.modelSize= options.modelSize;
      this.iouThreshold= options.iouThreshold;
      this.classProbThreshold= options.classProbThreshold;
      this.maxOutput = options.maxOutput;
      this.labels= options.labels
      this.anchors= options.anchors
      this.masks= options.masks
      this.ResizeOption = options.ResizeOption
    }

    public async load():Promise<Boolean>{
      try {
        this.model = await tf.loadLayersModel(this.modelURL);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    public cache():void{
      const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
      this.detect(dummy);
      tf.dispose(dummy);
    }
    public dispose():void {
      this.model.dispose();
      const prev =  tf.getBackend()
      tf.setBackend('cpu');
      tf.disposeVariables();
      tf.setBackend(prev);
      tf.disposeVariables();
    }

    public detectCPU(image: YOLOInput): Detection[] {
      const results = this.predictInternal(image);
      const numBoxes = results[0].shape[0]; // || results[1].shape[0];
      const numClasses = results[1].shape[1];
      const boxArray = results[0].dataSync<'float32'>();
      const scoreArray = results[1].dataSync<'float32'>();
      tf.dispose(results);
      const prev = tf.getBackend()
      tf.setBackend('cpu')
      const [maxScores, classes] = this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses);
      const boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
      const indexTensor = tf.image.nonMaxSuppression(boxes2, maxScores, this.maxOutput, this.iouThreshold, this.classProbThreshold);
      const indexArray = indexTensor.dataSync<'int32'>();
      tf.dispose(boxes2)
      tf.dispose(indexTensor)
      const finalBoxes = this.CreateFinalBoxes(boxArray, maxScores, classes, indexArray);
      tf.setBackend(prev)
      return finalBoxes
    }
    public async detectAsyncCPU(image: YOLOInput): Promise<Detection[]> {
      const results = this.predictInternal(image);
      const numBoxes = results[0].shape[0]; // || results[1].shape[0];
      const numClasses = results[1].shape[1];
      const boxArray = await results[0].data<'float32'>();
      const scoreArray = await results[1].data<'float32'>();
      tf.dispose(results);
      const prev = tf.getBackend()
      tf.setBackend('cpu')
      const [maxScores, classes] = this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses);
      const boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
      const indexTensor = await tf.image.nonMaxSuppressionAsync(boxes2, maxScores, this.maxOutput, this.iouThreshold, this.classProbThreshold);
      const indexArray = await indexTensor.data<'int32'>();
      tf.dispose(boxes2);
      tf.dispose(indexTensor);
      const finalBoxes = this.CreateFinalBoxes(boxArray, maxScores, classes, indexArray);
      tf.setBackend(prev)
      return finalBoxes;
    }
    public detect(image:YOLOInput): Detection[] {
      const [boxes, scores, classes] = tf.tidy('', () => {
        const results = this.predictInternal(image);
        return this.filterBoxes(results[0], results[1], this.classProbThreshold)
      })
      const boxArr = boxes.dataSync<'float32'>();
      const scoresArr = scores.dataSync<'float32'>();
      const classesArr = classes.dataSync<'int32'>();
      tf.dispose([boxes, scores, classes])
      const RawBoxes = this.boxIOU(boxArr, scoresArr, classesArr,this.iouThreshold);
      return  this.finnalize(RawBoxes);
    }
    public async detectAsync(image:YOLOInput):Promise<Detection[]> {
      
      const results = this.predictInternal(image);
      const filtred = await this.filterBoxesAsync(results[0], results[1], this.classProbThreshold);
      const [boxArr, scoresArr, classesArr] = await  Promise.all([filtred[0].data<'float32'>(),filtred[1].data<'float32'>(),filtred[2].data<'int32'>()])
      tf.dispose(results);
      tf.dispose(filtred);
      const rawBoxes = this.boxIOU(boxArr, scoresArr, classesArr,this.iouThreshold);
      const dets = this.finnalize(rawBoxes);
      return dets
     
    }

    public draw(detections:Detection[],canvas:HTMLCanvasElement):void{
      const ctx = canvas.getContext('2d');
      const lablesLen = this.labels.length;
      draw(detections,ctx,lablesLen);
    }

    private predictInternal(image: YOLOInput):tf.Tensor[]{
      return tf.tidy('Detect', () => {
      const [imgWidth, imgHeight, data] = this.preProcess(image);
      const preds = this.model.predict(data,{batchSize:1});
      const [boxes, scores] = this.postProcessRawPrediction(preds);
      const scaledBoxes = this.rescaleBoxes(boxes, imgWidth, imgHeight);
      return [scaledBoxes,scores]
      });
    }
    private preProcess(img: YOLOInput): [number, number, tf.Tensor] {
      let image;
      if (!(img instanceof tf.Tensor)) {
        if (img instanceof HTMLImageElement || img instanceof HTMLVideoElement || img instanceof ImageData) {
          image = tf.browser.fromPixels(img);
        }
        //  else if (typeof img === 'object' && (img.elt instanceof HTMLImageElement || img.elt instanceof HTMLVideoElement)) {
        //   image = tf.browser.fromPixels(img.elt); // Handle p5.js image and video.
        // } 
      } else {
        image = img;
      }
      const [imgWidth, imgHeight] = [image.shape[1], image.shape[0]];
      // Normalize the image from [0, 255] to [0, 1].
      const normalized = image.toFloat().div(tf.scalar(255));
      let resized = normalized;
      if (normalized.shape[0] !== this.modelSize || normalized.shape[1] !== this.modelSize) {
        const alignCorners = this.ResizeOption.AlignCorners;
        if (this.ResizeOption.ResizeOption === 'Bilinear') {
          resized = tf.image.resizeNearestNeighbor((normalized as tf.Tensor<tf.Rank.R3>), [this.modelSize, this.modelSize], alignCorners);
        } else {
          resized = tf.image.resizeBilinear((normalized as tf.Tensor<tf.Rank.R3>), [this.modelSize, this.modelSize], alignCorners);
        }
      }
      // Reshape to a single-element batch so we can pass it to predict.
      const batched = resized.reshape([1, this.modelSize, this.modelSize, 3]);
      return [imgWidth, imgHeight, batched];
    }
    private postProcessRawPrediction(rawPrediction:tf.Tensor<tf.Rank>[] | tf.Tensor<tf.Rank>):tf.Tensor[] {
      const Layers: tf.Tensor<tf.Rank>[] = [];
      if (this.isTensorOrTensorArray(rawPrediction)) {
        // its a single Tensor
        Layers.push(rawPrediction);
      } else {
        rawPrediction.forEach(layer=>Layers.push(layer))
      }
      const boxes:tf.Tensor[] = []
      const probs:tf.Tensor[] = []

    
      for (let i = 0; i < Layers.length; i++) {
        const mask = this.masks[i];
        const numAnchors = mask.length;
        const anchorsArr = []
        for (let j = 0; j < numAnchors; j++) {
          anchorsArr.push(this.anchors[mask[j]])
        }
        const anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, numAnchors, 2]);
        const classesLength = this.labels.length;
        // remove the batch dim 
        const squeezed = Layers[i].squeeze([0])
        const [box, prob] = this.processLayer(squeezed, anchorsTensor, this.modelSize, classesLength, this.version)
        boxes.push(box)
        probs.push(prob)
      }
      let boxesTensor = tf.concat(boxes, 0)
      const probsTensor = tf.concat(probs, 0)

      return [boxesTensor, probsTensor]
    }
    private processLayer(prediction:tf.Tensor, anchorsTensor:tf.Tensor, modelSize:number, classesLen:number, version: string):tf.Tensor[] {
      const [outputWidth, outputHeight] = [prediction.shape[0], prediction.shape[1]];
      const anchorsLen = anchorsTensor.shape[2];
      const numBoxes = outputWidth * outputHeight * anchorsLen;
      //classesLen + 5 =  classesLen + x + y + w + h + obj_score
      const reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);
      let boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
      let boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));
      let boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
      let boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen])).reshape([numBoxes, classesLen]);
      const ClassProbs = tf.mul(boxConfidence, boxClassProbs)

      //prep /// this assumes the input is a square ie the width and height are equal (tat why we only use the input)
      const boxIndex = tf.range(0, outputWidth);
      const boxHeightIndex = tf.tile(boxIndex, [outputHeight]);
      const boxWidthindex = tf.tile(tf.expandDims(boxIndex, 0), [outputWidth, 1]).transpose().flatten();
      const boxIndexGrid = tf.transpose(tf.stack([boxHeightIndex, boxWidthindex])).reshape([outputWidth, outputHeight, 1, 2]);

      const convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
      // end
      boxxy = tf.div(tf.add(boxxy, boxIndexGrid), convDims);
      boxwh = tf.mul(boxwh, anchorsTensor);
      if (version == 'v3') {
        boxwh = tf.div(boxwh, tf.tensor([modelSize]))
      } else {
        boxwh = tf.div(boxwh, convDims);
      }
      const boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);
      return [boxes, ClassProbs]
    }
    private boxesToCorners(box_xy:tf.Tensor, box_wh:tf.Tensor):tf.Tensor {
      const two = tf.scalar(2);
      const boxMins = tf.sub(box_xy, tf.div(box_wh, two));
      const boxMaxes = tf.add(box_xy, tf.div(box_wh, two));
      const dim_0 = boxMins.shape[0];
      const dim_1 = boxMins.shape[1];
      const dim_2 = boxMins.shape[2];
      const size = [dim_0, dim_1, dim_2, 1];
      return tf.concat([
        boxMins.slice([0, 0, 0, 1], size),
        boxMins.slice([0, 0, 0, 0], size),
        boxMaxes.slice([0, 0, 0, 1], size),
        boxMaxes.slice([0, 0, 0, 0], size),
      ], 3);
    }
    private rescaleBoxes(boxes: tf.Tensor, imgWidth: number, imgHeight: number): tf.Tensor {
      const Width = tf.scalar(imgWidth);
      const Height = tf.scalar(imgHeight);
      // this for y1 x1 y2 x2
      const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
      // this for x y w h
      //const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
      return boxes.mul(ImageDims)
    }
    // normaly this whoud be inside tf.tidy
    // so i skipped the memoty managment
    private filterBoxes(boxes: tf.Tensor, scores: tf.Tensor, classProb_thresh: number): tf.Tensor[] {
      const boxScore = tf.max(scores, -1)
      const boxClasses = tf.argMax(scores, -1);
      // filter mask
      const filter_thresh = tf.scalar(classProb_thresh)
      const FilterMask = tf.greaterEqual(boxScore, filter_thresh)
      const indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
      const NegativeIndicesTensor = tf.fill([boxes.shape[0]], -1, "int32");
      let indices = tf.where(FilterMask, indicesTensor, NegativeIndicesTensor);
      const filteredIndicesTensor = tf.tensor1d(indices.dataSync < 'int32' > ().filter(i => i >= 0))
      return [boxes.gather(filteredIndicesTensor), boxScore.gather(filteredIndicesTensor), boxClasses.gather(filteredIndicesTensor)]
    }
    // this is gooing to be called outside tf.tidy so we need to do memory managment manually
    // the input & output tensors will be clean outside so we should clean only the local variables;
    // TODO : there is a small memory leak here
    private async filterBoxesAsync(boxes: tf.Tensor, scores: tf.Tensor, classProbthresh: number): Promise < tf.Tensor[] > {
      const boxScore = tf.max(scores, -1)
      const boxClasses = tf.argMax(scores, -1);
      // filter mask
      const Threshold = tf.scalar(classProbthresh)
      const FilterMask = tf.greaterEqual(boxScore, Threshold)
      const range = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0])
      const indicesTensor = range.toInt();
      const NegativeIndicesTensor = tf.fill([boxes.shape[0]], -1, "int32");
      const indices = tf.where(FilterMask, indicesTensor, NegativeIndicesTensor);
      const filteredIndicesTensor = tf.tensor1d((await indices.data<'int32'>()).filter(i => i >= 0))
      const filtredBoxes = boxes.gather(filteredIndicesTensor);
      const filtredScores = boxScore.gather(filteredIndicesTensor);
      const filtredClasses = boxClasses.gather(filteredIndicesTensor);
      tf.dispose([boxScore,boxClasses,Threshold, FilterMask,range, indicesTensor, NegativeIndicesTensor, indices, filteredIndicesTensor,])
      return [filtredBoxes, filtredScores, filtredClasses]
    }

    private CreateFinalBoxes(boxes: Float32Array, scores: number[], classes: number[], indexes: Int32Array): Detection[] {
      const count = indexes.length;
      const objects: Detection[] = [];
      for (let i = 0; i < count; i++) {
        const bbox = [];
        for (let j = 0; j < 4; j++) {
          bbox[j] = boxes[indexes[i] * 4 + j];
        }
        const maxY = bbox[0]
        const maxX = bbox[1]
        const minY = bbox[2]
        const minX = bbox[3]
        const w = minX -maxX ;
        const h = minY- maxY ;
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
        }
        objects.push(detection);
      }
      return objects;
    }
    private getMaxScoresAndClasses(scores:Float32Array, numBoxes:number, numClasses:number):[number[], number[]]{
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
    private isTensorOrTensorArray(toBeDetermined: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[]): toBeDetermined is tf.Tensor<tf.Rank> {
      if((toBeDetermined as tf.Tensor<tf.Rank>).shape){
        return true
      }
      return false
    }
    private boxIOU(boxArr:any, scoreArr:any, classesArr:any,iou_thresh:number):any[] {
      const zipped:any[] = [];
      for (let i = 0; i < scoreArr.length; i += 1) {
        // [Score,[x,y,w,h,]classindex]
        zipped.push([
          [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
          scoreArr[i],
          classesArr[i],
        ]);
      }
      // Coords:number[]
      // Class:number;
      // Prob:number;
      // Sort by descending order of scores (first index of zipped array)
      const sorted = zipped.sort((a, b) =>b[1]-a[1]);
      const out = []
      // Greedily go through boxes in descending score order and only
      // return boxes that are below the IoU threshold.
      for (let i = 0; i < sorted.length; i += 1) {
        let Push = true;
        for (let j = 0; j < out.length; j += 1) {
          const IOU = this.iou(out[j][0], sorted[i][0]);
          if (IOU > iou_thresh) {
            Push = false;
            break;
          }
        }
        if (Push) {
          out.push(sorted[i]);
        }
      }
      return out;
    }

    /* Implement the intersection over union (IoU) between box1 and box2
        Arguments:
        box1 -- first box, list object with coordinates (x1, y1, x2, y2)
        box2 -- second box, list object with coordinates (x1, y1, x2, y2)
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
    private finnalize(finalBoxes:any[]):Detection[] {
      const detections:Detection[] = [];
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
        const [maxY, maxX, minY, minX] =finalBoxes[i][0];
        const classIndex = finalBoxes[i][2];
        // // Warning !  x and y are for the center of the bounding box
        // const w = minX - maxX;
        // const h = minY - maxY;
        const detection:Detection = {
          labelIndex:classIndex,
          label:this.labels[classIndex],
          score: finalBoxes[i][1],
          x:maxX,
          y:maxY,
          w:minX - maxX,
          h:minY - maxY,
        };
        detections.push(detection);
      }
      return detections
    }
}