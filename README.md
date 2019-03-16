# YOLO.JS
#### A work in progress implementaion of the YOLO object detection in javascript running on top of Tensorflow.js 
![](img/yolo-light-v2.gif)
yolo-v2-light with 416x416 input size on a GTX 1050ti/Chrome/Win10x64  ± 30 FPS


![](img/yolo-full-v3.gif)
yolo-v3 pretrained weights with 224x224 input size on a GTX 1050ti/Chrome/Win10x64  ± 9 FPS

source: https://www.youtube.com/watch?v=u68EWmtKZw0

#### I will upload the model and add some socs soon

## Usage
```
git clone ... && npm install && webpack
```
if every thing went sucessfully you should see a `yolo.js` and a `yolo.min.js` in the `/dist` folder

** basic usage : 
```html
<script src='yolo.js'>
/* note : tfjs is already shipped with yolo  so you dont need to include it  */
```

```javascript
const config = {
    // Model URL
    modelURL: '',
    // Model version : this is important as there is some post processing changes 'v2' ||'v3'
    version: 'v2',
    // this is the size of the model input image : we can lower this to gain more performance
    //  the ones that i found to be a good compromise between perf/accracy are 224, 256, 320
    modelSize: 416, // 128 , 160 , 192 , 224 , 256 , 288 , 320 , 352 , 384 , 416,
    
    // Intersection Over Union threshhold and Class probability threshold  we use this to filter the output of the neural net
    iouThreshold: 0.5,
    classProbThreshold: 0.5,

    // max detection output
    maxOutput: number,
    // class labels
    labels: COCO_CLASSES,

    // more info see: https://arxiv.org/pdf/1612.08242.pdf
    anchors: [
        [0.57273, 0.677385],
        [1.87446, 2.06253],
        [3.33843, 5.47434],
        [7.88282, 3.52778],
        [9.77052, 9.16828],
    ],
    // in yolo v3 the neural net give 2 or more outputs(set of boxes) so this mask splits the anchors to groups
    // each corresponding to a spesific layer/output.
    // for example the tiny yolo v2 outputs 1 output that has 13x13x5 boxes (if you use 416 as a model size)
    masks: [
        [0, 1, 2, 3, 4],
    ],

    // this is just more customization options concerning the preprocessing  pahse
    preProcessingOptions: {
        // 'NearestNeighbor'  - this output a more accurate image but but take a bit longer
        // 'Bilinear' - this faster but scrifices image quality
        ResizeOption: 'Bilinear',
        AlignCorners: true,
  },
}

// Or you can use one of the pre made configs but you need to specify the model url yourself //

const config = {
    ...YOLO.TinyYOLOLiteConfig,
    modelSize: 416,
    modelURL: '',
}


const detector = new YOLO.Detector(config);
detector.load().then(() => {
    detector.detectAsync(img).then((dets) => {
        console.log(dets)
    })
})


```
