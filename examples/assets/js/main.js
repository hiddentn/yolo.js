///////////// WEBCONSOLE /////////////////////
var WebCon = new WebConsole('console');
WebCon.log("Initilizing.............");



const MEDIA_CONTAINER_ID = 'media-container';
const mediaContainerEl = document.getElementById(MEDIA_CONTAINER_ID);


///////////// STATS.JS /////////////////////
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
mediaContainerEl.appendChild(stats.dom);

WebCon.log("Done !")


const data = document.getElementById('data-source')
console.log(data)
const detector = new YOLO.YOLODetector(detectorConfig);


TestDetection = async () => {
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    let avg = [];
    for (let index = 0; index < 50; index++) {
        let t_start = performance.now();
        let results = detector.detect(data);
        let t_end = performance.now();
        let perf = t_end - t_start;
        if (perf < min) min = perf;
        if (perf > max) max = perf;
        avg.push(perf);
        console.log(results);
        console.log(tf.memory().numTensors);
    }
    console.log(`Min : ${min}  Avg: ${average(avg)}  Max : ${max} `);
};

LoadDetector = () => {
    detector.loadAsync().then(
        loaded => {
            detector.cacheAsync().then(
                cached => {
                    console.log("READY_TO_DETECT");
                    TestDetection()
                },
                err => {
                    console.log(err);
                },
            );
        },
        err => {
            console.log(err);
        },
    );
}


LoadDetector();
