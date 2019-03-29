//exit full screen
let IS_APP_ON_FULL_SCREEN =false
let app = document.getElementById("app")
if (app.addEventListener) {
    app.addEventListener('webkitfullscreenchange', fullScreenHandler, false);
    app.addEventListener('mozfullscreenchange', fullScreenHandler, false);
    app.addEventListener('fullscreenchange', fullScreenHandler, false);
    app.addEventListener('MSFullscreenChange', fullScreenHandler, false);
}
document.addEventListener("keydown", e => {
    if (e.key == "F11") {
        e.preventDefault()
        let app = document.getElementById("app")
        app.requestFullscreen();
        
    }
});

function fullScreenHandler() {
    // If there's an element in fullscreen, exit
    // Otherwise, enter it
    if (!IS_APP_ON_FULL_SCREEN) {
        // let app = document.getElementById("app")
        // app.requestFullscreen();
        appEnterFullscreen();
        IS_APP_ON_FULL_SCREEN = true
    } else {
        appExitFullscreen();
        IS_APP_ON_FULL_SCREEN = false;
    }
}

function appExitFullscreen() {
    let mainwrapper = document.getElementById("main-wrapper")
    let videowrapper = document.getElementById("video-wrapper")
    mainwrapper.classList.remove("main-wrapper-fullscreen")
    videowrapper.classList.remove("video-wrapper-fullscreen")
    mainwrapper.classList.add("main-wrapper-no-fullscreen")
    videowrapper.classList.add("video-wrapper-no-fullscreen")
}

function appEnterFullscreen() {
    window.scrollTo(0, 0);
    let mainwrapper = document.getElementById("main-wrapper")
    let videowrapper = document.getElementById("video-wrapper")
    mainwrapper.classList.remove("main-wrapper-no-fullscreen")
    videowrapper.classList.remove("video-wrapper-no-fullscreen")
    mainwrapper.classList.add("main-wrapper-fullscreen")
    videowrapper.classList.add("video-wrapper-fullscreen")
}