<template>
  <Modal 
    :value="visible" 
    footer-hide 
    width="70"
    @on-cancel="onCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <template slot-scope="{ row, index }" slot="tag">
        {{ mapLaneContentTag[row.tag] || row.tag }}
      </template>
      <template slot-scope="{ row, index }" slot="lane_issue_type">
        {{ matchLaneIssueType[row.lane_issue_type] || row.lane_issue_type }}
      </template>
      <template slot-scope="{ row, index }" slot="display_tag">
        {{ mapLaneDisplayTag[row.display_tag] || row.display_tag }}
      </template>
      <!-- <template slot-scope="{ row, index }" slot="action">
        <Button type="info" size="small" @click="handleOnView(row)">查看</Button>
      </template> -->
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { TaskMarkRecordColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'
import * as lanelineManager from '@/models/manager/laneline'

@Component
export default class RecordModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: lanelineManager.LanelineEvaluationCaseListI | null
  dataSource: lanelineManager.LanelineEvaluationCaseRecordI[] = []
  columns = TaskMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get mapLaneContentTag() {
    return parseToMapObj(this.baseConfig.lane_content_tag)
  }
  get mapLaneDisplayTag() {
    return parseToMapObj(this.baseConfig.lane_display_tag)
  }
  get matchLaneIssueType() {
    return parseToMapObj(this.baseConfig.lane_issue_type)
  }

  @Watch('curDataRow')
  onChanged(row: lanelineManager.LanelineEvaluationCaseListI | null) {
    this.visible && row && this.pullHistoryList(row.id)
  }

  @Emit('on-view')
  handleOnView(row: lanelineManager.LanelineEvaluationCaseListI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await lanelineManager.getMarkRecord(id)
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { history } = res
    this.dataSource = history || []
  }
}
</script>
