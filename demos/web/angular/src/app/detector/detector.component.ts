import { Component, OnInit } from '@angular/core';
import * as YOLO from '@hiddentn/yolo.js';
import * as tf from '@tensorflow/tfjs';
import * as dat from 'dat.gui';
import ResizeObserver from 'resize-observer-polyfill';
import { Stats } from '../stats';
import { setCameraToVideoElement } from '../utils';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detector',
  templateUrl: './detector.component.html',
  styleUrls: ['./detector.component.css'],
})
export class DetectorComponent implements OnInit {

  public  cameraconfig = {
    audio: false,
    video: {
      facingMode: 'environment',
      width: {
        ideal: 1920,
      },
      height: {
          ideal: 1080,
      },
    },
  }
  public modelName: string;

  public videoSource: HTMLVideoElement;

  public outputCanvas: HTMLCanvasElement;
  public context : CanvasRenderingContext2D;
  public videoWrapper: HTMLDivElement;
  public perfLayer: HTMLDivElement;
  public controlPanel: HTMLDivElement;

  public resizeObserver: ResizeObserver;

  public isAppfullScreen: boolean;
  public isPageVisible: boolean;
  public isTrackStopped: boolean;
  public readyToDetect: boolean;

  public detector: YOLO.YOLODetector;
  public isModelLoded : boolean
  public MaxDetections: number;
  public MaxframeRate: number;

  public detectionLoop: any;

  public perfMeter: Stats;
  public controlsGUI: dat.GUI;


  constructor(private router: Router, private route: ActivatedRoute) {}

  public ngOnInit() {
    this.route.url.subscribe(() => {
      window.scrollTo(0, 0);
      const detectorName = this.route.snapshot.paramMap.get('name');
      this.readyToDetect = false;
      this.isModelLoded = false;
      if (this.modelName !== detectorName) {
        this.modelName = detectorName;
        let config: YOLO.YOLODetectorConfig;
        if (detectorName === 'tiny-yolo-v2') {
          config = {
            ...YOLO.tinyYOLOv2Config,
            modelURL: 'assets/models/objectdetection/yolov2-tiny/model.json',
          };
        } else if (detectorName === 'tiny-yolo-v3') {
          config = {
            ...YOLO.tinyYOLOv3Config,
            modelURL: 'assets/models/objectdetection/yolov3-tiny/model.json',
          };
        } else if (detectorName === 'tiny-yolo-v2-lite') {
          config = {
            ...YOLO.tinyYOLOLiteConfig,
            modelURL: 'assets/models/objectdetection/yolov2-lite/model.json',
          };
        } else if (detectorName === 'yolo-v3') {
          config = {
            ...YOLO.yolov3Config,
            modelURL: 'assets/models/objectdetection/yolov3/model.json',
          };
        }
        this.detector = new YOLO.YOLODetector(config);

      } else {
        this.readyToDetect = true;
        this.isModelLoded = true;
      }
    });
    this.isPageVisible = true;
    this.isTrackStopped = true;
    this.isAppfullScreen = false;

    this.MaxframeRate = 20;
    this.MaxDetections = 20;

    this.videoSource = document.getElementById('source') as HTMLVideoElement;
    this.outputCanvas = document.getElementById('detection') as HTMLCanvasElement;
    this.context = this.outputCanvas.getContext('2d');
    this.videoWrapper = document.getElementById('video-main') as HTMLDivElement;
    this.perfLayer = document.getElementById('perf-layer') as HTMLDivElement;
    this.controlPanel = document.getElementById('controls-wrapper') as HTMLDivElement;

     // handle size changes & visibility;
    this.resizeObserver = new ResizeObserver(() => {
          // tf.from fixels needs this with the video element
          this.videoSource.setAttribute('width', `${this.videoSource.offsetWidth}px`);
          this.videoSource.setAttribute('height', `${this.videoSource.offsetHeight}px`);
          this.outputCanvas.width = this.videoSource.offsetWidth;
          this.outputCanvas.height = this.videoSource.offsetHeight;

    });
    this.resizeObserver.observe((this.videoSource));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.isPageVisible = true;
        if (this.isTrackStopped) {
            this.resumeVideoTrack();
        }
    } else {
        this.isPageVisible = false;
        this.stopVideoTrack();
    }
    });
    setCameraToVideoElement(this.videoSource, this.cameraconfig).then(() => {
      this.isTrackStopped = false;
    });

    // fullscreen stuff
    this.videoWrapper.addEventListener('webkitfullscreenchange', () => this.isAppfullScreen = !this.isAppfullScreen, false);
    this.videoWrapper.addEventListener('mozfullscreenchange', () => this.isAppfullScreen = !this.isAppfullScreen, false);
    this.videoWrapper.addEventListener('fullscreenchange', () => this.isAppfullScreen = !this.isAppfullScreen, false);
    this.videoWrapper.addEventListener('MSFullscreenChange', () => this.isAppfullScreen = !this.isAppfullScreen, false);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11') {
        e.preventDefault()
        this.videoWrapper.requestFullscreen();
      }
    });

    this.perfMeter = new Stats(0);
    this.perfLayer.appendChild(this.perfMeter.dom);
    this.controlsGUI = new dat.GUI({name: 'Controls', autoPlace: false , closeOnTop: false, hideable: false});

    const controlsFolder = this.controlsGUI.addFolder('Controls');
    controlsFolder.add(this, 'loadModel').name('Load Model');
    controlsFolder.add(this, 'startDetection').name('Start Detection');
    controlsFolder.add(this, 'stopDetection').name('Stop Detection');

    const modelParams = this.controlsGUI.addFolder('Model Parameters');
    modelParams.add(this.detector, 'iouThreshold', 0, 1).name('IOU Threshold');
    modelParams.add(this.detector, 'classProbThreshold', 0, 1).name('Probability Threshhold');
    modelParams.add(this.detector, 'modelSize', 32, 416, 32).name('Model Size');

    const detectionParams = this.controlsGUI.addFolder('Detection Parameters');
    detectionParams.add(this, 'MaxframeRate', 1, 30, 1).name('Max FrameRate');
    detectionParams.add(this, 'SetMaxFrameRate').name('Set FrameRate');
    detectionParams.add(this, 'MaxDetections', 0, 20).name('Max Detections');
    controlsFolder.open();
    modelParams.open();
    detectionParams.open();
    this.controlsGUI.open();

    // removes colse btn
    this.controlsGUI.domElement.removeChild(this.controlsGUI.domElement.childNodes[1]);
    this.controlPanel.appendChild(this.controlsGUI.domElement);
  }

  async loadModel() {
    this.detector.load().then(()=>{
      console.log('loaded');
      this.isModelLoded = true;
      this.detector.cache().then(()=>{
        this.readyToDetect = true;
        console.log('ready');

      })
    })
  }

  startDetection() {
    if (this.readyToDetect) {
      if (!this.detectionLoop) {
          console.log('added detection loop')
          this.detectionLoop = setInterval(
              async () => {
                  try {
                      await tf.nextFrame()
                      this.context.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
                      if (!(this.videoSource.paused || this.videoSource.ended || this.videoSource.seeking || this.videoSource.readyState < this.videoSource.HAVE_FUTURE_DATA) &&
                          this.readyToDetect &&
                          !this.isTrackStopped &&
                          this.isPageVisible) {
                          this.perfMeter.begin();
                          let results = await  this.detector.detectSync(this.videoSource);
                          console.log(results);
                          this.detector.draw(results, this.outputCanvas);
                          this.perfMeter.end();
                      }
                  } catch (e) {
                      console.error(e)
                  }
              }, this.MaxframeRate)
      }

  } else {
      window.alert("Please Load the Model first")
  }
  }
  stopDetection() {
    console.log('removed detection loop')
    this.context.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
    clearInterval(this.detectionLoop);
    this.detectionLoop = null;
  }
  SetMaxFrameRate() {}



  public stopVideoTrack() {
    const stream = this.videoSource.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.isTrackStopped = true;
      this.readyToDetect = false;
      this.videoSource.srcObject = null;
    }
  }

  public resumeVideoTrack() {
    if (!this.videoSource.srcObject) {
      setCameraToVideoElement(this.videoSource, this.cameraconfig).then(() => {
        this.readyToDetect = true;
        this.isTrackStopped = false;
      });
    }

  }

}
