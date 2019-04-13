// Load the binding
const tf = require('@tensorflow/tfjs');
const YOLO = require('@hiddentn/yolo.js');
global.fetch = require('node-fetch');
const now = require('performance-now');

console.log('///Node///');
const version = tf.version.tfjs;
const backEnd = tf.getBackend();
console.log(`Using Tensorflow/tfjs : ${version}`);
console.log(`Using backend : ${backEnd}`);

// const config = {
//     ...DarknetTinyConfig,
//     modelURL: '../../models/classifiers/darknet-tiny/model.json'
// }

// const classifier = new DarknetClassifier(config)
// const handler = tf.io.fileSystem(config.modelURL);
// test();



// async  function test() {
// const loaded = await classifier.loadFromDisk(handler)
// if (loaded) {
//     console.log('Loaded')
//     for (let i = 0; i < 1000; i++) {
//         const t1 = now();
//         await classifier.cache();
//         const t2 = now();
//         console.log('tool',(t2-t1));
//     }
   
// }

// }


