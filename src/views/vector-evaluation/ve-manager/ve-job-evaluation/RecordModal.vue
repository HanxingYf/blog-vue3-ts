<template>
  <Modal 
    :value="visible" 
    footer-hide 
    width="70"
    @on-cancel="onCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <template slot-scope="{ row, index }" slot="tag">
        {{ mapTag[row.tag] || +row.tag || '' }}
      </template>
      <template slot-scope="{ row, index }" slot="better_version">
        {{ mapBetterVersion[row.better_version] || row.better_version || '' }}
      </template>
      <template slot-scope="{ row, index }" slot="should_recall">
        {{ mapShouldRecall[row.should_recall] || row.should_recall || '' }}
      </template>
      <template slot-scope="{ row, index }" slot="beauty">
        {{ mapBeauty[row.beauty] || row.beauty || '' }}
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
import * as vectorManager from '@/models/manager/vector'

@Component
export default class RecordModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: vectorManager.VectorEvaluationCaseListI | null
  dataSource: vectorManager.VectorEvaluationCaseRecordI[] = []
  columns = TaskMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get mapTag() {
    return parseToMapObj(this.baseConfig.enlarge_map_tag)
  }
  get mapBetterVersion() {
    return parseToMapObj(this.baseConfig.enlarge_map_better_version)
  }
  get mapShouldRecall() {
    return parseToMapObj(this.baseConfig.enlarge_map_should_recall)
  }
  get mapBeauty() {
    return parseToMapObj(this.baseConfig.enlarge_map_beauty)
  }

  @Watch('curDataRow')
  onChanged(row: vectorManager.VectorEvaluationCaseListI | null) {
    this.visible && row && this.pullHistoryList(row.id)
  }

  @Emit('on-view')
  handleOnView(row: vectorManager.VectorEvaluationCaseListI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await vectorManager.getMarkRecord(id)
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
