"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tf_1 = require("../tf");
/**
 * Performs the pre processing ops for the yolo/darknet CNN
 *
 * @param input can be  `HTMLCanvasElement` || `HTMLVideoElement` || `ImageData` || `HTMLImageElement` || `Tensor`;
 * @param size model input size
 * @param options some options regarding image resizing
 *
 * @return  an array the image original width and height and the preprocessed image tensor
 *          original image Width as a `number`
 *          original image Height as a `number`
 *          a 4D tensor with the shape of `[1,size,size,3]`
 */
function preProcess(input, size, options) {
    return tf_1.tf.tidy('preprocessing the yolo/darknet CNN', function () {
        var image;
        if (input instanceof tf_1.tf.Tensor) {
            image = input;
        }
        else {
            if (input instanceof HTMLImageElement ||
                input instanceof HTMLVideoElement ||
                input instanceof ImageData ||
                input instanceof HTMLCanvasElement) {
                image = tf_1.tf.browser.fromPixels(input);
            }
        }
        var _a = __read([image.shape[1], image.shape[0]], 2), imgWidth = _a[0], imgHeight = _a[1];
        // Normalize the image from [0, 255] to [0, 1].
        var normalized = image.toFloat().div(tf_1.tf.scalar(255));
        var resized = normalized;
        if (normalized.shape[0] !== size || normalized.shape[1] !== size) {
            var alignCorners = options.AlignCorners;
            if (options.ResizeOption === 'Bilinear') {
                resized = tf_1.tf.image.resizeNearestNeighbor(normalized, [size, size], alignCorners);
            }
            else {
                resized = tf_1.tf.image.resizeBilinear(normalized, [size, size], alignCorners);
            }
        }
        // Reshape to a single-element batch so we can pass it to predict.
        var batched = resized.reshape([1, size, size, 3]);
        return [imgWidth, imgHeight, batched];
    });
}
exports.preProcess = preProcess;
//# sourceMappingURL=preProcess.js.map