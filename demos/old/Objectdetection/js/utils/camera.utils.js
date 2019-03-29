// configs
const cameraconfig = {
    audio: false,
    video: {
        facingMode: 'environment',
        width: {
            ideal: 1280
        },
        height: {
            ideal: 720
        }
    }
}

function setCameraToVideoElement(VElement){
    if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(cameraconfig)
            .then(function (stream) {
                VElement.srcObject = stream;
            })
            .catch(function (error) {
                console.log("Something went wrong!");
                console.error(error);
            });
    }

}