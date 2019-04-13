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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { tf } from '../tf';
import { draw } from '../utils/draw';
import { loadModel } from '../utils/modelLoader';
import { preProcess } from '../utils/preProcess';
var YOLODetector = /** @class */ (function () {
    function YOLODetector(options) {
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
    YOLODetector.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, loadModel(this.modelURL)];
                    case 1:
                        _a.model = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Caches the model
     */
    YOLODetector.prototype.cache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dummy, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
                        return [4 /*yield*/, this.detect(dummy)];
                    case 1:
                        _a.sent();
                        tf.dispose(dummy);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Dispose of the tensors allocated by the model. You should call this when you
     * are done with the detection.
     */
    YOLODetector.prototype.dispose = function () {
        if (this.model) {
            this.model.dispose();
        }
    };
    YOLODetector.prototype.detectSyncCPU = function (image) {
        var results = this.predictInternal(image);
        var numBoxes = results[0].shape[0]; // || results[1].shape[0];
        var numClasses = results[1].shape[1];
        var boxArray = results[0].dataSync();
        var scoreArray = results[1].dataSync();
        tf.dispose(results);
        var prev = tf.getBackend();
        tf.setBackend('cpu');
        var _a = __read(this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses), 2), maxScores = _a[0], classes = _a[1];
        var boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
        var indexTensor = tf.image.nonMaxSuppression(boxes2, maxScores, this.maxOutput, this.iouThreshold, this.classProbThreshold);
        var indexArray = indexTensor.dataSync();
        tf.dispose(boxes2);
        tf.dispose(indexTensor);
        var finalBoxes = this.createFinalBoxes(boxArray, maxScores, classes, indexArray);
        tf.setBackend(prev);
        return finalBoxes;
    };
    YOLODetector.prototype.detectCPU = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var results, numBoxes, numClasses, boxArray, scoreArray, prev, _a, maxScores, classes, boxes2, indexTensor, indexArray, finalBoxes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, tf.nextFrame()];
                    case 1:
                        _b.sent();
                        results = this.predictInternal(image);
                        numBoxes = results[0].shape[0];
                        numClasses = results[1].shape[1];
                        return [4 /*yield*/, results[0].data()];
                    case 2:
                        boxArray = _b.sent();
                        return [4 /*yield*/, results[1].data()];
                    case 3:
                        scoreArray = _b.sent();
                        tf.dispose(results);
                        prev = tf.getBackend();
                        tf.setBackend('cpu');
                        _a = __read(this.getMaxScoresAndClasses(scoreArray, numBoxes, numClasses), 2), maxScores = _a[0], classes = _a[1];
                        boxes2 = tf.tensor2d(boxArray, [results[0].shape[0], results[0].shape[1]]);
                        return [4 /*yield*/, tf.image.nonMaxSuppressionAsync(boxes2, maxScores, this.maxOutput, this.iouThreshold, this.classProbThreshold)];
                    case 4:
                        indexTensor = _b.sent();
                        return [4 /*yield*/, indexTensor.data()];
                    case 5:
                        indexArray = _b.sent();
                        tf.dispose(boxes2);
                        tf.dispose(indexTensor);
                        finalBoxes = this.createFinalBoxes(boxArray, maxScores, classes, indexArray);
                        tf.setBackend(prev);
                        return [2 /*return*/, finalBoxes];
                }
            });
        });
    };
    YOLODetector.prototype.detectSync = function (image) {
        var _this = this;
        var _a = __read(tf.tidy('', function () {
            var results = _this.predictInternal(image);
            return _this.filterBoxes(results[0], results[1], _this.classProbThreshold);
        }), 3), boxes = _a[0], scores = _a[1], classes = _a[2];
        var boxArr = boxes.dataSync();
        var scoresArr = scores.dataSync();
        var classesArr = classes.dataSync();
        tf.dispose([boxes, scores, classes]);
        var rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
        return this.createDetectionArray(rawBoxes);
    };
    YOLODetector.prototype.detect = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var results, filtred, _a, boxArr, scoresArr, classesArr, rawBoxes, dets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, tf.nextFrame()];
                    case 1:
                        _b.sent();
                        results = this.predictInternal(image);
                        return [4 /*yield*/, this.filterBoxesAsync(results[0], results[1], this.classProbThreshold)];
                    case 2:
                        filtred = _b.sent();
                        return [4 /*yield*/, Promise.all([filtred[0].data(),
                                filtred[1].data(),
                                filtred[2].data()])];
                    case 3:
                        _a = __read.apply(void 0, [_b.sent(), 3]), boxArr = _a[0], scoresArr = _a[1], classesArr = _a[2];
                        tf.dispose(results);
                        tf.dispose(filtred);
                        rawBoxes = this.NonMaxSuppression(boxArr, scoresArr, classesArr, this.iouThreshold);
                        dets = this.createDetectionArray(rawBoxes);
                        return [2 /*return*/, dets];
                }
            });
        });
    };
    /**
     * Draw the detections on a `HTMLCanvasElement`
     * @param detections  detections to be drawn
     * @param canvas `HTMLCanvasElement` to draw to
     */
    YOLODetector.prototype.draw = function (detections, canvas) {
        var ctx = canvas.getContext('2d');
        var lablesLen = this.labels.length;
        draw(detections, ctx, lablesLen);
    };
    /**
     * the main function that handles the infrence it returns a `tf.Tensor[]` that containes the boxes the their scores
     * @param image the input image `Input`
     *
     * @return a `tf.Tensor[]` that contain `[Boxes, Scores]`
     * `Boxes` with a shape of `[numBoxes, 4]`
     * Each `box` is defined by `[maxY, maxX, minY, minX]`
     * Score with a shape of `[numBoxes, numClasses]`
     */
    YOLODetector.prototype.predictInternal = function (image) {
        var _this = this;
        return tf.tidy(function () {
            var _a = __read(preProcess(image, _this.modelSize, _this.resizeOption), 3), imgWidth = _a[0], imgHeight = _a[1], data = _a[2];
            var preds = _this.model.predict(data, { batchSize: 1 });
            var _b = __read(_this.postProcessRawPrediction(preds), 2), boxes = _b[0], scores = _b[1];
            var scaledBoxes = _this.rescaleBoxes(boxes, imgWidth, imgHeight);
            return [scaledBoxes, scores];
        });
    };
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
    YOLODetector.prototype.postProcessRawPrediction = function (rawPrediction) {
        var layers = [];
        if (this.isTensorArray(rawPrediction)) {
            // its a single Tensor (v2)
            for (var i = 0; i < rawPrediction.length; i++) {
                layers.push(rawPrediction[i]);
            }
        }
        else {
            layers.push(rawPrediction);
        }
        var boxes = [];
        var probs = [];
        for (var i = 0; i < layers.length; i++) {
            var mask = this.masks[i];
            var numAnchors = mask.length;
            var anchorsArr = [];
            for (var j = 0; j < numAnchors; j++) {
                anchorsArr.push(this.anchors[mask[j]]);
            }
            var anchorsTensor = tf.tensor(anchorsArr).reshape([1, 1, numAnchors, 2]);
            var classesLength = this.labels.length;
            // remove the batch dim
            var squeezed = layers[i].squeeze([0]);
            var _a = __read(this.processLayer(squeezed, anchorsTensor, this.modelSize, classesLength, this.version), 2), box = _a[0], prob = _a[1];
            boxes.push(box);
            probs.push(prob);
        }
        var boxesTensor = tf.concat(boxes, 0);
        var probsTensor = tf.concat(probs, 0);
        return [boxesTensor, probsTensor];
    };
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
    YOLODetector.prototype.processLayer = function (prediction, anchorsTensor, modelSize, classesLen, version) {
        var _a = __read([prediction.shape[0], prediction.shape[1]], 2), outputWidth = _a[0], outputHeight = _a[1];
        var anchorsLen = anchorsTensor.shape[2];
        var numBoxes = outputWidth * outputHeight * anchorsLen;
        // classesLen + 5 =  classesLen + x + y + w + h + obj_score
        var reshaped = tf.reshape(prediction, [outputWidth, outputHeight, anchorsLen, classesLen + 5]);
        var boxxy = tf.sigmoid(reshaped.slice([0, 0, 0, 0], [outputWidth, outputHeight, anchorsLen, 2]));
        var boxwh = tf.exp(reshaped.slice([0, 0, 0, 2], [outputWidth, outputHeight, anchorsLen, 2]));
        var boxConfidence = tf.sigmoid(reshaped.slice([0, 0, 0, 4], [outputWidth, outputHeight, anchorsLen, 1])).reshape([numBoxes, 1]);
        var boxClassProbs = tf.softmax(reshaped.slice([0, 0, 0, 5], [outputWidth, outputHeight, anchorsLen, classesLen]))
            .reshape([numBoxes, classesLen]);
        var classProbs = tf.mul(boxConfidence, boxClassProbs);
        // prep
        var boxIndex = tf.range(0, outputWidth);
        var boxHeightIndex = tf.tile(boxIndex, [outputHeight]);
        var boxWidthindex = tf.tile(tf.expandDims(boxIndex, 0), [outputWidth, 1]).transpose().flatten();
        var boxIndexGrid = tf.transpose(tf.stack([boxHeightIndex, boxWidthindex])).reshape([outputWidth, outputHeight, 1, 2]);
        var convDims = tf.reshape(tf.tensor1d([outputWidth, outputHeight]), [1, 1, 1, 2]);
        // end
        boxxy = tf.div(tf.add(boxxy, boxIndexGrid), convDims);
        boxwh = tf.mul(boxwh, anchorsTensor);
        if (version === 'v3') {
            boxwh = tf.div(boxwh, tf.tensor([modelSize]));
        }
        else {
            boxwh = tf.div(boxwh, convDims);
        }
        var boxes = this.boxesToCorners(boxxy, boxwh).reshape([numBoxes, 4]);
        return [boxes, classProbs];
    };
    /**
     * transforms the yolo bounding box coordinates from `center` to `top left` and joins them.
     * @param boxXY a `tf.Tensor` representing the boxes `X, Y` coordinates.
     * @param boxWH a `tf.Tensor` representing the boxes `Width, Height` values.
     *
     * @returns a `tf.Tensor` representing the transformed & joined boxes coordinates
     */
    YOLODetector.prototype.boxesToCorners = function (boxXY, boxWH) {
        var two = tf.scalar(2);
        var boxMins = tf.sub(boxXY, tf.div(boxWH, two));
        var boxMaxes = tf.add(boxXY, tf.div(boxWH, two));
        var dim0 = boxMins.shape[0];
        var dim1 = boxMins.shape[1];
        var dim2 = boxMins.shape[2];
        var size = [dim0, dim1, dim2, 1];
        return tf.concat([
            boxMins.slice([0, 0, 0, 1], size),
            boxMins.slice([0, 0, 0, 0], size),
            boxMaxes.slice([0, 0, 0, 1], size),
            boxMaxes.slice([0, 0, 0, 0], size),
        ], 3);
    };
    /**
     * rescales the boxes coordinates to the input image dimentions.
     * @param boxes a `tf.Tensor` representing the boxes coordinates. shape : `[numBoxes,4]`
     * @param imgWidth original input image Width.
     * @param imgHeight  original input image Height.
     *
     * @return a `tf.Tensor` representing the scaled boxes coordinates.
     */
    YOLODetector.prototype.rescaleBoxes = function (boxes, imgWidth, imgHeight) {
        var width = tf.scalar(imgWidth);
        var height = tf.scalar(imgHeight);
        // this for y1 x1 y2 x2
        var imageDims = tf.stack([height, width, height, width]).reshape([1, 4]);
        // this for x y w h
        // const ImageDims = tf.stack([Width, Height, Width, Height]).reshape([1, 4]);
        return boxes.mul(imageDims);
    };
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
    YOLODetector.prototype.filterBoxes = function (boxes, scores, classProbThresh) {
        var boxScore = tf.max(scores, -1);
        var boxClasses = tf.argMax(scores, -1);
        // score filter mask
        var filterThresh = tf.scalar(classProbThresh);
        var filterMask = tf.greaterEqual(boxScore, filterThresh);
        // this is somewhat a replacment for tf.boolean_mask
        var indicesTensor = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]).toInt();
        var negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
        var indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
        var filteredIndicesTensor = tf.tensor1d(indices.dataSync().filter(function (i) { return i >= 0; }));
        return [boxes.gather(filteredIndicesTensor), boxScore.gather(filteredIndicesTensor), boxClasses.gather(filteredIndicesTensor)];
    };
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
    YOLODetector.prototype.filterBoxesAsync = function (boxes, scores, classProbThresh) {
        if (classProbThresh === void 0) { classProbThresh = .5; }
        return __awaiter(this, void 0, void 0, function () {
            var boxScore, boxClasses, filterThresh, filterMask, range, indicesTensor, negativeIndicesTensor, indices, filteredIndicesTensor, _a, _b, filtredBoxes, filtredScores, filtredClasses;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        boxScore = tf.max(scores, -1);
                        boxClasses = tf.argMax(scores, -1);
                        filterThresh = tf.scalar(classProbThresh);
                        filterMask = tf.greaterEqual(boxScore, filterThresh);
                        range = tf.linspace(0, boxes.shape[0] - 1, boxes.shape[0]);
                        indicesTensor = range.toInt();
                        negativeIndicesTensor = tf.fill([boxes.shape[0]], -1, 'int32');
                        indices = tf.where(filterMask, indicesTensor, negativeIndicesTensor);
                        _b = (_a = tf).tensor1d;
                        return [4 /*yield*/, indices.data()];
                    case 1:
                        filteredIndicesTensor = _b.apply(_a, [(_c.sent()).filter(function (i) { return i >= 0; })]);
                        filtredBoxes = boxes.gather(filteredIndicesTensor);
                        filtredScores = boxScore.gather(filteredIndicesTensor);
                        filtredClasses = boxClasses.gather(filteredIndicesTensor);
                        tf.dispose([boxScore, boxClasses, filterThresh, filterMask,
                            range, indicesTensor, negativeIndicesTensor,
                            indices, filteredIndicesTensor]);
                        return [2 /*return*/, [filtredBoxes, filtredScores, filtredClasses]];
                }
            });
        });
    };
    /**
     *
     * @param scores
     * @param numBoxes
     * @param numClasses
     */
    YOLODetector.prototype.getMaxScoresAndClasses = function (scores, numBoxes, numClasses) {
        var maxes = [];
        var classes = [];
        for (var i = 0; i < numBoxes; i++) {
            var max = Number.MIN_VALUE;
            var index = -1;
            for (var j = 0; j < numClasses; j++) {
                if (scores[i * numClasses + j] > max) {
                    max = scores[i * numClasses + j];
                    index = j;
                }
            }
            maxes[i] = max;
            classes[i] = index;
        }
        return [maxes, classes];
    };
    /**
     * a small utility check to see if `toBeDetermined` is a `tf.Tensor` or a `tf.Tensor[]`
     *
     * @param  toBeDetermined `tf.Tensor` || `tf.Tensor[]`
     *
     * @returns a `boolean` indicating if it's a `tf.Tensor` or a `tf.Tensor[]`
     */
    YOLODetector.prototype.isTensorArray = function (toBeDetermined) {
        return toBeDetermined.shape ? false : true;
    };
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
    YOLODetector.prototype.NonMaxSuppression = function (boxArr, scoreArr, classesArr, iouThresh) {
        var zipped = [];
        for (var i = 0; i < scoreArr.length; i += 1) {
            zipped.push([
                [boxArr[4 * i], boxArr[(4 * i) + 1], boxArr[(4 * i) + 2], boxArr[(4 * i) + 3]],
                scoreArr[i],
                classesArr[i],
            ]);
        }
        // Sort by descending order of scores (first index of zipped array)
        var sorted = zipped.sort(function (a, b) { return b[1] - a[1]; });
        var out = [];
        // Greedily go through boxes in descending score order and only
        // return boxes that are below the IoU threshold.
        for (var i = 0; i < sorted.length; i += 1) {
            var push = true;
            for (var j = 0; j < out.length; j += 1) {
                var IOU = this.iou(out[j][0], sorted[i][0]);
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
    };
    /**
     * Implement the intersection over union (IoU) between box1 and box2
     *
     * @param box1 -- first box, number list with coordinates `(x1, y1, x2, y2)`
     * @param box2 -- second box, number list with coordinates `(x1, y1, x2, y2)`
     *
     * @return the value of `interarea` /  `unionarea`
     */
    YOLODetector.prototype.iou = function (box1, box2) {
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
    /**
     * a function similar to `createDetectionArray()` that takes the yolo output and returns a `Detection[]`
     * @param boxes  a Float32Array containing the boxes coords:Length must be `numBoxes*4`
     * @param scores an array containing the boxes scores probability:Length must be `numBoxes`
     * @param classes an array  containing the detection label index:Length must be `numBoxes`
     * @param indexes a Float32Array containing the indexes of the boxes that we want to keep:Length must be `numBoxes`
     *
     * @return a `Detection[]` with the final collected boxes
     */
    YOLODetector.prototype.createFinalBoxes = function (boxes, scores, classes, indexes) {
        var count = indexes.length;
        var objects = [];
        for (var i = 0; i < count; i++) {
            var bbox = [];
            for (var j = 0; j < 4; j++) {
                bbox[j] = boxes[indexes[i] * 4 + j];
            }
            var maxY = bbox[0];
            var maxX = bbox[1];
            var minY = bbox[2];
            var minX = bbox[3];
            var w = minX - maxX;
            var h = minY - maxY;
            // const x = maxX + (w / 2);
            // const y = maxY - (h / 2);
            var classIndex = classes[indexes[i]];
            var detection = {
                label: this.labels[classIndex],
                labelIndex: classIndex,
                score: scores[indexes[i]],
                x: maxX,
                y: maxY,
                w: w,
                h: h,
            };
            objects.push(detection);
        }
        return objects;
    };
    /**
     * The final phase in the post processing that outputs the final `Detection[]`
     *
     * @param finalBoxes an array containing the raw box information
     *
     * @return a `Detection[]` with the final collected boxes
     */
    YOLODetector.prototype.createDetectionArray = function (finalBoxes) {
        var detections = [];
        for (var i = 0; i < finalBoxes.length; i += 1) {
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
            var _a = __read(finalBoxes[i][0], 4), maxY = _a[0], maxX = _a[1], minY = _a[2], minX = _a[3];
            var classIndex = finalBoxes[i][2];
            // // Warning !  x and y are for the center of the bounding box
            // const w = minX - maxX;
            // const h = minY - maxY;
            var detection = {
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
    };
    return YOLODetector;
}());
export { YOLODetector };
//# sourceMappingURL=yolo.js.map