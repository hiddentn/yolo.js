function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}
function isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function Mobile() {
    return isAndroid() || isiOS();
}
(() => {
    const CAMERA_ID = 'data-source'
    const CameralElemnt = document.getElementById(CAMERA_ID)
    const cameraConfig = {
        audio: false,
        video: {
            facingMode: "environment",
            width: {
                ideal: Mobile() ? undefined : 1280,
            },
            height: {
                ideal: Mobile() ? undefined : 720,
            },
        },
    };
    navigator.getUserMedia(
        cameraConfig,
        stream => {
            CameralElemnt.srcObject = stream
        },
        err => {
            console.log(err);
        },
    );
})();