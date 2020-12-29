const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 4 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const delay : number = 20 
const colors : Array<string> = [
    "#F44336",
    "#3F51B5",
    "#4CAF50",
    "#795548",
    "#009688"
] 
const backColor : string = "#bdbdbd"
const sizeFactor : number = 8.9 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {
    
    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawEndingLine(context : CanvasRenderingContext2D, x : number, y : number, sc1 : number, sc2 : number, i : number) {
        const sc1i : number = ScaleUtil.divideScale(sc1, i, parts)
        const sc2i : number = ScaleUtil.divideScale(sc2, i, parts)
        DrawingUtil.drawLine(context, x * sc2i, y * sc2i, x * sc1i, y * sc2i)
    }

    static drawVLinerClose(context : CanvasRenderingContext2D, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor 
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
        context.save()
        context.translate(w / 2, h)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.scale(1 - 2 * j, 1)
            DrawingUtil.drawEndingLine(context, -size, -size, sc1, sc2, 0)
            context.save()
            context.translate(-size, -size)
            DrawingUtil.drawEndingLine(context, -size, 0, sc1, sc2, 1)
            context.restore()
            context.save()
            context.translate(-2 * size, -size)
            DrawingUtil.drawEndingLine(context, 0, size, sc1, sc2, 2)
            context.restore()
            context.restore()
        }
        context.restore()
    }

    static drawVLCNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawVLinerClose(context, scale)       
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}