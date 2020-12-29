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
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class VLCNode {

    state : State = new State()
    prev : VLCNode 
    next : VLCNode 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new VLCNode(this.i + 1)
            this.next.prev = this 
        }
    }
    
    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawVLCNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : VLCNode {
        var curr : VLCNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class VLinerClose {

    curr : VLCNode = new VLCNode(0)
    dir : number = 1 

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    vlc : VLinerClose = new VLinerClose()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.vlc.draw(context)
    } 

    handleTap(cb : Function) {
        this.vlc.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.vlc.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}