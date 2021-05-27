<template>
  <div class="task-manager-detail">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="getContentMarkedList(1)" 
      @on-cancel="handleOnReset"
      :loading="loading" />
    <div class="table-wrapper">
      <div class="info">评测名称：{{ query.job_name }}</div>
      <Table 
        :columns="columns" 
        :data="dataSource" 
        border 
        ref="table" 
        :loading="loading" 
        @on-selection-change="hanleOnSelect" size="small">
        <template slot-scope="{ row, index }" slot="diff_type">
          <Tooltip transfer :content="mapLaneDiffType[row.diff_type] || row.diff_type">
            <span>{{ mapLaneDiffType[row.diff_type] || row.diff_type }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="tag">
          <Tooltip transfer :content="mapLaneContentTag[row.tag] || row.tag">
            <span>{{ mapLaneContentTag[row.tag] || row.tag }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="path_consis">
          <Tooltip transfer :content="mapPathConsis[row.path_consis] || row.path_consis">
            <span>{{ mapPathConsis[row.path_consis] || row.path_consis }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="lane_issue_type">
          <Tooltip transfer :content="matchLaneIssueType[row.lane_issue_type] || row.lane_issue_type">
            <span>{{ matchLaneIssueType[row.lane_issue_type] || row.lane_issue_type }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="display_tag">
          <Tooltip transfer :content="mapLaneDisplayTag[row.display_tag] || row.display_tag">
            <span>{{ mapLaneDisplayTag[row.display_tag] || row.display_tag }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnViewCase(row, index)">查看</Button>
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData">导出CSV</Button>
      </div>
      <div class="page-wrapper">
        <Page 
          :total="total"
          :current="cur_page_num"
          @on-change="getContentMarkedList" 
          show-total 
          show-elevator/>
      </div>
    </div>
    <Modal 
      v-model="showLabelModal" 
      footer-hide 
      width="98" 
      class-name="vertical-center-modal" 
      @on-cancel="showLabelModal = false">
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks" :extraPointForLane="curDataRow">
        <template slot="label-form">
          <LabelLaneForm 
            :cur-data-row="curDataRow" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :blind="query.blind"
            :is-mark-job="true"
            :is_public_evaluation="false"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext"
          />
        </template>
        <template slot="label-mark">
          <LanelineIndicator :curDataRow="curDataRow" />
        </template>
      </LabelModal>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { TaskCaseListColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types';
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelLaneForm from '@/components/smart/LabelLaneForm.vue'
import LanelineIndicator from '@/components/smart/LanelineIndicator.vue'
import * as lanelineManager from '@/models/manager/laneline'

@Component({
  components: {
    NFilter,
    LabelModal,
    LabelLaneForm,
    LanelineIndicator
  }
})
export default class TaskDetail extends Vue {
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    lane_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'Record ID精确匹配'
    },
    path_consis: {
      type: 'select',
      label: '路口一致性',
      value: -1,
      options: this.baseConfig.path_consis,
      style: { width: '150px' }
    },
    tag: {
      type: 'select-multi',
      label: '内容评价结论',
      value: [],
      options: this.baseConfig.lane_content_tag,
      style: { width: '150px' }
    },
    lane_issue_type: {
      type: 'select-multi',
      label: '内容问题类型',
      value: [],
      options: this.baseConfig.lane_issue_type,
      style: { width: '150px' }
    },
    display_tag: {
      type: 'select-multi',
      label: '时机评价结论',
      value: [],
      options: this.baseConfig.lane_display_tag,
      style: { width: '150px' }
    }
  }
  // 表格相关
  loading: boolean = false
  columns = TaskCaseListColumns
  dataSource: lanelineManager.LanelineMarkedJobCaseListI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: lanelineManager.LanelineMarkedJobCaseListI[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataRow: lanelineManager.LanelineMarkedJobCaseListI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']

  get query() {
    const query = this.$route.query
    const { job_id, job_name, tag, lane_issue_type, display_tag } = query
    return {
      job_id: +job_id,
      job_name,
      tag: tag as string || '',
      lane_issue_type: lane_issue_type as string || '',
      display_tag: display_tag as string || ''
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get action() {
    return this.baseConfig.action
  }
  get lane_issue_type() {
    return this.baseConfig.lane_issue_type
  }
  get mapLaneContentTag() {
    return this.parseToMapObj(this.baseConfig.lane_content_tag)
  }
  get mapPathConsis() {
    return this.parseToMapObj(this.baseConfig.path_consis)
  }
  get mapLaneDisplayTag() {
    return this.parseToMapObj(this.baseConfig.lane_display_tag)
  }
  get matchLaneIssueType() {
    return this.parseToMapObj(this.baseConfig.lane_issue_type)
  }
  get mapLaneDiffType() {
    return this.parseToMapObj(this.baseConfig.lane_diff_type)
  }
  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }

  @Watch('curDataRow')
  onCurDataRowChanged() {
    if (this.curDataRow) {
      const { geojson } = this.curDataRow
      this.geojsons = [geojson]
    }
  }
  parseToMapObj(configs: ValueConfig[]) {
    const mapObj: { [propName: string]: string } = {}
    configs.forEach((c) => {
      mapObj[c.value] = c.label
    })
    return mapObj
  }
  async getContentMarkedList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const { lane_diff_record_id, path_consis, tag, lane_issue_type, display_tag } = this.filterOptions
    const res = await lanelineManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page,
      per_page: 10,
      marked: 1,
      lane_diff_record_id: lane_diff_record_id.value,
      path_consis: path_consis.value,
      tag: tag.value,
      lane_issue_type: lane_issue_type.value,
      display_tag: display_tag.value
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list, pages } = res
    this.total = total_num
    this.total_pages = pages
    this.dataSource = data_list
  }

  handleOnReset() {
    this.filterOptions.lane_diff_record_id.value = ''
    this.filterOptions.path_consis.value = -1
    this.filterOptions.tag.value = []
    this.filterOptions.lane_issue_type.value = []
    this.filterOptions.display_tag.value = []
    this.getContentMarkedList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await lanelineManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page: 1,
      per_page: this.total,
      marked: 1,
    })
    this.exportLoading = false
    if (!res) {
      this.$Message.error('导出失败')
      return
    }
    const { data_list } = res
    const data = data_list
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns: columns.slice(0, columns.length - 1),
      quoted: true,
      data: data.map((item: lanelineManager.LanelineMarkedJobCaseListI) => {
        return {
          ...item,
          tag: `${ this.mapLaneContentTag[item.tag] || item.tag }`,
          lane_issue_type: `${ this.matchLaneIssueType[item.lane_issue_type] || item.lane_issue_type }`,
          display_tag: `${ this.mapLaneDisplayTag[item.display_tag] || item.display_tag }`
        }
      })
    })
  }
  async handleOnImportData(selected: boolean) {
    this.importLoading = true
    const { imported, msg } = await importTruthDatabase(selected ? {
      id: this.selections.map((se) => se.id)
    } : { job_id: this.query.job_id })
    this.importLoading = false
    if (imported) {
      this.$Message.success(`导入成功, ${msg}`)
    } else {
      this.$Message.error(`导入失败, ${msg}`)
    }
  }
  hanleOnSelect(selections: lanelineManager.LanelineMarkedJobCaseListI[]) {
    this.selections = selections
  }
  handleOnViewCase(row: lanelineManager.LanelineMarkedJobCaseListI, index: number) {
    this.showLabelModal = true
    this.curDataRow = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit' | 'accept' | 'reject' // 已标注列表只有submit
    params: { [propName: string]: string | number }
  }) {
    if (!this.curDataRow) {
      return
    }
    const { type, params } = payload
    this.submitLoading = true
    const { id, mark_job_id } = this.curDataRow
    const { isDone, msg } = await lanelineManager.markJob(id, mark_job_id, params)
    this.submitLoading = false
    const mapMsg: { [propName: string]: string } = {
      'submit': '标注',
      'accept': '通过',
      'reject': '驳回'
    }
    if (isDone) {
      this.$Message.success(`${mapMsg[type]}成功, ${msg}`)
    } else {
      this.$Message.error(`${mapMsg[type]}失败, ${msg}`)
    }
  }
  async handleOnPreOrNext(isNext: boolean) {
    if (isNext) {
      // 当前页非最后一个 -> 下一个
      if (this.curDataIndex < this.dataSource.length - 1) {
        this.curDataIndex++
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        // 非最后一页 -> 翻页
        if (this.cur_page_num < this.total_pages) {
          this.cur_page_num++
          await this.getContentMarkedList(this.cur_page_num)
          this.curDataIndex = 0
          this.curDataRow = this.dataSource[0]
        } else {
          this.$Message.warning('已经是最后一个')
        }
      }
    } else {
      // 当前页非第一个 -> 上一个
      if (this.curDataIndex > 0) {
        this.curDataIndex--
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        // 非第一页 -> 上一页
        if (this.cur_page_num > 1) {
          this.cur_page_num--
          await this.getContentMarkedList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  mounted() {
    const { tag, lane_issue_type, display_tag } = this.query
    this.filterOptions.tag.value = tag ? tag.split(',').map((s) => +s) : []
    this.filterOptions.lane_issue_type.value = lane_issue_type ? lane_issue_type.split(',').map((s) => +s) : []
    this.filterOptions.display_tag.value = display_tag ? display_tag.split(',').map((s) => +s) : []
    this.getContentMarkedList(1)
  }
}
</script>

<style lang="less" scoped>
.table-wrapper {
  .info {
    padding: 10px 0;
  }
  margin: 20px 0;
}
.footer-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

