const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
class DetectionLoop {
    constructor(videoSource, outputCanvas, maxFrameRate, StatMonitor) {
        this.READY_TO_DETECT = false;
        this.MEDIA_READY_TO_DETECT = false;
        this.IS_PAGE_VISIBLE = true;
        this.IS_TRACK_STOPED = true;

        // this.detector = new  YOLO.Detector({
        //     ...YOLO.TinyYOLOLiteConfig,
        //     modelSize: 224,
        //     modelURL:'/models/ObjectDetection/yolov2-lite/model.json',
        // });
          this.detector = new  YOLO.Detector({
            ...YOLO.YOLOv3Config,
            modelSize: 224,
            modelURL:'/models/ObjectDetection/yolov3/model.json',
        });
        // this.detector = new  YOLO.Detector({
        //     ...YOLO.TinyYOLOv2Config,
        //     modelSize: 416,
        //     modelURL:'/models/ObjectDetection/yolov2-tiny/model.json',
        // });

        this.StatMonitor = StatMonitor;
        this.videoSource = videoSource;
        this.outputCanvas = outputCanvas;
        this.ctx = this.outputCanvas.getContext('2d');
        this.videoSource.src   = "https://r5---sn-hgn7rn7r.googlevideo.com/videoplayback?signature=2F1131A4664802098DB09DAC15F4FCCC40FBE89E.697EB373EB85AFA476FDCCBAEE222BE62A7A377D&source=youtube&sparams=dur,ei,expire,id,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&expire=1552677628&c=WEB&fvip=5&mime=video%2Fmp4&ip=144.76.7.75&id=o-AIsm6JIGPzFuQSAPhzLWGA9uQcplcd7XjUg6pH9aCQn8&ratebypass=yes&requiressl=yes&beids=9466587&ipbits=0&key=cms1&lmt=1529396931990880&dur=1537.137&pl=17&itag=22&ei=m6aLXP-sM5ao1gKn6qmoCA&title=Walking%20tour%20of%20Times%20Square%20in%20Midtown%20Manhattan%20New%20York%20City%20Travel%20Guide%20%E3%80%904K%E3%80%91%20%F0%9F%97%BD&mip=197.2.60.216&redirect_counter=1&cm2rm=sn-uv2oxuuo-u0oe7s&fexp=9466587&req_id=26f8c9cb0409a3ee&cms_redirect=yes&mm=29&mn=sn-hgn7rn7r&ms=rdu&mt=1552655922&mv=m"
        //this.videoSource.src = "https://r1---sn-hgn7yn7e.googlevideo.com/videoplayback?c=WEB&txp=5531332&id=o-ALTuUJeJb_HW4RcOZQIQ8XobX8nn0yFyuW-DFLpVlp4h&signature=0C77FF20DF30F3FF10237FC4D1DAD420600F06FA.5E2005344EF53743F146C96EC4178E4E7C929BFE&key=cms1&source=youtube&dur=976.793&ei=QZKLXKj1IdbF-ga54arACQ&ip=144.76.38.88&requiressl=yes&pl=17&ratebypass=yes&fvip=1&ipbits=0&beids=23800701&itag=22&expire=1552672417&sparams=dur,ei,expire,id,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&mime=video%2Fmp4&lmt=1535785335833994&title=NEW%20YORK%20CITY%202018%20LIFESTYLE%20on%20the%20STREETS%20of%20MANHATTAN!%20[4K]&mip=197.2.60.216&redirect_counter=1&cm2rm=sn-uv2oxuuo-u0os7e&fexp=23800701&req_id=e7fe3e0ced63a3ee&cms_redirect=yes&mm=29&mn=sn-hgn7yn7e&ms=rdu&mt=1552650690&mv=m"
        // this.videoSource.src = "https://r1---sn-4g5edn7s.googlevideo.com/videoplayback?mime=video%2Fmp4&id=o-AGNmaIeXtH7XPWlMRywnJWbCq4fhdmzOdTigKovDzrdT&expire=1552671769&source=youtube&ip=144.76.76.208&key=cms1&c=WEB&txp=5531432&dur=3948.646&itag=22&pl=17&requiressl=yes&ipbits=0&ratebypass=yes&fvip=1&sparams=dur,ei,expire,id,ip,ipbits,itag,lmt,mime,mip,mm,mn,ms,mv,pl,ratebypass,requiressl,source&signature=5B58DA635409725E86E990233F9E170412C17F06.5EE5C4C1C2D3AE671A7963F7AE5FFC5D2E9A1FFD&lmt=1542522383585484&ei=uI-LXKm-L4OQgAeb2K6YDg&title=Busiest%20city%20in%20the%20world%20%20What%20TOKYO%20Shibuya%20looks%20like%20-%204K%20UHD&mip=197.2.60.216&cm2rm=sn-uv2oxuuo-u0oe7e,sn-hgnl77s&req_id=7ee83af4a5f5a3ee&redirect_counter=2&cms_redirect=yes&mm=34&mn=sn-4g5edn7s&ms=ltu&mt=1552650120&mv=m"
        this.MEDIA_READY_TO_DETECT = true;
        this.IS_TRACK_STOPED = false;
        // setCameraToVideoElement(this.videoSource).then(() => {
        //     this.MEDIA_READY_TO_DETECT = true;
        //     this.IS_TRACK_STOPED = false;
        // });
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
            console.log(tf.ENV)
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
    stopVideoTrack() {
        let stream = this.videoSource.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        this.videoSource.srcObject = null;
    }
    resumeVideoTrack() {
        if (!this.videoSource.srcObject) {
            setCameraToVideoElement(this.videoSource).then(() => {
                this.MEDIA_READY_TO_DETECT = true;
                this.IS_TRACK_STOPED = false;
            });
        }

    }
    SetMaxFrameRate() {
        this.MaxTimePerFrame = 1000 / this.MaxframeRate
        this.StopDetection()
        this.StartDetection()
    }
    DetecOnce(){
        this.ctx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        let results = this.detector.detectCPU(this.videoSource);
        console.log(results)
        this.detector.draw(results, this.outputCanvas);
    }

    async TestDetection(){
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

