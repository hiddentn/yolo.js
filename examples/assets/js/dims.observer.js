
(() => {
    const CONTAINER_ID = 'media-container';
    const MEDIA_ID = 'data-source';
    const CANVAS_ID = 'draw-canvas';
    const container = document.getElementById(CONTAINER_ID);
    const mediaEl = document.getElementById(MEDIA_ID)
    const canvas = document.getElementById(CANVAS_ID);

    const observer = new ResizeObserver(
        () => {
            mediaEl.width = container.clientWidth;
            mediaEl.height = container.clientHeight;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            console.dir(container);
        }
    )
    // init
    observer.observe(container);
})()