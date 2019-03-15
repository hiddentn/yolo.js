import {Detection} from '../types'

export function draw(detections:Detection[], ctx: CanvasRenderingContext2D, labelsLength:number) {
    ctx.lineWidth = 1.5;
    ctx.font = "13px Segoe UI"
    detections.forEach(det => {
        DrawObject(det, ctx, labelsLength)
    });
}

function DrawObject(item:Detection, ctx:CanvasRenderingContext2D, max:number) {
    let txt = ` ${item.label} : ${(item.score*100).toFixed(1)}%`;
    const color = hsl(item.labelIndex, 0, 50);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(item.x,item.y,item.w, item.h);
    ctx.stroke();
    ctx.fillStyle = color;
    if (item.y - 25 >= 0) {
      //Box on top
      ctx.fillRect(item.x-1.5, item.y-1.5, 90, -15);
      ctx.fillStyle = "#000000";
      ctx.fillText(txt, item.x, item.y - 5);
    } else {
      //Box Inside
      ctx.fillRect(item.x-1.5,  item.y-1.5, 90, 20);
      ctx.fillStyle = "#000000";
      ctx.fillText(txt, item.x, item.y + 12);
    }
}
function hsl(num:number, min:number, max:number) {
    return "hsla(" + map(num, min, max) + ", 100%, 50%,1)";
}
function map(num:number, in_min:number, in_max:number) {
    return ((num - in_min) * 360) / (in_max - in_min);
}