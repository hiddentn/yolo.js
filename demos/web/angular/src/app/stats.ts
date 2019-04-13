import { min } from 'rxjs/operators';

/**
 *  * https://github.com/mrdoob/stats.js/blob/master/src/Stats.js
 * @author mrdoob / http://mrdoob.com/
 */

export class Stats {

    public mode: number;
    public container: HTMLDivElement;
    public beginTime: number;
    public prevTime: number;
    public frames: number;

    public fpsPanel: Panel;
    public msPanel: Panel;
    public memPanel: Panel;

    constructor(numPanel: number) {
        this.mode = 0;
        this.container = document.createElement('div');
        this.container.style.cssText = 'position:absolute;top:0;left:0;cursor:pointer;opacity:0.7;z-index:10000';
        this.container.addEventListener('click', (event) => {
            event.preventDefault();
            this.showPanel(++this.mode % this.container.children.length);
        }, false);
        this.beginTime = ( window.performance || Date ).now(),
        this.prevTime = this.beginTime,
        this.frames = 0;
        this.fpsPanel = this.addPanel( new Panel( 'FPS', '#0ff', '#002'));
        this.msPanel = this.addPanel( new Panel( 'MS', '#0f0', '#020'));
        if (window.performance && (window.performance as any).memory ) {
        this.memPanel = this.addPanel( new Panel( 'MB', '#f08', '#201'));
        }

        this.showPanel(numPanel);
    }

    get dom(): HTMLDivElement {
        return this.container;
    }
    get domElement(): HTMLDivElement {
        return this.container;
    }

    public addPanel(panel) {
        this.container.appendChild(panel.dom);
        return panel;
    }
    public showPanel(id: number) {
        for (let i = 0; i < this.container.children.length; i++) {
            (this.container.children[i] as HTMLElement).style.display = i === id ? 'block' : 'none';
        }
        this.mode = id;
    }

    public begin() {
        this.beginTime = ( window.performance || Date ).now();
    }

    public end() {
        this.frames ++;
        const time = ( performance || Date ).now();
        this.msPanel.update( time - this.beginTime, 200 );
        if ( time >= this.prevTime + 1000 ) {
            this.fpsPanel.update( ( this.frames * 1000 ) / ( time - this.prevTime ), 100 );
            this.prevTime = time;
            this.frames = 0;

            // chrome only
            try {
            if (this.memPanel) {
                const memory = (window.performance as any).memory;
                this.memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );
            }
            } catch { }
        }
        return time;
    }

    public update() {
        this.beginTime = this.end();
    }
}

// tslint:disable-next-line: max-classes-per-file
class Panel {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public min: number;
    public max: number;
    public name: string;
    public fillStyle: string;
    public background: string;

    public WIDTH: number;
    public HEIGHT: number;
    public TEXT_X: number;
    public TEXT_Y: number;
    public GRAPH_X: number;
    public GRAPH_Y: number;
    public GRAPH_WIDTH: number;
    public GRAPH_HEIGHT: number;
    public PR: number;
    get dom(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor(name, fg, bg) {
        this.name = name;
        this.fillStyle = fg;
        this.background = bg;
        this.min = Infinity;
        this.max = 0;
        this.PR = Math.round(window.devicePixelRatio || 1);

        this.WIDTH = 80 * this.PR;
        this.HEIGHT = 48 * this.PR;
        this.TEXT_X = 3 * this.PR;
        this.TEXT_Y = 2 * this.PR;
        this.GRAPH_X = 3 * this.PR;
        this.GRAPH_Y = 15 * this.PR;
        this.GRAPH_WIDTH = 74 * this.PR;
        this.GRAPH_HEIGHT = 30 * this.PR;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.cssText = 'width:80px;height:48px';

        this.context = this.canvas.getContext('2d');
        this.context.font = `bold ${9 * this.PR}px Helvetica,Arial,sans-serif`;
        this.context.textBaseline = 'top';

        this.context.fillStyle = bg;
        this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.context.fillStyle = fg;
        this.context.fillText(name, this.TEXT_X, this.TEXT_Y);
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

        this.context.fillStyle = bg;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }

    public update(value, maxValue) {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);
        this.context.fillStyle = this.background;
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
        this.context.fillStyle = this.fillStyle;
        this.context.fillText(`${Math.round(value)} ${this.name}(${Math.round(this.min)}-${Math.round(this.max)})`, this.TEXT_X, this.TEXT_Y);
        this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);
        this.context.fillStyle = this.background;
        this.context.globalAlpha = 0.9;
        this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round((1 - (value / maxValue)) * this.GRAPH_HEIGHT));
    }

}