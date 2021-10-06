const detectorConfig = {
    ...YOLO.YOLOV2TinyConfig,
    modelSize: [416, 739],
    modelURL: 'assets/yolov2-tiny/model.json',
};
const MEDIA_CONTAINER_ID = 'media-container';
const DATA_SOURCE = 'data-source';
const DRAW_CANVAS = 'draw-canvas';

const mediaContainer = document.getElementById(MEDIA_CONTAINER_ID);
const media = document.getElementById(DATA_SOURCE);
const drawCanvas = document.getElementById(DRAW_CANVAS);

let detector;


function detect(image) {
    const result = detector.detect(image);
    detector.draw(result.detections, drawCanvas)
    return result;
}

tf.ready().then(
    () => {
        detector = new YOLO.YOLODetector(detectorConfig);
        detector.load().then(
            () => {
                console.log('YOLO Loaded...');
                detector.cache().then(
                    () => {
                        console.log('YOLO Cached');
                        for (let i = 0; i < 20; i++) {
                            let p1 = performance.now();
                            const result = detect(media)
                            let p2 = performance.now();
                            console.log(`took ${p2 - p1} ms`);                            
                        }
                    }
                )
            }
        )
    }
)
