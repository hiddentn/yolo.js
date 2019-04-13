"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tf = __importStar(require("@tensorflow/tfjs"));
exports.tf = tf;
// tslint:disable: no-console
var version = tf.version.tfjs;
var backEnd = tf.getBackend();
console.log("Using Tensorflow/tfjs : " + version);
console.log("Using backend : " + backEnd);
//# sourceMappingURL=tf.js.map