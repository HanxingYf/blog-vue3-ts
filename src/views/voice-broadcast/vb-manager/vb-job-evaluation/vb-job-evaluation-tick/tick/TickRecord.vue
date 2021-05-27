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
import { EvaluationTickMarkRecordColumns } from './columns'
import { getEvaluationRecord, EvaluationTickRecordI } from '@/presenter/manager.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'
import { EvaluationTickRecordRowI, EvaluationTickDetailListRowI } from './types'

@Component
export default class TickRecord extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationTickDetailListRowI | null
  dataSource: EvaluationTickRecordRowI[] = []
  columns = EvaluationTickMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get matchVoiceTag() {
    return parseToMapObj(this.baseConfig.voice_tag)
  }

  @Watch('curDataRow')
  onChanged(row: EvaluationTickDetailListRowI | null) {
    row && this.pullHistoryList(row.extra.id)
  }

  @Emit('on-view')
  handleOnView(row: EvaluationTickRecordRowI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await getEvaluationRecord(id, 'tick')
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { history } = res
    this.dataSource = history ? this.parseHistoryData(history as EvaluationTickRecordI[]) : []
  }
  parseHistoryData(list: EvaluationTickRecordI[]) {
    return list.map((item) => {
      const {
        verifier, marker, update_time, start_turning_dis, tag,
        end_turning_dis, turning_dis, div_turning_dis, verify_comment
      } = item
      return {
        verifier,
        marker,
        update_time,
        start_turning_dis,
        end_turning_dis,
        turning_dis,
        div_turning_dis,
        tag: this.matchVoiceTag[tag] || `${tag}`,
        verify_comment
      }
    })
  }
}
</script>
