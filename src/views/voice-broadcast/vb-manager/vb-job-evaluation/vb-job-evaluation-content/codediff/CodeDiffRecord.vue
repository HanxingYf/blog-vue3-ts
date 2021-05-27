<template>
  <Modal 
    :value="visible" 
    footer-hide 
    width="70"
    @on-cancel="onCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <template slot-scope="{ row, index }" slot="gsb">
        <p>{{ matchSelfTag[row.tag] || row.tag }}</p>
      </template>
      <template slot-scope="{ row, index }" slot="err_level">
        <p>{{ matchErrLevel[row.err_level] || row.err_level }}</p>
      </template>
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { EvaluationCodeDiffMarkRecordColumns } from './columns'
import { getEvaluationRecord, EvaluationCodeDiffRecordI, EvaluationCodeDiffDetailListI } from '@/presenter/manager.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'

@Component
export default class CodeDiffRecord extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationCodeDiffDetailListI | null
  dataSource: EvaluationCodeDiffRecordI[] = []
  columns = EvaluationCodeDiffMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get matchSelfTag() {
    return parseToMapObj(this.baseConfig.self_tag)
  }
  get matchErrLevel() {
    return parseToMapObj(this.baseConfig.err_level)
  }

  @Watch('curDataRow')
  onChanged(row: EvaluationCodeDiffDetailListI | null) {
    this.visible && row && this.pullHistoryList(row.id)
  }

  @Emit('on-view')
  handleOnView(row: EvaluationCodeDiffRecordI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await getEvaluationRecord(id, 'codediff')
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { history } = res
    this.dataSource = (history as EvaluationCodeDiffRecordI[]) || []
  }
}
</script>
