<template>
  <Modal 
    :value="visible" 
    footer-hide 
    width="70"
    @on-cancel="onCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <template slot-scope="{ row, index }" slot="continuous">
        {{ calcIsContinuous(row.marked_json) }}
      </template>
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { EvaluationBasemapMarkRecordColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'
import * as basemapManager from '@/models/manager/basemap'
import { BaseMapEvaluationCaseListI, BaseMapEvaluationCaseRecordI } from '@/models/manager/basemap'
import { PoiI } from '@/models/machine/basemap'


@Component
export default class BasemapRecord extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: BaseMapEvaluationCaseListI | null
  dataSource: BaseMapEvaluationCaseRecordI[] = []
  columns = EvaluationBasemapMarkRecordColumns
  loading: boolean = false

  @Watch('curDataRow')
  onChanged(row: BaseMapEvaluationCaseListI | null) {
    this.visible && row && this.pullHistoryList(row.id)
  }

  @Emit('on-view')
  handleOnView(row: BaseMapEvaluationCaseRecordI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await basemapManager.getMarkRecord(id)
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { history } = res
    this.dataSource = history || []
  }
  calcIsContinuous(marked_json: string) {
    return ''
    /*
    try {
      // 找出所有层级下的poi列表是否存在一个poi是保留的（keep === 1）
      return (JSON.parse(marked_json) as Array<{ level: number, pois: PoiI[] }>).every((it) => {
        const { pois } = it
        return pois.some((p) => p.keep === 1) // 找出当前层级的poi列表中其中一个是保留的
      }) ? '是' : '否'
    } catch (error) {
      return 'marked_json格式错误，无法判定'
    }
    */
  }
}
</script>
