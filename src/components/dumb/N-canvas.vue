<template>
  <div class="canvas-wrapper" :class="scale ? 'float' : ''" v-show="imgSrc">
    <canvas :id="canvasId"></canvas>
    <div class="tag" v-if="text">
      <Tag color="#f60">{{ text }}</Tag>
    </div>
    <div class="canvas-actions">
      <Button size="small" shape="circle" @click="scale = !scale" :icon="scale ? 'md-contract' : 'md-expand'"></Button>
      <Button :disabled="!editable" type="error" size="small" shape="circle" @click="onClear" icon="md-trash"></Button>
      <Button :disabled="!editable" size="small" shape="circle" @click="onRotate" icon="md-refresh">{{ `${angle}°` }}</Button>
      <Tooltip transfor placement="top" content="画笔颜色">
        <ColorPicker :disabled="!editable" v-model="lineColor" size="small" />
      </Tooltip>
      <Tooltip transfor placement="top" content="画笔粗细">
        <RadioGroup v-model="lineWidth" type="button" size="small">
          <Radio :disabled="!editable" label="2"></Radio>
          <Radio :disabled="!editable" label="5"></Radio>
          <Radio :disabled="!editable" label="10"></Radio>
        </RadioGroup>
      </Tooltip>
      <span style="color: red" v-if="errTips || !editable">{{ editable ? errTips : '当前不可编辑' }}</span>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { getUid, NDrawBoard } from '@/utils'
import { uploadCDN } from '@/models/manager/vector'
@Component
export default class NCanvas extends Vue {
  @Prop({ type: String, default: '' }) readonly imgSrc!: string
  @Prop({ type: String, default: '' }) readonly text!: string
  @Prop({ type: Boolean, default: true }) readonly editable!: boolean
  @Prop({ type: Boolean, default: false }) readonly canLoadRootMethod!: boolean
  scale: boolean = false
  lineWidth: string = '2'
  lineColor: string = '#F02D3B'
  drawIns!: NDrawBoard
  errTips: string = ''
  initRatio: number = 0.7
  maxRatio: number = 1.3
  angle: number = 0
  get canvasId() {
    return getUid()
  }
  @Watch('imgSrc')
  onImgSrc(imgSrc: string) {
    this.init()
  }
  @Watch('editable')
  onEditableChange(editable: boolean) {
    this.drawIns.setEditable(editable)
  }
  @Watch('scale')
  onScaleChange(scale: boolean) {
    this.drawIns.setRatio(this.scale ? this.maxRatio : this.initRatio)
    this.$root.$emit('canvas-scale', scale)
  }
  @Watch('lineWidth')
  onLineWidthChange() {
    this.drawIns.setPenStyle({ lineWidth: +this.lineWidth, lineColor: this.lineColor })
  }
  @Watch('lineColor')
  onLineColorChange() {
    this.drawIns.setPenStyle({ lineWidth: +this.lineWidth, lineColor: this.lineColor })
  }
  @Watch('canLoadRootMethod')
  onCanLoadRootMethodChange(can: boolean) {
    if (can) {
      (this.$root as any).getNewImgSrc = async () => {
        const imgSrc = await this.onUpload()
        return imgSrc
      }
    } else {
      this.errTips = ''
    }
  }
  mounted() {
    this.init();
    // 挂载获取上传图片的url方法
    if (this.canLoadRootMethod) {
      (this.$root as any).getNewImgSrc = async () => {
        const imgSrc = await this.onUpload()
        return imgSrc
      }
    }
  }
  init() {
    const canvasEle = document.getElementById(this.canvasId) as HTMLCanvasElement
    this.drawIns = new NDrawBoard({
      canvasEl: canvasEle,
      imgSrc: this.imgSrc,
      ratio: this.initRatio,
      editable: this.editable
    })
    this.drawIns.setPenStyle({
      lineWidth: +this.lineWidth,
      lineColor: this.lineColor
    })
  }
  onClear() {
    this.drawIns.clear()
  }
  onRotate() {
    this.angle = this.drawIns.rotate()
  }
  async onUpload() {
    const { edited, imgBlob } = await this.drawIns.save()
    if (!edited || !imgBlob) {
      this.errTips = '未编辑或转换失败！'
      return ''
    }
    this.errTips = ''
    const formData = new FormData()
    formData.append('file', imgBlob)
    formData.append('filename', getUid())
    const { code, msg, data }  = await uploadCDN(formData)
    if (code) {
      this.errTips = msg
      return ''
    }
    return data
  }
}
</script>

<style lang="less" scoped>
.canvas-wrapper {
  position: relative;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, .1);
  &.float {
    position: fixed;
    left: 20px;
    top: 24px;
    border-radius: 4px;
    z-index: 999;
  }
  .tag {
    position: absolute;
    left: 10px;
    top: 10px;
  }
  .canvas-actions {
    padding: 2px 0;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    justify-content: center;
    left: 0;
    width: 100%;
    position: relative;
    bottom: 5px;
    & > * {
      margin-left: 5px;
    }
  }
}
</style>

