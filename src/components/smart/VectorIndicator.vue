<template>
  <div class='vector-wrapper' v-if="curDataRow && imgs.length" :class="imgs.length == 1 ? 'vector-wrapper-1' : ''">
    <div class="vector-block" v-for="(img, index) in imgs" :key="index">
      <div class="vector-block__img">
        <NCanvas 
          :imgSrc="img.url" 
          :text="getText(index)" 
          :editable="editable"
          :canLoadRootMethod="betterVersion === img.better_version || customLoadRootMethod" />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { getCodeImgUrl } from '@/utils'
import * as vectorManager from '@/models/manager/vector'
import NCanvas from '@/components/dumb/N-canvas.vue'

@Component({
  components: {
    NCanvas
  }
})
export default class VectorIndicator extends Vue {
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: vectorManager.VectorEvaluationCaseListI | null
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  @Prop({ type: Boolean, default: true }) readonly editable!: boolean
  @Prop({ type: Number, default: 1 }) readonly betterVersion!: number
  imgs: Array<{
    url: string
    better_version: number
  }> = []
  customLoadRootMethod: boolean = false // 与现实作对比时手动设置为true

  @Watch('betterVersion')
  onBetterVersionChange() {
    (this.$root as any).getNewImgSrc = undefined
  }
  @Watch('curDataRow')
  onCurDataRowChange() {
    (this.$root as any).getNewImgSrc = undefined
    this.imgs = []
    const { curDataRow } = this
    if (curDataRow) {
      const { base_pic_a, base_pic_b, sort_site, mark_pic_url } = curDataRow
      const urlTop = mark_pic_url || base_pic_a
      const urlBot = base_pic_b
      this.imgs = (sort_site ? (sort_site == 1 ? [{
        url: urlTop,
        better_version: 1
      }, {
        url: urlBot,
        better_version: 2
      }] : [{
        url: urlBot,
        better_version: 2
      }, {
        url: urlTop,
        better_version: 1
      }]) : [{
        url: urlTop,
        better_version: 1
      }]).filter((s) => s)
      this.customLoadRootMethod = !sort_site // 与现实作对比时手动设置为true
    }
  }
  getText(index: number) {
    const wordTop = this.isMarkJob ? '上边' : '旧版本'
    const wordBot = this.isMarkJob ? '下边' : '新版本'
    if (this.imgs.length) {
      if (this.imgs.length === 1) {
        return ''
      } else {
        return !index ? wordTop : wordBot
      }
    } else {
      return ''
    }
  }
}
</script>

<style scoped lang='less'>
.vector-wrapper {
  display: flex;
  flex-direction: column;
  .vector-block {
    position: relative;
    background-color: #ffffff;
    border-radius: 3px;
    .vector-block__text {
      position: absolute;
      left: 5px;
      top: 5px;
    }
  }
}
</style>
