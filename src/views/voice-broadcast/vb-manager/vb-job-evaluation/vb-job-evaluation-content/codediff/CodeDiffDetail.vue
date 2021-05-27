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
          <Button size="small" type="info" @click="handleOnViewMarkRecord(row)">查看</Button>
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
    <CodeDiffRecord 
      :visible="showRecordModal" 
      :cur-data-row="curDataRowForRecord" 
      @on-close="showRecordModal = false"
    />
    <Modal 
      v-model="showLabelModal" 
      footer-hide 
      width="98" 
      class-name="vertical-center-modal" 
      @on-cancel="showLabelModal = false">
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks" :esiweiMapDir="esiweiMapDir">
        <template slot="label-form">
          <LabelCodeDiffForm 
            :cur-data-row="curDataRowForLabel" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :is-mark-job="isMarkJob"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext($event)"
          />
        </template>
        <template slot="label-mark">
          <CodeDiffIndicator :curDataRow="curDataRowForLabel" />
        </template>
      </LabelModal> 
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { EvaluationCodeDetailListColumns } from './columns'
import { getEvaluationCodeDiffDetailList, EvaluationCodeDiffDetailListI, evaluationTask, acceptOrRejectTask } from '@/presenter/manager.pre'
import { parseToMapObj, parseToValueConfigArr, getEsiweiMapDir } from '@/utils'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import CodeDiffRecord from './CodeDiffRecord.vue'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelCodeDiffForm from '@/components/smart/LabelCodeDiffForm.vue'
import { pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import CodeDiffIndicator from '@/components/smart/CodeDiffIndicator.vue'

@Component({ components: { CodeDiffRecord, LabelModal, LabelCodeDiffForm, CodeDiffIndicator } })
export default class CodeDiffDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  columns = EvaluationCodeDetailListColumns
  dataSource: EvaluationCodeDiffDetailListI[] = []
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
  curDataRowForLabel: EvaluationCodeDiffDetailListI | null = null
  curDataRowForRecord: EvaluationCodeDiffDetailListI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']
  esiweiMapDir: { [propName: string]: number } | null = null

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
  get machine_tag() {
    return this.baseConfig.machine_tag
  }
  get job_mark_status() {
    return this.baseConfig.job_mark_status
  }
  get job_verify_status() {
    return this.baseConfig.job_verify_status
  }
  get matchMachineTag() {
    return parseToMapObj(this.machine_tag)
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
  async onCurDataRowChanged() {
    if (this.curDataRowForLabel) {
      const { link_list, map_version } = this.curDataRowForLabel
      const { linkids, esiweiMapDir } = getEsiweiMapDir(link_list)
      const geojson = await pullLinkGeojson(
        linkids,
        this.roadNetVersions
          .map((r) => r.version)
          .filter((v) => +v >= +map_version) // 找出大于或等于当前路网版本的集合
          .reverse()
      )
      this.geojsons = [geojson ? JSON.stringify(geojson) : '']
      this.esiweiMapDir = esiweiMapDir
    }
  }

  // methods
  async handleOnGetCaseList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const res = await getEvaluationCodeDiffDetailList(this.query.job_id, {
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
    this.dataSource = data_list
  }
  handleOnViewMarkRecord(row: EvaluationCodeDiffDetailListI) {
    this.showRecordModal = true
    this.curDataRowForRecord = row
  }
  handleOnLabel(row: EvaluationCodeDiffDetailListI, index: number) {
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
    const { id, mark_job_id } = this.curDataRowForLabel
    const { isDone, msg } = type === 'submit' ? await evaluationTask(id, mark_job_id, 'codediff', params) :
      await acceptOrRejectTask(id, mark_job_id, 'codediff', type === 'accept', params)
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
