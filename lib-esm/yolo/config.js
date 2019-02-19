import { coco_labels } from "../shared/coco_labels";
var TinyYOLOv3Config = {
    modelURL: '',
    version: 'v3',
    modelSize: 416,
    iouThreshold: .5,
    classProbThreshold: .5,
    labels: coco_labels,
    anchors: [[10, 14], [23, 27], [37, 58], [81, 82], [135, 169], [344, 319]],
    masks: [[3, 4, 5], [0, 1, 2]],
    ResizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
};
var TinyYOLOv2Config = {
    modelURL: '',
    version: 'v2',
    modelSize: 416,
    iouThreshold: .5,
    classProbThreshold: .5,
    labels: coco_labels,
    masks: [[0, 1, 2, 3, 4]],
    anchors: [[0.57273, 0.677385], [1.87446, 2.06253], [3.33843, 5.47434], [7.88282, 3.52778], [9.77052, 9.16828]],
    ResizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
};
var YOLOv3Config = {
    version: 'v3',
    modelSize: 416,
    iouThreshold: .5,
    classProbThreshold: .5,
    labels: coco_labels,
    anchors: [[10, 13], [16, 30], [33, 23], [30, 61], [62, 45], [59, 119], [116, 90], [156, 198], [373, 326]],
    masks: [[6, 7, 8], [3, 4, 5], [0, 1, 2]],
    ResizeOption: {
        ResizeOption: 'Bilinear',
        AlignCorners: true,
    },
};
export { YOLOv3Config, TinyYOLOv2Config, TinyYOLOv3Config };
//# sourceMappingURL=config.js.map