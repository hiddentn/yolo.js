import  { TinyYOLOv2Config } from './config';
import { YOLODetectorConfig, YOLOInput , Detection, YOLOVersion , ImageOptions , modelSize , RawBox} from '../types'
import * as tf from '@tensorflow/tfjs';

interface IYOLODetector {

  Model:tf.Model;
  Load():Promise<Boolean>;
  Cache():Promise<void>;
  Dispose():void;
  // Detect(image:YOLOInput):Promise<Detection[]>;
  DetectSync(image:YOLOInput):Detection[];
}
  
 export class YOLODetector implements IYOLODetector , YOLODetectorConfig {

    modelURL: string;
    version: YOLOVersion;
    modelSize: modelSize; //416 || 265 || 224 || 218,

    iouThreshold: number;
    classProbThreshold: number;
   
    labels:string[];
    classesLength:number;
    anchors: number[][];
    masks:number[][];

    ResizeOption:ImageOptions;

    Model:tf.Model;
  
    constructor(options:YOLODetectorConfig = {...TinyYOLOv2Config}) {
      this.modelURL = options.modelURL;
      this.version= options.version;
      this.modelSize= options.modelSize;

      this.iouThreshold= options.iouThreshold;
      this.classProbThreshold= options.classProbThreshold;
   
      this.labels= options.labels
      this.anchors= options.anchors
      this.masks= options.masks

      this.ResizeOption = options.ResizeOption

      this.classesLength = this.labels.length
    }

    public async Load():Promise<Boolean>{
      try {
        this.Model = await tf.loadLayersModel(this.modelURL);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }

    public async Cache():Promise<void>{
      const dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
      await this.Detect(dummy);
      tf.dispose(dummy);
    }

    public Dispose():void {
      this.Model.dispose();
      tf.disposeVariables();
    }

    public async Detect(image:YOLOInput):Promise<Detection[]>{
      return [];
    }

    public DetectSync(image:YOLOInput):any {
      const detections:any = tf.tidy('Detect', () => {
        const [imgWidth, imgHeight, data] = this.preProcess(image);
        const preds = this.Model.predict(data,{batchSize:1});
        const predictions:tf.Tensor<tf.Rank>[] = [];
        if (this.isTensorOrTensorArray(preds)) {
          predictions.push(preds)
        }
        else  {
          (preds as tf.Tensor<tf.Rank>[] ).forEach(tensor =>{
            predictions.push(tensor)
          })
        }
        const [boxes, confidence, classProbs] = this.postProcessRawPrediction(predictions,imgWidth, imgHeight);
        const [boxArr, scoresArr, classArr] = this.filterBoxesSync(boxes, confidence, classProbs, this.classProbThreshold)
        const RawBoxes = this.boxIOU(boxArr, scoresArr, classArr,this.iouThreshold)
        const dets = this.finnalize(RawBoxes);
        return dets
      });
      return detections
    }
    
    public preProcess(img: YOLOInput): [number, number, tf.Tensor] {
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
    // this is expected to be  inside a tf.tidy
    private postProcessRawPrediction(rawPrediction:tf.Tensor<tf.Rank>[],imgWidth:number,imgHeight:number):[tf.Tensor, tf.Tensor, tf.Tensor] {
      const boxes = []
      const confidences = []
      const classProbs = []

      for (let i = 0; i < this.masks.length; i++) {
        const [box, confidence, prob] = this.processFeats(rawPrediction[i], this.masks[i], this.anchors)
        boxes.push(box)
        confidences.push(confidence)
        classProbs.push(prob)
      }
      let cBoxes = tf.concat(boxes, 0)
      cBoxes = this.rescaleBoxes(cBoxes,imgWidth,imgHeight)
      const cConfidences = tf.concat(confidences, 0)
      const cClassProbs = tf.concat(classProbs, 0)

      return [cBoxes, cConfidences, cClassProbs]
    }
    
    // this is expected to be  inside a tf.tidy
    private processFeats(predictions:tf.Tensor, mask:number[], anchors:number[][]):[tf.Tensor, tf.Tensor, tf.Tensor,] {
      const prediction = predictions.squeeze([0])
      const [outputWidth, outputHeight] = [prediction.shape[0], prediction.shape[1]];

      let classesLen = this.classesLength
      let anchorsArr = []
      for (let i = 0; i < mask.length; i++) {
        anchorsArr.push(anchors[mask[i]])
      }
      const anchorsLen = anchorsArr.length;
      const anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, anchorsLen, 2]);
      const numBoxes = outputWidth * outputHeight * anchorsLen;

      //classesLen + 5 =  classesLen + x + y + w + h + obj_score
      const reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);

      let boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
      let boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));

      let boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
      let boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen])).reshape([numBoxes, classesLen]);

      //prep
      let convIndex
      convIndex = tf.range(0, outputWidth);
      const convHeightIndex = tf.tile(convIndex, [outputHeight]);
      let convWidthindex = tf.tile(tf.expandDims(convIndex, 0), [outputWidth, 1]);
      convWidthindex = tf.transpose(convWidthindex).flatten();
      convIndex = tf.transpose(tf.stack([convHeightIndex, convWidthindex]));
      convIndex = tf.reshape(convIndex, [outputWidth, outputHeight, 1, 2]);
      const convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
      // end

      boxxy = tf.div(tf.add(boxxy, convIndex), convDims);

      boxwh = tf.mul(boxwh, anchorsTensor);
      if (this.version === 'v3') {
        boxwh = tf.div(boxwh, tf.tensor([this.modelSize]))
      } else {
        boxwh = tf.div(boxwh, convDims);
      }
      const boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);

      return [boxes, boxConfidence, boxClassProbs]
    }

    // this is expected to be  inside a tf.tidy
    private rescaleBoxes(boxes: tf.Tensor, imgWidth: number, imgHeight: number): tf.Tensor {
      const Width = tf.scalar(imgWidth);
      const Height = tf.scalar(imgHeight);
      // this for y1 x1 y2 x2
      const ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
      // this for x y w h
      //const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
      return boxes.mul(ImageDims)
    }

    // this is expected to be  inside a tf.tidy
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

    // private async filterBoxes(boxes:tf.Tensor, boxConfidence:tf.Tensor, boxClassProbs:tf.Tensor, classProb_thresh:number):Promise<[Float32Array, Float32Array, Int32Array]> {
    //   // class probabilities
    //   const _boxScores = tf.mul(boxConfidence, boxClassProbs);
    //   const boxScores = tf.max(_boxScores, -1);
    //   // class indices
    //   const boxClasses = tf.argMax(boxClassProbs, -1);
    //   // filter mask
    //   const filter_thresh = tf.scalar(classProb_thresh);
    //   const FilterMask = tf.greaterEqual(boxScores, filter_thresh);
    //   const _filteredIndicesTensor = await tf.whereAsync(FilterMask);
    //   const filteredIndicesTensor = _filteredIndicesTensor.flatten();
    //   const filteredBoxes = boxes.gather(filteredIndicesTensor);
    //   const filteredScores = boxScores.gather(filteredIndicesTensor);
    //   const filteredclasses = boxClasses.gather(filteredIndicesTensor);
    //   const [boxArr, scoreArr, classesArr] = await Promise.all([filteredBoxes.data<'float32'>(), filteredScores.data<'float32'>(), filteredclasses.data<'int32'>()]);
    //   tf.dispose([filteredBoxes, filteredScores, filteredclasses, boxes,
    //               _boxScores, boxScores, boxClasses, FilterMask, filteredIndicesTensor,
    //               _filteredIndicesTensor, filter_thresh])
    //   return [boxArr, scoreArr, classesArr]
    // }
    // this is expected to be  inside a tf.tidy
    private filterBoxesSync(boxes:tf.Tensor, boxConfidence:tf.Tensor, boxClassProbs:tf.Tensor, classProb_thresh:number):[Float32Array, Float32Array, Int32Array] {
      // class probabilities
      const boxScores = tf.max(tf.mul(boxConfidence, boxClassProbs), -1)
      // class indices
      const boxClasses = tf.argMax(boxClassProbs, -1);
      // filter mask
      const filter_thresh = tf.scalar(classProb_thresh)
      const FilterMask = tf.greaterEqual(boxScores, filter_thresh)
      const indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
      const NegativeIndicesTensor = tf.fill([boxes.shape[0]], -1, "int32");
      let indices = tf.where(FilterMask, indicesTensor, NegativeIndicesTensor);
      const filteredIndicesTensor = tf.tensor1d((indices.dataSync<'int32'>()).filter((i:number) => i >= 0) )
      const filteredBoxes = boxes.gather(filteredIndicesTensor);
      const filteredScores = boxScores.gather(filteredIndicesTensor);
      const filteredclasses = boxClasses.gather(filteredIndicesTensor);
      const [boxArr, scoreArr, classesArr] = [filteredBoxes.dataSync<'float32'>(), filteredScores.dataSync<'float32'>(), filteredclasses.dataSync<'int32'>()]
      return [boxArr, scoreArr, classesArr]
    }

    private boxIOU(boxArr:Float32Array, scoreArr:Float32Array, classesArr:Int32Array,iou_thresh:number):RawBox[] {
      const zipped:RawBox[] = [];
      for (let i = 0; i < scoreArr.length; i += 1) {
        // [Score,[x,y,w,h,]classindex]
        zipped.push({
          Prob:scoreArr[i],
          Coords:[boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
          Class:classesArr[i],
        });
      }
      // Coords:number[]
      // Class:number;
      // Prob:number;
      // Sort by descending order of scores (first index of zipped array)
      const sorted = zipped.sort((a, b) =>b.Prob-a.Prob);
      const out:RawBox[] = []
      // Greedily go through boxes in descending score order and only
      // return boxes that are below the IoU threshold.
      for (let i = 0; i < sorted.length; i += 1) {
        let Push = true;
        for (let j = 0; j < out.length; j += 1) {
          const IOU = this.iou(out[j].Coords, sorted[i].Coords);
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

    private iou(box1: number[], box2: number[]):number {
      /* Implement the intersection over union (IoU) between box1 and box2
        Arguments:
        box1 -- first box, list object with coordinates (x1, y1, x2, y2)
        box2 -- second box, list object with coordinates (x1, y1, x2, y2)
        */

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

    private finnalize(finals:RawBox[]): any {
      const detections: Detection[] = []
      for (let i = 0; i < finals.length; i += 1) {
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
        const [y1, x1, y2, x2] = finals[i].Coords;
        // Warning !  x and y are for the center of the bounding box
        const w = x2 - x1,
          h = y2 - y1,
          x = x1 + (w / 2),
          y = y1 - (h / 2);

        const labelIndex = finals[i].Class;
        const label = this.labels[labelIndex];
        const classProb = finals[i].Prob;

        // label:string,
        // labelIndex:number,
        // classProb:number,
        // x:number,
        // y:number,
        // w:number,
        // h:number,
        const detection: Detection = {
          label,
          labelIndex,
          classProb,
          //x1,y1,x2,y2,
          x,
          y,
          w,
          h
        };
        detections.push(detection);
      }
      return detections
    }

    private isTensorOrTensorArray(toBeDetermined: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[]): toBeDetermined is tf.Tensor<tf.Rank> {
      if((toBeDetermined as tf.Tensor<tf.Rank>).shape){
        return true
      }
      return false
    }
    


}