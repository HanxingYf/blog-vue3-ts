<template>
  <Modal 
    :value="visible" 
    footer-hide 
    width="70"
    @on-cancel="onCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <!-- <template slot-scope="{ row, index }" slot="action">
        <Button type="info" size="small" @click="handleOnView(row)">查看</Button>
      </template> -->
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { EvaluationContentMarkRecordColumns } from './columns'
import { getEvaluationRecord, EvaluationContentRecordI } from '@/presenter/manager.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'
import { EvaluationContentRecordRowI, EvaluationContentDetailListRowI } from './types'

@Component
export default class ContentRecord extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationContentDetailListRowI | null
  dataSource: EvaluationContentRecordRowI[] = []
  columns = EvaluationContentMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get matchExpectAction() {
    return parseToMapObj(this.baseConfig.action)
  }
  get matchAssitAction() {
    return parseToMapObj(this.baseConfig.assist_action)
  }

  @Watch('curDataRow')
  onChanged(row: EvaluationContentDetailListRowI | null) {
    this.visible && row && this.pullHistoryList(row.id)
  }

  @Emit('on-view')
  handleOnView(row: EvaluationContentRecordRowI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await getEvaluationRecord(id, 'content')
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { history } = res
    this.dataSource = history ? this.parseHistoryData(history as EvaluationContentRecordI[]) : []
  }
  parseHistoryData(list: EvaluationContentRecordI[]) {
    return list.map((item) => {
      const {
        verifier, marker, update_time, expect_action,
        assist1, assist2, best_code, verify_comment
      } = item
      return {
        verifier,
        marker,
        update_time,
        expect_action: this.matchExpectAction[expect_action],
        assist1: this.matchAssitAction[assist1],
        assist2: this.matchAssitAction[assist2],
        best_code,
        verify_comment
      }
    })
  }
}
</script>
