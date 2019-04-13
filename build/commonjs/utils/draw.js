"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function draw(detections, ctx, labelsLength) {
    ctx.lineWidth = 1.5;
    ctx.font = '13px Segoe UI';
    detections.forEach(function (det) {
        drawObject(det, ctx, labelsLength);
    });
}
exports.draw = draw;
function drawObject(item, ctx, max) {
    var txt = " " + item.label + " : " + (item.score * 100).toFixed(1) + "%";
    var color = hsl(item.labelIndex, 0, 50);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.rect(item.x, item.y, item.w, item.h);
    ctx.stroke();
    ctx.fillStyle = color;
    if (item.y - 25 >= 0) {
        // Box on top
        ctx.fillRect(item.x - 1.5, item.y - 1.5, 90, -15);
        ctx.fillStyle = '#000000';
        ctx.fillText(txt, item.x, item.y - 5);
    }
    else {
        // Box Inside
        ctx.fillRect(item.x - 1.5, item.y - 1.5, 90, 20);
        ctx.fillStyle = '#000000';
        ctx.fillText(txt, item.x, item.y + 12);
    }
}
function hsl(num, min, max) {
    return "hsla(" + map(num, min, max) + ", 100%, 50%,1)";
}
function map(num, inmin, inmax) {
    return ((num - inmin) * 360) / (inmax - inmin);
}
//# sourceMappingURL=draw.js.map