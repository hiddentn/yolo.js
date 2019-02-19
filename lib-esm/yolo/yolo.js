var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { TinyYOLOv2Config } from './config';
import * as tf from '@tensorflow/tfjs';
var defaultModelUrl = '';
var YOLODetector = /** @class */ (function () {
    function YOLODetector(options) {
        if (options === void 0) { options = __assign({}, TinyYOLOv2Config, { modelURL: defaultModelUrl }); }
        this.modelURL = options.modelURL;
        this.version = options.version;
        this.modelSize = options.modelSize;
        this.iouThreshold = options.iouThreshold;
        this.classProbThreshold = options.classProbThreshold;
        this.labels = options.labels;
        this.anchors = options.anchors;
        this.masks = options.masks;
        this.ResizeOption = options.ResizeOption;
        this.classesLength = this.labels.length;
    }
    YOLODetector.prototype.Load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, tf.loadModel(this.modelURL)];
                    case 1:
                        _a.Model = _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    YOLODetector.prototype.Cache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dummy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
                        return [4 /*yield*/, this.Detect(dummy)];
                    case 1:
                        _a.sent();
                        tf.dispose(dummy);
                        return [2 /*return*/];
                }
            });
        });
    };
    YOLODetector.prototype.Dispose = function () {
        this.Model.dispose();
        tf.disposeVariables();
    };
    YOLODetector.prototype.Detect = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    YOLODetector.prototype.DetectSync = function (image) {
        var _this = this;
        var detections = tf.tidy('Detect', function () {
            var _a = _this.preProcess(image), imgWidth = _a[0], imgHeight = _a[1], data = _a[2];
            var preds = _this.Model.predict(data, { batchSize: 1 });
            var predictions = [];
            if (_this.isTensorOrTensorArray(preds)) {
                predictions.push(preds);
            }
            else {
                preds.forEach(function (tensor) {
                    predictions.push(tensor);
                });
            }
            var _b = _this.postProcessRawPrediction(predictions, imgWidth, imgHeight), boxes = _b[0], confidence = _b[1], classProbs = _b[2];
            var _c = _this.filterBoxesSync(boxes, confidence, classProbs, _this.classProbThreshold), boxArr = _c[0], scoresArr = _c[1], classArr = _c[2];
            var RawBoxes = _this.boxIOU(boxArr, scoresArr, classArr, _this.iouThreshold);
            var dets = _this.finnalize(RawBoxes);
            return dets;
        });
        return detections;
    };
    YOLODetector.prototype.preProcess = function (img) {
        var image;
        if (!(img instanceof tf.Tensor)) {
            if (img instanceof HTMLImageElement || img instanceof HTMLVideoElement || img instanceof ImageData) {
                image = tf.browser.fromPixels(img);
            }
            //  else if (typeof img === 'object' && (img.elt instanceof HTMLImageElement || img.elt instanceof HTMLVideoElement)) {
            //   image = tf.browser.fromPixels(img.elt); // Handle p5.js image and video.
            // } 
        }
        else {
            image = img;
        }
        var _a = [image.shape[1], image.shape[0]], imgWidth = _a[0], imgHeight = _a[1];
        // Normalize the image from [0, 255] to [0, 1].
        var normalized = image.toFloat().div(tf.scalar(255));
        var resized = normalized;
        if (normalized.shape[0] !== this.modelSize || normalized.shape[1] !== this.modelSize) {
            var alignCorners = this.ResizeOption.AlignCorners;
            if (this.ResizeOption.ResizeOption === 'Bilinear') {
                resized = tf.image.resizeNearestNeighbor(normalized, [this.modelSize, this.modelSize], alignCorners);
            }
            else {
                resized = tf.image.resizeBilinear(normalized, [this.modelSize, this.modelSize], alignCorners);
            }
        }
        // Reshape to a single-element batch so we can pass it to predict.
        var batched = resized.reshape([1, this.modelSize, this.modelSize, 3]);
        return [imgWidth, imgHeight, batched];
    };
    // this is expected to be  inside a tf.tidy
    YOLODetector.prototype.postProcessRawPrediction = function (rawPrediction, imgWidth, imgHeight) {
        var boxes = [];
        var confidences = [];
        var classProbs = [];
        for (var i = 0; i < this.masks.length; i++) {
            var _a = this.processFeats(rawPrediction[i], this.masks[i], this.anchors), box = _a[0], confidence = _a[1], prob = _a[2];
            boxes.push(box);
            confidences.push(confidence);
            classProbs.push(prob);
        }
        var cBoxes = tf.concat(boxes, 0);
        cBoxes = this.rescaleBoxes(cBoxes, imgWidth, imgHeight);
        var cConfidences = tf.concat(confidences, 0);
        var cClassProbs = tf.concat(classProbs, 0);
        return [cBoxes, cConfidences, cClassProbs];
    };
    // this is expected to be  inside a tf.tidy
    YOLODetector.prototype.processFeats = function (predictions, mask, anchors) {
        var prediction = predictions.squeeze([0]);
        var _a = [prediction.shape[0], prediction.shape[1]], outputWidth = _a[0], outputHeight = _a[1];
        var classesLen = this.classesLength;
        var anchorsArr = [];
        for (var i = 0; i < mask.length; i++) {
            anchorsArr.push(anchors[mask[i]]);
        }
        var anchorsLen = anchorsArr.length;
        var anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, anchorsLen, 2]);
        var numBoxes = outputWidth * outputHeight * anchorsLen;
        //classesLen + 5 =  classesLen + x + y + w + h + obj_score
        var reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);
        var boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
        var boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));
        var boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
        var boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen])).reshape([numBoxes, classesLen]);
        //prep
        var convIndex;
        convIndex = tf.range(0, outputWidth);
        var convHeightIndex = tf.tile(convIndex, [outputHeight]);
        var convWidthindex = tf.tile(tf.expandDims(convIndex, 0), [outputWidth, 1]);
        convWidthindex = tf.transpose(convWidthindex).flatten();
        convIndex = tf.transpose(tf.stack([convHeightIndex, convWidthindex]));
        convIndex = tf.reshape(convIndex, [outputWidth, outputHeight, 1, 2]);
        var convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
        // end
        boxxy = tf.div(tf.add(boxxy, convIndex), convDims);
        boxwh = tf.mul(boxwh, anchorsTensor);
        if (this.version === 'v3') {
            boxwh = tf.div(boxwh, tf.tensor([this.modelSize]));
        }
        else {
            boxwh = tf.div(boxwh, convDims);
        }
        var boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);
        return [boxes, boxConfidence, boxClassProbs];
    };
    // this is expected to be  inside a tf.tidy
    YOLODetector.prototype.rescaleBoxes = function (boxes, imgWidth, imgHeight) {
        var Width = tf.scalar(imgWidth);
        var Height = tf.scalar(imgHeight);
        // this for y1 x1 y2 x2
        var ImageDims = tf.stack([Height, Width, Height, Width]).reshape([1, 4]);
        // this for x y w h
        //const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
        return boxes.mul(ImageDims);
    };
    // this is expected to be  inside a tf.tidy
    YOLODetector.prototype.boxesToCorners = function (box_xy, box_wh) {
        var two = tf.scalar(2);
        var boxMins = tf.sub(box_xy, tf.div(box_wh, two));
        var boxMaxes = tf.add(box_xy, tf.div(box_wh, two));
        var dim_0 = boxMins.shape[0];
        var dim_1 = boxMins.shape[1];
        var dim_2 = boxMins.shape[2];
        var size = [dim_0, dim_1, dim_2, 1];
        return tf.concat([
            boxMins.slice([0, 0, 0, 1], size),
            boxMins.slice([0, 0, 0, 0], size),
            boxMaxes.slice([0, 0, 0, 1], size),
            boxMaxes.slice([0, 0, 0, 0], size),
        ], 3);
    };
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
    YOLODetector.prototype.filterBoxesSync = function (boxes, boxConfidence, boxClassProbs, classProb_thresh) {
        // class probabilities
        var boxScores = tf.max(tf.mul(boxConfidence, boxClassProbs), -1);
        // class indices
        var boxClasses = tf.argMax(boxClassProbs, -1);
        // filter mask
        var filter_thresh = tf.scalar(classProb_thresh);
        var FilterMask = tf.greaterEqual(boxScores, filter_thresh);
        var indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
        var NegativeIndicesTensor = tf.fill([boxes.shape[0]], -1, "int32");
        var indices = tf.where(FilterMask, indicesTensor, NegativeIndicesTensor);
        var filteredIndicesTensor = tf.tensor1d((indices.dataSync()).filter(function (i) { return i >= 0; }));
        var filteredBoxes = boxes.gather(filteredIndicesTensor);
        var filteredScores = boxScores.gather(filteredIndicesTensor);
        var filteredclasses = boxClasses.gather(filteredIndicesTensor);
        var _a = [filteredBoxes.dataSync(), filteredScores.dataSync(), filteredclasses.dataSync()], boxArr = _a[0], scoreArr = _a[1], classesArr = _a[2];
        return [boxArr, scoreArr, classesArr];
    };
    YOLODetector.prototype.boxIOU = function (boxArr, scoreArr, classesArr, iou_thresh) {
        var zipped = [];
        for (var i = 0; i < scoreArr.length; i += 1) {
            // [Score,[x,y,w,h,]classindex]
            zipped.push({
                Prob: scoreArr[i],
                Coords: [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
                Class: classesArr[i],
            });
        }
        // Coords:number[]
        // Class:number;
        // Prob:number;
        // Sort by descending order of scores (first index of zipped array)
        var sorted = zipped.sort(function (a, b) { return b.Prob - a.Prob; });
        var out = [];
        // Greedily go through boxes in descending score order and only
        // return boxes that are below the IoU threshold.
        for (var i = 0; i < sorted.length; i += 1) {
            var Push = true;
            for (var j = 0; j < out.length; j += 1) {
                var IOU = this.iou(out[j].Coords, sorted[i].Coords);
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
    };
    YOLODetector.prototype.iou = function (box1, box2) {
        /* Implement the intersection over union (IoU) between box1 and box2
          Arguments:
          box1 -- first box, list object with coordinates (x1, y1, x2, y2)
          box2 -- second box, list object with coordinates (x1, y1, x2, y2)
          */
        // Calculate the (y1, x1, y2, x2) coordinates of the intersection of box1 and box2. Calculate its Area.
        var xi1 = Math.max(box1[0], box2[0]);
        var yi1 = Math.max(box1[1], box2[1]);
        var xi2 = Math.min(box1[2], box2[2]);
        var yi2 = Math.min(box1[3], box2[3]);
        var interarea = (yi2 - yi1) * (xi2 - xi1);
        // Calculate the Union area by using Formula: Union(A,B) = A + B - Inter(A,B)
        var box1area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
        var box2area = (box2[2] - box2[0]) * (box2[3] - box2[1]);
        var unionarea = (box1area + box2area) - interarea;
        // compute the IoU
        return interarea / unionarea;
    };
    YOLODetector.prototype.finnalize = function (finals) {
        var detections = [];
        for (var i = 0; i < finals.length; i += 1) {
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
            var _a = finals[i].Coords, y1 = _a[0], x1 = _a[1], y2 = _a[2], x2 = _a[3];
            // Warning !  x and y are for the center of the bounding box
            var w = x2 - x1, h = y2 - y1, x = x1 + (w / 2), y = y1 - (h / 2);
            var labelIndex = finals[i].Class;
            var label = this.labels[labelIndex];
            var classProb = finals[i].Prob;
            // label:string,
            // labelIndex:number,
            // classProb:number,
            // x:number,
            // y:number,
            // w:number,
            // h:number,
            var detection = {
                label: label,
                labelIndex: labelIndex,
                classProb: classProb,
                //x1,y1,x2,y2,
                x: x,
                y: y,
                w: w,
                h: h
            };
            detections.push(detection);
        }
        return detections;
    };
    YOLODetector.prototype.isTensorOrTensorArray = function (toBeDetermined) {
        if (toBeDetermined.shape) {
            return true;
        }
        return false;
    };
    return YOLODetector;
}());
export { YOLODetector };
//# sourceMappingURL=yolo.js.map