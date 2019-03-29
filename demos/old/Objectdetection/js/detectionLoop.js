const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
class DetectionLoop {
    constructor(videoSource, outputCanvas, maxFrameRate, StatMonitor) {
        this.READY_TO_DETECT = false;
        this.MEDIA_READY_TO_DETECT = false;
        this.IS_PAGE_VISIBLE = true;
        this.IS_TRACK_STOPED = true;

        this.detector = YOLO.Detector({
            ...YOLO.tinyYOLOv2Config,
            modelSize: 416,
            modelURL:'/models/ObjectDetection/yolov2-tiny/model.json',
        });
        this.StatMonitor = StatMonitor;
        this.videoSource = videoSource;
        this.outputCanvas = outputCanvas;
        this.ctx = this.outputCanvas.getContext('2d');


        this.MEDIA_READY_TO_DETECT = true;
        this.IS_TRACK_STOPED = false;
        setCameraToVideoElement(this.videoSource).then(() => {
            this.MEDIA_READY_TO_DETECT = true;
            this.IS_TRACK_STOPED = false;
        });
        this.vidLoop = null;
        this.MaxframeRate = maxFrameRate;
        this.MaxTimePerFrame = 1000 / this.MaxframeRate
        this.MaxDetections = 20;

        (async () => {
            await this.detector.load()
            this.detector.cache()
            //tf.enableProdMode()
            this.READY_TO_DETECT = true;
            console.log("READY_TO_DETECT")
        })()

        // handle size changes & visibility;
        this.resizeObserver = new ResizeObserver(this.videoSizeChanged).observe(this.videoSource)
        document.addEventListener("visibilitychange", this.visibilityChanged);


    }

    visibilityChanged = () => {
        console.log(document.visibilityState)
        if (document.visibilityState === 'visible') {
            this.IS_PAGE_VISIBLE = true;
            if (this.IS_TRACK_STOPED) {
                this.resumeVideoTrack();
                this.IS_TRACK_STOPED = false;
            }
        } else {
            this.IS_PAGE_VISIBLE = false;
            this.stopVideoTrack();
            this.IS_TRACK_STOPED = true;
            this.MEDIA_READY_TO_DETECT = false;
        }
    }
    videoSizeChanged = () => {
        // tf.from fixels needs this with the video element
        this.videoSource.setAttribute("width", `${this.videoSource.offsetWidth}px`)
        this.videoSource.setAttribute("height", `${this.videoSource.offsetHeight}px`)
        this.outputCanvas.width = this.videoSource.offsetWidth
        this.outputCanvas.height = this.videoSource.offsetHeight
    }
    stopVideoTrack = () => {
        let stream = this.videoSource.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        this.videoSource.srcObject = null;
    }
    resumeVideoTrack = () => {
        if (!this.videoSource.srcObject) {
            setCameraToVideoElement(this.videoSource).then(() => {
                this.MEDIA_READY_TO_DETECT = true;
                this.IS_TRACK_STOPED = false;
            });
        }

    }
    SetMaxFrameRate = () => {
        this.MaxTimePerFrame = 1000 / this.MaxframeRate
        this.StopDetection()
        this.StartDetection()
    }
    DetecOnce = () => {
        this.ctx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        let results = this.detector.detectCPU(this.videoSource);
        console.log(results)
        this.detector.draw(results, this.outputCanvas);
    }

    TestDetection = async () => {
        let max = Number.MIN_VALUE;
        let min = Number.MAX_VALUE;
        let avg = []
        for (let index = 0; index < 50; index++) {
            let t_start = performance.now()
            let results = this.detector.detect(this.videoSource);
            let t_end = performance.now()
            let perf = t_end - t_start;
            if (perf<min) min = perf;
            if (perf>max) max = perf;
            avg.push(perf)
            console.log(results)
            console.log(tf.memory().numTensors)
        }
        console.log(`Min : ${min}  Avg: ${average(avg)}  Max : ${max} `)
    }

    StartDetection() {
        if (this.READY_TO_DETECT) {
            if (!this.vidloop) {
                console.log('added detection loop')
                this.vidloop = setInterval(
                    async () => {
                        try {
                            await tf.nextFrame();
                            this.ctx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
                            if (!(this.videoSource.paused || this.videoSource.ended || this.videoSource.seeking || this.videoSource.readyState < this.videoSource.HAVE_FUTURE_DATA) &&
                                this.READY_TO_DETECT &&
                                this.MEDIA_READY_TO_DETECT &&
                                this.IS_PAGE_VISIBLE) {
                                this.StatMonitor.begin();
                                let results = this.detector.detect(this.videoSource);
                                this.detector.draw(results,this.outputCanvas);
                                this.StatMonitor.end();
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }, this.MaxTimePerFrame)
            }

        } else {
            window.alert("Please Load the Model first")
        }
    }
    StopDetection() {
        console.log('removed detection loop')
        this.ctx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        clearInterval(this.vidloop);
        this.vidloop = null
    }

    LoadDetector(){

    }


}

