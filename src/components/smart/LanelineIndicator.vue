<template>
  <div class='wrapper' v-if="curDataRow">
    <div class="block">
      <div class="show">
        滴滴显示：{{ curDataRow.didi_show }}
      </div>
      <div class="indicator-imgs">
        <div class="img-container" v-for="(img, index) in imgs.didi" :key="index">
          <img :src="img.url" :title="img.prefix">
        </div>
      </div>
    </div>
    <div class="block">
      <div class="show">
        竞品显示：{{ curDataRow.rival_show }}
      </div>
      <div class="indicator-imgs">
        <div class="img-container" v-for="(img, index) in imgs.rival" :key="index">
          <img :src="img.url" :title="img.prefix">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { getCodeImgUrl } from '@/utils'
import * as lanelineMachine from '@/models/machine/laneline'

@Component
export default class LanelineIndicator extends Vue {
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: lanelineMachine.TaskCaseListI | null
  get imgs() {
    const { curDataRow } = this
    if (curDataRow) {
      const { didi_background, didi_front_arrow, rival_background, rival_front_arrow } = curDataRow
      return {
        didi: this.getMatchPairs(didi_background, didi_front_arrow),
        rival: this.getMatchPairs(rival_background, rival_front_arrow)
      }
    } else {
      return {
        didi: [],
        rival: []
      }
    }
  }
  getMatchPairs(str1: string, str2: string) {
    if (!str1 || !str2) {
      return []
    }
    const pairs: Array<{ url: string, prefix: string }> = []
    const str2Arr = str2.split('')
    str1.split('').forEach((s, i) => {
      const prefix = `${s}-${str2Arr[i]}`
      pairs.push({
        url: getCodeImgUrl(prefix, true),
        prefix
      })
    })
    return pairs
  }
}
</script>

<style scoped lang='less'>
.wrapper {
  .block {
    background-color: #ffffff;
    border-radius: 3px;
    &:first-child {
      margin-bottom: 10px;
    }
    padding: 10px;
    .indicator-imgs {
      display: flex;
      align-items: center;
      justify-content: space-around;
      border: 1px solid #ccc;
      margin-top: 10px;
      .img-container {
        width: 50px;
        height: 50px;
        img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
    }
  }
}
</style>
