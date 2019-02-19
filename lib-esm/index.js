import { TinyYOLOv2Config } from './yolo/config';
import { YOLODetector } from './yolo/yolo';
import * as tf from '@tensorflow/tfjs';
var YOLO = {
    TinyYOLOv2Config: TinyYOLOv2Config,
    YOLODetector: YOLODetector,
    tf: tf,
};
export { YOLO };
//# sourceMappingURL=index.js.map