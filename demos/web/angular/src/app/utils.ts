
 export function setCameraToVideoElement(vElement: HTMLVideoElement, cameraconfig: any) {
    if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(cameraconfig)
            .then((stream) => {
                vElement.srcObject = stream;
            })
            .catch((error) => {
                console.log("Something went wrong!");
                console.error(error);
            });
    }
 }