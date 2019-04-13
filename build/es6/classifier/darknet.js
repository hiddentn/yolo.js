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
import { tf } from '../tf';
import { loadModel } from '../utils/modelLoader';
import { preProcess } from '../utils/preProcess';
var DarknetClassifier = /** @class */ (function () {
    function DarknetClassifier(options) {
        this.modelName = options.modelName;
        this.modelURL = options.modelURL;
        this.modelSize = options.modelSize;
        this.classProbThreshold = options.classProbThreshold;
        this.topK = options.topK;
        this.labels = options.labels;
        this.resizeOption = options.resizeOption;
    }
    /**
     * Loads the model from `modelURL`
     */
    DarknetClassifier.prototype.load = function () {
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
    DarknetClassifier.prototype.cache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dummy, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        dummy = tf.zeros([this.modelSize, this.modelSize, 3]);
                        return [4 /*yield*/, this.classify(dummy)];
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
    DarknetClassifier.prototype.dispose = function () {
        if (this.model) {
            this.model.dispose();
        }
    };
    /**
     * the main function that handles the infrence it returns a `Classification[]` that containes the classifications the their scores
     * @param image the input image `Input`
     *
     * @return a `Pormise` that resolves to a `Classification[]`
     */
    DarknetClassifier.prototype.classify = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, values, indices, valuesArray, indicesArray;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, tf.nextFrame()];
                    case 1:
                        _b.sent();
                        _a = tf.tidy(function () {
                            var logits = _this.classifyInternal(image);
                            var classes = tf.softmax(logits);
                            return tf.topk(classes, _this.topK, true);
                        }), values = _a.values, indices = _a.indices;
                        return [4 /*yield*/, values.data()];
                    case 2:
                        valuesArray = _b.sent();
                        return [4 /*yield*/, indices.data()];
                    case 3:
                        indicesArray = _b.sent();
                        tf.dispose({ values: values, indices: indices });
                        return [2 /*return*/, this.createClassificationsArray(valuesArray, indicesArray)];
                }
            });
        });
    };
    /**
     * the main function that handles the infrence it returns a `Classification[]` that containes the classifications the their scores
     * @param image the input image `Input`
     *
     * @return a `Classification[]`
     */
    DarknetClassifier.prototype.classifySync = function (image) {
        var _this = this;
        var _a = tf.tidy(function () {
            var logits = _this.classifyInternal(image);
            var classes = tf.softmax(logits);
            return tf.topk(classes, _this.topK, true);
        }), values = _a.values, indices = _a.indices;
        var valuesArray = values.dataSync();
        var indicesArray = indices.dataSync();
        tf.dispose({ values: values, indices: indices });
        return this.createClassificationsArray(valuesArray, indicesArray);
    };
    DarknetClassifier.prototype.classifyInternal = function (image) {
        var _this = this;
        return tf.tidy(function () {
            var data = preProcess(image, _this.modelSize, _this.resizeOption);
            return _this.model.predict(data[2]);
        });
    };
    DarknetClassifier.prototype.createClassificationsArray = function (values, indices) {
        var classifications = [];
        for (var i = 0; i < indices.length; i++) {
            var c = {
                label: this.labels[indices[i]],
                labelIndex: indices[i],
                score: values[i],
            };
            classifications.push(c);
        }
        return classifications;
    };
    return DarknetClassifier;
}());
export { DarknetClassifier };
//# sourceMappingURL=darknet.js.map