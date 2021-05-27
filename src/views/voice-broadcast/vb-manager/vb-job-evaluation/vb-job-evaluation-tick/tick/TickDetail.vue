<template>
  <div class="task-evaluation-detail">
    <div class="info-wrapper">
      评测名称: {{ query.job_name }}, 评测类型: <Tag color="purple">{{ isMarkJob ? '评测' : '质检' }}</Tag>
    </div>
    <div class="radio-wrapper">
      <RadioGroup v-model="statusType" type="button">
        <Radio v-for="(item, index) in tabs" :key="index" :label='item.value'>{{ item.label }}</Radio>
      </RadioGroup>
    </div>
    <div class="table-wrapper">
      <Table :loading="loading" :columns="columns" :data="dataSource" border size="small">
        <template slot-scope="{ row, index }" slot="case_status">
          <span>{{ matchTabs[row.status] || row.status }}</span>
        </template>
        <template slot-scope="{ row, index }" slot="mark_record">
          <Button size="small" type="info" @click="onOpenMarkRecord(row)">查看</Button>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnLabel(row, index)">标注</Button>
        </template>
      </Table>
    </div>
    <div class="page-wrapper">
      <Page 
        :total="total" 
        :current="cur_page_num"
        @on-change="handleOnGetCaseList" 
        show-total 
        show-elevator
      />
    </div>
    <TickRecord 
      :visible="showRecordModal"
      :cur-data-row="curDataRowForRecord"
      @on-close="showRecordModal = false"
    />
    <Modal v-model="showLabelModal" footer-hide width="98" class-name="vertical-center-modal" @on-cancel="showLabelModal = false">
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks" :layer-items="layerItems">
        <template slot="label-form">
          <LabelTickForm 
            :cur-data-row="curDataRowForLabel && curDataRowForLabel.extra" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :blind="query.blind"
            :is-mark-job="isMarkJob"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext($event)"
          />
        </template>
      </LabelModal> 
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { EvaluationTickDetailListRowI, EvaluationTickRecordRowI, LayerItemsI } from './types'
import { EvaluationTickDetailListColumns } from './columns'
import { getEvaluationTickDetailList, EvaluationTickDetailListI, evaluationTask, acceptOrRejectTask, TimingI, CheckTimingI } from '@/presenter/manager.pre'
import { parseToMapObj, parseToValueConfigArr } from '@/utils'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import TickRecord from './TickRecord.vue'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelTickForm from '@/components/smart/LabelTickForm.vue'

@Component({ components: { TickRecord, LabelModal, LabelTickForm } })
export default class TickDetail extends Vue {
  columns = EvaluationTickDetailListColumns
  dataSource: EvaluationTickDetailListRowI[] = []
  total: number = 0
  cur_page_num: number = 1
  total_pages: number = 0
  hasPrev: boolean = false
  hasNext: boolean = false
  loading: boolean = false
  submitLoading: boolean = false
  statusType: string = '-1'
  showRecordModal: boolean = false
  showLabelModal: boolean = false
  curDataRowForLabel: EvaluationTickDetailListRowI | null = null
  curDataRowForRecord: EvaluationTickDetailListRowI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']
  layerItems: LayerItemsI | null = null

  // get
  get tabs() {
    const status = this.isMarkJob ? this.job_mark_status : this.job_verify_status
    const match = parseToMapObj(status)
    // if (this.isMarkJob) {
    //   match['1'] = '已完成'
    //   delete match['3'] // 再质检
    //   delete match['4'] // 已通过
    // } else {
    //   delete match['2'] // 被驳回
    // }
    let tabs = parseToValueConfigArr(match)
    tabs = [tabs[tabs.length - 1], ...tabs.slice(0, tabs.length - 1)]
    return tabs
  }
  get matchTabs() {
    return parseToMapObj(this.tabs)
  }
  get isMarkJob() {
    return this.query.dispatch_type === 1
  }
  get query() {
    const query = this.$route.query
    const { job_id, job_name, dispatch_type } = query
    return {
      job_id: +job_id,
      job_name,
      dispatch_type: +dispatch_type
    }
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get job_mark_status() {
    return this.baseConfig.job_mark_status
  }
  get job_verify_status() {
    return this.baseConfig.job_verify_status
  }
  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }

  @Watch('statusType')
  onChange() {
    this.handleOnGetCaseList(1)
  }
  @Watch('curDataRowForLabel')
  onCurDataRowChanged() {
    if (this.curDataRowForLabel) {
      const { extra } = this.curDataRowForLabel
      const {
        geojson_didi, didi_act_start_coor, didi_act_end_coor, didi_code_fix_coor,
        geojson_rival, rival_act_start_coor, rival_act_end_coor, rival_code_coor,
        turning_coor, traj_geojson, main_assi_end_coor, timing, check_timing
      } = extra
      this.geojsons = [geojson_didi]
      this.layerItems = {
        didi_act_start_coor, didi_act_end_coor, didi_code_fix_coor,
        geojson_rival, rival_act_start_coor, rival_act_end_coor, rival_code_coor,
        turning_coor, traj_geojson, main_assi_end_coor, timing, check_timing
      }
    }
  }

  async handleOnGetCaseList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const res = await getEvaluationTickDetailList(this.query.job_id, {
      page,
      per_page: 10,
      status: +this.statusType
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { data_list, total_num, pages, has_prev, has_next } = res
    this.total = total_num
    this.total_pages = pages
    this.hasPrev = has_prev
    this.hasNext = has_next
    this.dataSource = this.parseDataSource(data_list)
  }
  parseDataSource(data: EvaluationTickDetailListI[]) {
    return data.map((item) => {
      const {
        voice_diff_record_id, didi_tts, rival_tts, hot, status
      } = item
      return {
        voice_diff_record_id,
        didi_tts,
        rival_tts,
        hot,
        status,
        extra: item
      }
    })
  }
  onOpenMarkRecord(row: EvaluationTickDetailListRowI) {
    this.showRecordModal = true
    this.curDataRowForRecord = row
  }
  handleOnLabel(row: EvaluationTickDetailListRowI, index: number) {
    this.showLabelModal = true
    this.curDataRowForLabel = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit' | 'accept' | 'reject'
    params: { [propName: string]: string | number }
  }) {
    if (!this.curDataRowForLabel) {
      return
    }
    const { type, params } = payload
    this.submitLoading = true
    const { extra } = this.curDataRowForLabel
    const { id, mark_job_id } = extra
    const { isDone, msg } = type === 'submit' ? await evaluationTask(id, mark_job_id, 'tick', params) :
      await acceptOrRejectTask(id, mark_job_id, 'tick', type === 'accept', params)
    this.submitLoading = false
    const mapMsg: { [propName: string]: string } = {
      'submit': '标注',
      'accept': '通过',
      'reject': '驳回'
    }
    if (isDone) {
      // true：待评测、待质检、已驳回(通过)、已通过(驳回、提交)、被驳回、再质检
      // false: 所有、已驳回(驳回)、已通过(通过)、已评测、已修改
      this.$Message.success(`${mapMsg[type]}成功, ${msg}`)
      const { statusType } = this
      const isReduce = statusType === '0' ||
        (statusType === '1' && type !== 'submit') ||
        (statusType === '2' && (type === 'accept' || type === 'submit')) ||
        (statusType === '4' && (type === 'submit' || type === 'reject')) ||
        (statusType === '3' && type !== 'submit')
      this.handleOnPreOrNext(true, { isReduce, refresh: true })
    } else {
      this.$Message.error(`${mapMsg[type]}失败, ${msg}`)
    }
  }
  async handleOnPreOrNext(isNext: boolean, options?: { isReduce?: boolean, refresh?: boolean }) {
    const { handleOnGetCaseList } = this
    const { isReduce, refresh } = options || { isReduce: false, refresh: false }
    if (isNext) {
      if (isReduce) {
        if (this.hasNext) {
          await handleOnGetCaseList(this.cur_page_num)
          this.curDataRowForLabel = this.dataSource[this.curDataIndex]
        } else {
          if (this.dataSource.length > 1) {
            await handleOnGetCaseList(this.cur_page_num)
            if (this.curDataIndex > this.dataSource.length - 1) {
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            } else {
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            }
          } else {
            if (this.hasPrev) {
              this.cur_page_num--
              await handleOnGetCaseList(this.cur_page_num)
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            } else {
              await handleOnGetCaseList(this.cur_page_num)
              this.showLabelModal = false
              this.curDataRowForLabel = null
            }
          }
        }
      } else {
        if (this.curDataIndex === this.dataSource.length - 1) {
          if (this.hasNext) {
            this.cur_page_num++
            await handleOnGetCaseList(this.cur_page_num)
            this.curDataIndex = 0
            this.curDataRowForLabel = this.dataSource[0]
          } else {
            this.$Message.warning('已经是最后一个')
            await handleOnGetCaseList(this.cur_page_num)
          }
        } else {
          refresh && await handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex++
          this.curDataRowForLabel = this.dataSource[this.curDataIndex]
        }
      }
    } else {
      if (this.curDataIndex > 0) {
        this.curDataIndex--
        this.curDataRowForLabel = this.dataSource[this.curDataIndex]
      } else {
        if (this.hasPrev) {
          this.cur_page_num--
          await handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRowForLabel = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }

  // hooks
  mounted() {
    this.handleOnGetCaseList(1)
  }
}
</script>

<style lang="less" scoped>
.info-wrapper, .table-wrapper, .radio-wrapper, .page-wrapper {
  margin-bottom: 15px;
}
.page-wrapper {
  text-align: right;
}
</style>
