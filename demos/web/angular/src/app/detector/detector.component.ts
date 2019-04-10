import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YOLODetector } from '@hiddentn/yolo.js';
import * as dat from 'dat.gui';
import ResizeObserver from 'resize-observer-polyfill';
import { ErrorService } from '../Services/error.service';
import { ModelsService } from '../Services/models.service';
import { Stats } from '../stats';

@Component({
  selector: 'app-detector',
  templateUrl: './detector.component.html',
  styleUrls: ['./detector.component.css'],
})
export class DetectorComponent implements OnInit,OnDestroy {
 
	@ViewChild('videoSrc') public vidSource: ElementRef;
	@ViewChild('videoLayer') public vidLayer: ElementRef;
	@ViewChild('detectionCanvas') public detCanvas: ElementRef;
	@ViewChild('performanceLayer') public perfLayer: ElementRef;
  @ViewChild('controlsPanel') public controlPanel: ElementRef;
  
	public modelName: string;
	public detector: YOLODetector;

	public videoSource: HTMLVideoElement;
	public outputCanvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;

	public resizeObserver: ResizeObserver;

	// state managment
	public isAppfullScreen: boolean;
	public isPageVisible: boolean;
	public isMediaTrackStopped: boolean;
	public isModelreadyToDetect: boolean;

	public isModelLoded: boolean;

	// app config
	public MaxDetections: number;
	public MaxframeRate: number;

	public detectionLoop: any;

	// perf meter and controls gui
	public perfMeter: Stats;
  public controlsGUI: dat.GUI;
  
  public mobile:any;
  public cameraconfig:any;

	constructor(private route: ActivatedRoute, private models: ModelsService, private errService: ErrorService) {
    this.mobile = this.isMobile()
    this.cameraconfig = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: {
          ideal: this.mobile ? undefined :  1920,
        },
        height: {
          ideal: this.mobile ? undefined : 1080,
        },
      },
    };
  }

	public ngOnInit() {
		this.modelName = this.route.snapshot.paramMap.get('name');

		this.isModelreadyToDetect = false;
		this.isModelLoded = false;

		this.isAppfullScreen = false;
		this.isPageVisible = true;
		this.isMediaTrackStopped = true;

		this.MaxframeRate = 20;
		this.MaxDetections = 20;

		this.videoSource = this.vidSource.nativeElement as HTMLVideoElement;
		this.outputCanvas = this.detCanvas.nativeElement as HTMLCanvasElement;
		this.context = this.outputCanvas.getContext('2d');

		// handle size changes & visibility;
		// tf.js needs width and height in VideoElement
		this.resizeObserver = new ResizeObserver(() => {
			this.videoSource.setAttribute('width', `${this.videoSource.offsetWidth}px`);
			this.videoSource.setAttribute('height', `${this.videoSource.offsetHeight}px`);
			this.outputCanvas.width = this.videoSource.width;
			this.outputCanvas.height = this.videoSource.height;
		});
		this.resizeObserver.observe(this.videoSource);

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				this.isPageVisible = true;
				if (this.isMediaTrackStopped) {
					this.resumeVideoTrack();
				}
			} else {
				this.isPageVisible = false;
				this.stopVideoTrack();
			}
		});
		// fullscreen stuff
		this.vidLayer.nativeElement.addEventListener('fullscreenchange', () => (this.isAppfullScreen = !this.isAppfullScreen), false);
		// fullscreen interceptor
		document.addEventListener('keydown', (e) => {
			if (e.key === 'F11') {
				e.preventDefault();
				this.vidLayer.nativeElement.requestFullscreen();
			}
		});

		this.perfMeter = new Stats(0);
		this.perfLayer.nativeElement.appendChild(this.perfMeter.dom);
		this.initCamera();
		try {
			const config = this.models.getDetectorConfig(this.modelName);
			this.detector = new YOLODetector(config);
			this.initControls();
		} catch (err) {
			this.errService.setError(err);
		}
  }
  ngOnDestroy(): void {
    this.stopDetection();
    this.stopVideoTrack();
    this.pauseAllMediaStreams();
    this.detector.dispose();   
  }

	public async loadModel() {
		this.detector.load().then(
			(loaded) => {
				this.isModelLoded = loaded;
				this.detector.cache().then(
					() => {
						this.isModelreadyToDetect = true;
						console.log('ready');
					},
					(err) => {
						this.errService.setError(err);
					},
				);
			},
			(err) => {
				this.errService.setError(err);
			},
		);
	}

	public startDetection() {
		if (this.isModelreadyToDetect) {
			if (!this.detectionLoop) {
				this.detectionLoop = setInterval(() => {
					try {
						this.context.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
						if (
							!(this.videoSource.paused || this.videoSource.ended || this.videoSource.seeking || this.videoSource.readyState < this.videoSource.HAVE_FUTURE_DATA) &&
							!this.isMediaTrackStopped &&
							this.isPageVisible
						) {
							this.perfMeter.begin();
							const results = this.detector.detectSync(this.videoSource);
							this.detector.draw(results, this.outputCanvas);
							this.perfMeter.end();
						}
					} catch (e) {
						console.error(e);
					}
				}, this.MaxframeRate);
			}
		} else {
			this.errService.setError('Please Load The Model first!');
		}
	}
	public stopDetection() {
		console.log('removed detection loop');
		this.context.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
		clearInterval(this.detectionLoop);
		this.detectionLoop = null;
	}
	public SetMaxFrameRate() {}

	public stopVideoTrack() {
		const stream = this.videoSource.srcObject as MediaStream;
		if (stream) {
			const tracks = stream.getTracks();
			tracks.forEach((track) => {
				track.stop();
			});
			this.isMediaTrackStopped = true;
			this.isModelreadyToDetect = false;
			this.videoSource.srcObject = null;
		}
	}
	public resumeVideoTrack() {
		if (!this.videoSource.srcObject) {
			this.initCamera();
		}
	}

	public initCamera(): void {
		this.pauseAllMediaStreams();
		navigator.mediaDevices.getUserMedia(this.cameraconfig).then(
			(stream) => {
				this.videoSource.srcObject = stream;
				this.isMediaTrackStopped = false;
			},
			(err) => {
				this.errService.setError(err);
			},
		);
	}
	public pauseAllMediaStreams(): void {}

	public initControls(): void {
		try {
			this.controlsGUI = new dat.GUI({ name: 'Controls', autoPlace: false, closeOnTop: false, hideable: false });
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
			this.controlPanel.nativeElement.appendChild(this.controlsGUI.domElement);
		} catch (err) {
			this.errService.setError(err);
		}
  }
  

  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }
  isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  isMobile() {
    return this.isAndroid() || this.isiOS();
  }
  
}
