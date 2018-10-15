const w : number = window.innerWidth, h : number = window.innerHeight
const color : string = '#673AB7'
const nodes : number = 5
const defineArc : Function = (context, r) => {
  context.beginPath()
  context.arc(0, 0, r, 0, 2 * Math.PI)
}
const drawBSNode : Function = (context, i, scale) => {
    const gap : number = h / (nodes + 1)
    const r : number = gap/3
    context.fillStyle = color
    context.strokeStyle = color
    context.lineWidth = Math.min(w, h) / 60
    context.save()
    context.translate(this.i * gap + gap, h/2)
    for(var j = 0; j < 2; j++) {
        const sc : number = Math.min(0.5, Math.max(scale - 0.5 * j, 0)) * 2
        context.save()
        context.translate(-r + 2 * r * j, 0)
        defineArc(context, r)
        context.stroke()
        defineArc(context, r)
        context.clipPath()
        context.fillRect(-r, -r, 2 * r * sc, 2 * r)
        context.restore()
    }
    context.restore()
}
class BiCircleStepStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#bdbdbd'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : BiCircleStepStage = new BiCircleStepStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}
