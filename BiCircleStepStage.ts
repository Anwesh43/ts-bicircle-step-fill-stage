const w : number = window.innerWidth, h : number = window.innerHeight
const color : string = '#673AB7'
const nodes : number = 5
const defineArc : Function = (context : CanvasRenderingContext2D, r : number) => {
  context.beginPath()
  context.arc(0, 0, r, 0, 2 * Math.PI)
}
const drawBSNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = h / (nodes + 1)
    const r : number = gap/3
    context.fillStyle = color
    context.strokeStyle = color
    context.lineWidth = Math.min(w, h) / 60
    context.save()
    context.translate(this.i * gap + gap, h/2)
    for(var j = 0; j < 2; j++) {
        const sc : number = Math.min(0.5, Math.max(scale - 0.5 * j, 0)) * 2
        const sf : number = 1 - 2 * j
        context.save()
        context.scale(sf, 1)
        context.translate(r, 0)
        defineArc(context, r)
        context.stroke()
        defineArc(context, r)
        context.clip()
        context.fillRect(-r, -r, 2 * r * sc, 2 * r)
        context.restore()
    }
    context.restore()
}
class BiCircleStepStage {
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
        this.context.fillStyle = '#bdbdbd'
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(this.render.bind(this))
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

class BCSNode {
    prev : BCSNode
    next : BCSNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new BCSNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(ctx : CanvasRenderingContext2D) {
        drawBSNode(ctx, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(ctx)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BCSNode {
        var curr : BCSNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        if (cb) {
            cb()
        }
        return this
    }
}

class BiCircleStep {
    root : BCSNode = new BCSNode(0)
    curr : BCSNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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
    bcs : BiCircleStep = new BiCircleStep()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bcs.draw(context)
    }

    handleTap(cb : Function) {
        this.bcs.startUpdating(() => {
            this.animator.start(() => {
                if (cb) {
                    cb()
                }
                this.bcs.update(() => {
                    this.animator.stop()
                })
            })
        })
    }
}
