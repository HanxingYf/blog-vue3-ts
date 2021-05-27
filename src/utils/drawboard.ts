interface OptionsI {
  canvasEl: HTMLCanvasElement
  imgSrc: string
  editable: boolean
  ratio?: number
}
interface PenStyle {
  lineWidth: number
  lineColor: string
}

export class NDrawBoard {
  canvasEl!: HTMLCanvasElement
  canvasCtx!: CanvasRenderingContext2D
  ratio!: number
  imgIns!: HTMLImageElement
  editable!: boolean
  startDraw: boolean = false
  curIndex: number = -1
  angles = [0, 90, 180, 270]
  angleIndex = 0
  pointStore: {
    [propName: number]: {
      lineWidth: number,
      lineColor: string,
      xyRatios: Array<{
        xRatio: number
        yRatio: number
      }>
    }
  } = {}
  penStyle: PenStyle = { lineWidth: 2, lineColor: 'red' }

  constructor(options: OptionsI) {
    const { canvasEl, imgSrc, ratio, editable } = options
    this.canvasEl = canvasEl
    this.editable = editable
    this.canvasCtx = canvasEl.getContext('2d')!
    this.ratio = ratio || 1
    this._init(imgSrc)
  }
  _init(imgSrc: string) {
    const imgIns = this.imgIns = new Image()
    imgIns.src = imgSrc
    imgIns.crossOrigin = 'Anonymous'
    imgIns.onload = () => {
      this._loadImg()
    }
    imgIns.onerror = () => {}
    this.canvasEl.onmousedown = this._onMousedown.bind(this)
    this.canvasEl.onmousemove = this._onMousemove.bind(this)
    this.canvasEl.onmouseup = this._onMouseup.bind(this)
  }
  _loadImg() {
    const { naturalWidth, naturalHeight } = this.imgIns
    const width = naturalWidth * this.ratio
    const height = naturalHeight * this.ratio
    this.canvasEl.width = width
    this.canvasEl.height = height
    this.canvasCtx.drawImage(this.imgIns, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height)
  }
  _onMousedown(e: MouseEvent) {
    if (!this.editable) {
      return
    }
    this.startDraw = true
    this.curIndex = this.curIndex + 1
    const { offsetX, offsetY } = e
    this.canvasCtx.beginPath()
    this.canvasCtx.strokeStyle = this.penStyle.lineColor
    this.canvasCtx.lineWidth = this.penStyle.lineWidth
    this.canvasCtx.moveTo(offsetX, offsetY)
    this.pointStore[this.curIndex] = {
      lineWidth: this.penStyle.lineWidth,
      lineColor: this.penStyle.lineColor,
      xyRatios: []
    }
  }
  _onMousemove(e: MouseEvent) {
    if (!this.startDraw) {
      return
    }
    const { offsetX, offsetY } = e
    this.canvasCtx.lineTo(offsetX, offsetY)
    this.pointStore[this.curIndex].xyRatios.push({
      xRatio: offsetX / this.canvasEl.width,
      yRatio: offsetY / this.canvasEl.height
    })
    this.canvasCtx.stroke()
  }
  _onMouseup(e: MouseEvent) {
    this.startDraw = false
  }
  setRatio(ratio: number) {
    this.ratio = ratio
    this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height)
    this._loadImg()
    for (const key in this.pointStore) {
      if (this.pointStore.hasOwnProperty(key)) {
        const { xyRatios, lineColor, lineWidth } = this.pointStore[key]
        this.canvasCtx.beginPath()
        this.canvasCtx.strokeStyle = lineColor
        this.canvasCtx.lineWidth = lineWidth
        xyRatios.forEach((point, index) => {
          const { xRatio, yRatio } = point
          const x = xRatio * this.canvasEl.width
          const y = yRatio * this.canvasEl.height
          if (!index) {
            this.canvasCtx.moveTo(x, y)
          } else {
            this.canvasCtx.lineTo(x, y)
            this.canvasCtx.stroke()
          }
        })
      }
    }
  }
  clear() {
    this.pointStore = {}
    this.curIndex = -1
    this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height)
    this._loadImg()
  }
  rotate() {
    const len = this.angles.length
    this.angleIndex = this.angleIndex + 1
    if (this.angleIndex > len - 1) {
      this.angleIndex = 0
    }
    const angle = this.angles[this.angleIndex]
    this.canvasEl.style.transform = `rotateZ(${angle}deg)`
    return angle
  }
  setPenStyle(penStyle: PenStyle) {
    this.penStyle = penStyle
  }
  setEditable(editable: boolean) {
    this.editable = editable
    this.clear()
  }
  save(): Promise<{ edited: boolean, imgBlob: Blob | null  }> {
    return new Promise((resolve) => {
      const oldRatio = this.ratio
      this.setRatio(1)
      this.canvasEl.toBlob((imgBlob) => {
        resolve({
          edited: !!Object.keys(this.pointStore).length,
          imgBlob
        })
        this.setRatio(oldRatio)
      }, 'image/png', 1)
    })
  }
}
