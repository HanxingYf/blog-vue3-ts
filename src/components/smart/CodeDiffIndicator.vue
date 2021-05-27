<template>
  <div class='wrapper' v-if="curDataRow">
    <div class="label-mark-item">
      <p>线上版本</p>
      <p>
        Code: {{ curDataRow.ori_code }}
        <span>
          <img :src="getCodeImgUrl(curDataRow.ori_code)" />
        </span>
      </p>
      <p>辅助动作：{{ curDataRow.ori_assi_code }}</p>
    </div>
    <div class="label-mark-item" v-if="curDataRow">
      <p>新策略版本</p>
      <p>
        Code: {{ curDataRow.final_code }}
        <span>
          <img :src="getCodeImgUrl(curDataRow.final_code)" />
        </span>
      </p>
      <p>辅助动作：{{ curDataRow.final_assi_code }}</p>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { getCodeImgUrl } from '@/utils'

@Component
export default class CodeDiffIndicator extends Vue {
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: {
    ori_code: number
    ori_assi_code: string
    final_code: number
    final_assi_code: string
  } | null
  getCodeImgUrl = getCodeImgUrl
}
</script>

<style scoped lang='less'>
.wrapper {
  .label-mark-item {
    background-color: #ffffff;
    border-radius: 3px;
    &:first-child {
      margin-bottom: 4px;
    }
    padding: 10px;
    p {
      padding: 3px 0;
      span {
        margin-left: 5px;
        display: inline-block;
        width: 30px;
        height: 30px;
        vertical-align: sub;
        border-radius: 3px;
        background: #439eb4;
        padding: 3px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
