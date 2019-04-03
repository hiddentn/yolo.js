// Load the binding
global.fetch = require('node-fetch')
const now = require("performance-now")

const tf = require('@tensorflow/tfjs-node');
const YOLO = require('@hiddentn/yolo.js');

const config = {
    ...YOLO.darknetTinyConfig,
    modelURL: '../../models/classifiers/darknet-tiny/model.json'
}

const classifier = new YOLO.DarknetClassifier(config)
const handler = tf.io.fileSystem(config.modelURL);
test();



async  function test() {
const loaded = await classifier.loadFromDisk(handler)
if (loaded) {
    console.log('Loaded')
    for (let i = 0; i < 1000; i++) {
        const t1 = now();
        await classifier.cache();
        const t2 = now();
        console.log('tool',(t2-t1));
    }
   
}

}


