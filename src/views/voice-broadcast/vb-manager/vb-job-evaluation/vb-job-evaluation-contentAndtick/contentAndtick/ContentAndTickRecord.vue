<template>
  <Modal :value="visible" footer-hide width="70" @on-cancel="onCancel">
    <Table
      :columns="columns"
      :data="dataSource"
      :loading="loading"
      border
      size="small"
      max-height="700"
    >
      Î<template slot-scope="{ row, index }" slot="content_tag">
        <p v-if="row.content_tag == 1">新版本好</p>
        <p v-if="row.content_tag == 2">旧版本好</p>
        <p v-if="row.content_tag == 3">两边都好</p>
        <p v-if="row.content_tag == 4">两边都不好</p>
      </template>
      <template slot-scope="{ row, index }" slot="pos_tag">
        <p v-if="row.pos_tag == 1">早</p>
        <p v-if="row.pos_tag == 2">晚</p>
        <p v-if="row.pos_tag == 3">合适</p>
      </template>
      <template slot-scope="{ row, index }" slot="time">
        <p>{{ row.update_time.split(" ")[1] }}</p>
        <p>{{ row.update_time.split(" ")[0] }}</p>
      </template>
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { EvaluationContentAndTickMarkRecordColumns } from './columns'
import { getEvaluationContentAndTickRecord, EvaluationTickRecordI, EvaluationContentAndTickRecordI } from '@/presenter/manager.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { parseToMapObj } from '@/utils'
import { EvaluationContentAndTickRecordRowI, EvaluationContentAndTickDetailListRowI } from './types'

@Component
export default class ContentAndTickRecord extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationContentAndTickDetailListRowI | null
  dataSource: EvaluationContentAndTickRecordI[] = []
  columns = EvaluationContentAndTickMarkRecordColumns
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get matchVoiceTag() {
    return parseToMapObj(this.baseConfig.voice_tag)
  }

  @Watch('curDataRow')
  onChanged(row: EvaluationContentAndTickDetailListRowI | null) {
    row && this.pullHistoryList(+row.id)
  }

  @Emit('on-view')
  handleOnView(row: EvaluationContentAndTickRecordRowI) {
    return row
  }
  @Emit('on-close')
  onCancel() {
    return true
  }
  async pullHistoryList(id: number) {
    this.loading = true
    const res = await getEvaluationContentAndTickRecord(id)
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }

    const { history } = res
    console.log(history, '成功');
    // this.dataSource = history,
    this.dataSource = history ? this.parseHistoryData(history) : []
  }
  parseHistoryData(list: EvaluationContentAndTickRecordI[]) {
    return list.map((item) => {
      const {
        content_err_reason,
        content_err_type,
        content_tag,
        custom_mark,
        create_time,
        id,
        jenkins_mark_job_record_id,
        marker,
        pos_err_reason,
        pos_err_type,
        pos_tag,
        update_time,
        verifier,
        verify_comment,
      } = item
      return {
        content_err_reason,
        content_err_type,
        content_tag,
        custom_mark,
        create_time,
        id,
        jenkins_mark_job_record_id,
        marker,
        pos_err_reason,
        pos_err_type,
        pos_tag,
        update_time,
        verifier,
        verify_comment,
      }
    })
  }
}
</script>
