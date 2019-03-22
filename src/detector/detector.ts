import { Input , Detection, YOLOVersion , ImageOptions , modelSize} from '../types';
interface Detector {
  load():Promise<boolean>;
  cache():void;
  dispose():void;
  detectAsync(image:Input):Promise<Detection[]>;
  detect(image:Input):Detection[];
  detectAsyncCPU(image:Input):Promise<Detection[]>;
  detectCPU(image:Input):Detection[];
  draw(detections:Detection[],canvas:HTMLCanvasElement):void;
}

interface YOLODetectorConfig {

  modelName:string;
  modelURL: string;
  version: YOLOVersion;
  modelSize: modelSize;

  iouThreshold: number;
  classProbThreshold: number;
  maxOutput: number;

  labels:string[];
  anchors: number[][];
  masks:number[][];
  //misc
  resizeOption:ImageOptions;
}
export { Detector, YOLODetectorConfig };
