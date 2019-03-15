import {Detection} from '../types'

export function draw(detections:Detection[], ctx: CanvasRenderingContext2D, labelsLength:number) {
    ctx.lineWidth = 3;
    ctx.font = "15px Segoe UI"
    detections.forEach(det => {
        DrawObject(det, ctx, labelsLength)
    });
}

function DrawObject(item:Detection, ctx:CanvasRenderingContext2D, max:number) {
    let txt = ` ${item.label} : ${(item.score*100).toFixed(1)}%`;
    const color = hsl(item.labelIndex, 0, max);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(item.x,item.y,item.w, item.h);
    ctx.stroke();
    ctx.fillStyle = color;
    if (item.y - 25 >= 0) {
      //Box on top
      ctx.fillRect(item.x-1.5, item.y-1.5, 105, -20);
      ctx.fillStyle = "#000000";
      ctx.fillText(txt, item.x, item.y - 5);
    } else {
      //Box Inside
      ctx.fillRect(item.x-1.5,  item.y-1.5, 120, 25);
      ctx.fillStyle = "#000000";
      ctx.fillText(txt, item.x, item.y + 19);
    }
}
function hsl(num:number, min:number, max:number) {
    return "hsla(" + map(num, min, max) + ", 90%, 50%,1)";
}
function map(num:number, in_min:number, in_max:number) {
    return ((num - in_min) * 360) / (in_max - in_min);
}