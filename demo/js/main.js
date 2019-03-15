let tf = YOLO.tf;
let VidElem = document.getElementById('source');
let CanvasElem = document.getElementById('detection');
const MaxFramrate = 20;
// stats
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

const Loop = new DetectionLoop(VidElem,CanvasElem,MaxFramrate,stats);

// dat.gui
const gui = new dat.GUI({
    autoPlace: false,
});


const ControlsFolder = gui.addFolder('Controls');
ControlsFolder.add(Loop, 'LoadDetector').name('Load Model')
ControlsFolder.add(Loop, 'StartDetection').name('Start Detection')
ControlsFolder.add(Loop, 'DetecOnce').name('Detect Once')

ControlsFolder.add(Loop, 'StopDetection').name('Stop Detection')
ControlsFolder.open()
const ModelParams = gui.addFolder('Model Parameters');
ModelParams.add(Loop.detector, 'iouThreshold', 0, 1).name('IOU Threshold')
ModelParams.add(Loop.detector, 'classProbThreshold', 0, 1).name('Probability Threshhold')
ModelParams.add(Loop.detector, 'modelSize', 32, 416, 32).name('Model Size')
ModelParams.open()
const DetectionParams = gui.addFolder('Detection Parameters');
DetectionParams.add(Loop, 'MaxframeRate', 1,30,1).name('Max FrameRate')
DetectionParams.add(Loop, 'SetMaxFrameRate').name('Set FrameRate')
DetectionParams.add(Loop, 'MaxDetections', 0, 20).name('Max Detections')
DetectionParams.open()

gui.open();

let controlslayer = document.getElementById("controls-layer")
controlslayer.appendChild(gui.domElement);
controlslayer.appendChild(stats.dom);
ControlsFolder.add(Loop, 'TestDetection').name('Perf Test')
