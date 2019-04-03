// Load the binding
global.fetch = require('node-fetch')
const now = require("performance-now")

const tf = require('@tensorflow/tfjs-node');
const YOLO = require('@hiddentn/yolo.js');

const config = {
    ...YOLO.tinyYOLOv2Config,
    modelURL: '../../models/ObjectDetection/yolov2-tiny/model.json'
}

const detector = new YOLO.YOLODetector(config)
const handler = tf.io.fileSystem(config.modelURL);
test();



async  function test() {
const loaded = await detector.loadFromDisk(handler)
if (loaded) {
    console.log('Loaded')
    for (let i = 0; i < 1000; i++) {
        const t1 = now();
        await detector.cache();
        const t2 = now();
        console.log('took:',(t2-t1));
    }
   
}

}


