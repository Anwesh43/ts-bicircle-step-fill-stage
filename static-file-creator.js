const fs = require('fs')

class Body {
    constructor() {
        this.children = []
    }

    addChild(child) {
        this.children.push(child)
    }
    toHTML() {
        return `<body>\n${this.children.map(child=>child.toHTML()).join("\n")}\n</body>`
    }
}

class Script {
    constructor(src, file) {
        this.file = file
        this.src = src
    }

    toHTML() {
        if (this.file) {
            return `<script src="${this.src}"></script>`
        }
        return `<script>${this.src}</script>`
    }
}

class BodyCreator {
    constructor() {
        this.body = new Body()
    }

    addScript(src, file) {
        this.body.addChild(new Script(src, file))
    }

    toFile() {
        const ws = fs.createWriteStream('index.html')
        ws.write(new Buffer(this.body.toHTML()))
        console.log(this.body.toHTML())
        ws.close()
    }
}

if (process.argv.length == 3) {
    const bodyCreator = new BodyCreator()
    bodyCreator.addScript(`${process.argv[2]}.js`, true)
    bodyCreator.addScript(`${process.argv[2]}.init()`)
    bodyCreator.toFile()
} else {
    console.log("enter filename")
}
