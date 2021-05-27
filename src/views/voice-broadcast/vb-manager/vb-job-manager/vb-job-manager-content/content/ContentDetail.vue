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
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnViewCase(row, index)">查看</Button>
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData">导出CSV</Button>&nbsp;
        <Poptip confirm title="确认导入真值选择项吗？" placement="top" @on-ok="handleOnImportData(true)">
          <Button :loading="importLoading" :disabled="!selections.length" type="primary">导入真值选择项</Button>&nbsp;
        </Poptip>
        <Poptip confirm title="确认导入真值全部项吗？" placement="top" @on-ok="handleOnImportData(false)">
          <Button :loading="importLoading" type="primary">导入真值全部项</Button>
        </Poptip>
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
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks">
        <template slot="label-form">
          <LabelContentForm 
            :cur-data-row="curDataRow && curDataRow.extra" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :blind="query.blind"
            :is-mark-job="true"
            :is_public_evaluation="false"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext"
          />
        </template>
      </LabelModal> 
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { ManagerContentMarkedTaskListColumns, ManagerContentMarkedTaskListColumnsBlind } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { getManagerContentNormalMarkedList, ManagerContentNormalMarkedListI, evaluationTask } from '@/presenter/manager.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types';
import { ManagerContentTaskMarkedListRowI, ManagerContentTaskListRowI } from './types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelContentForm from '@/components/smart/LabelContentForm.vue'

@Component({
  components: {
    NFilter,
    LabelModal,
    LabelContentForm
  }
})
export default class ContentDetail extends Vue {
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    code_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'Record ID精确匹配'
    },
    tag: {
      type: 'select-multi',
      label: '结论',
      value: [],
      options: this.manual_tag,
      style: { width: '170px' }
    },
    path_consis: {
      type: 'select',
      label: '路线一致性',
      value: '',
      options: this.baseConfig.path_consis,
    },
    expect_action: {
      type: 'select',
      label: '期望动作',
      value: '',
      options: this.action,
      style: { width: '100px' }
    },
    assist1: {
      type: 'select',
      label: '辅助动作1',
      value: '',
      options: this.assist_action,
      style: { width: '100px' }
    },
    assist2: {
      type: 'select',
      label: '辅助动作2',
      value: '',
      options: this.assist_action,
      style: { width: '100px' }
    },
    issue_type: {
      type: 'select',
      label: '问题类型',
      value: '',
      options: this.issue_type,
      style: { width: '100px' }
    }
  }
  // 表格相关
  loading: boolean = false
  dataSource: ManagerContentTaskMarkedListRowI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: ManagerContentTaskMarkedListRowI[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataRow: ManagerContentTaskMarkedListRowI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['', '']
  marks: string[] = ['', '']

  get query() {
    const query = this.$route.query
    const { job_id, job_name, blind, tag, issue_type, path_consis } = query
    return {
      job_id: +job_id,
      job_name,
      blind: blind ? !!+blind : false,
      tag: tag as string || '',
      issue_type: issue_type ? +issue_type : '',
      path_consis: path_consis ? +path_consis : ''
    }
  }
  get columns() {
    return this.query.blind ? ManagerContentMarkedTaskListColumnsBlind : ManagerContentMarkedTaskListColumns
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get manual_tag() {
    return this.baseConfig.manual_tag
  }
  get action() {
    return this.baseConfig.action
  }
  get assist_action() {
    return this.baseConfig.assist_action
  }
  get issue_type() {
    return this.baseConfig.issue_type
  }
  get matchPathConsis() {
    return this.parseToMapObj(this.baseConfig.path_consis)
  }
  get matchManualTag() {
    return this.parseToMapObj(this.manual_tag)
  }
  get matchAction() {
    return this.parseToMapObj(this.action)
  }
  get matchAssistAction() {
    return this.parseToMapObj(this.assist_action)
  }
  get matchCrossAction() {
    return this.parseToMapObj(this.baseConfig.cross_action)
  }
  get matchIssueType() {
    return this.parseToMapObj(this.baseConfig.issue_type)
  }
  get matchIssueStatus() {
    return this.parseToMapObj(this.baseConfig.issue_status)
  }
  get matchIssueSolution() {
    return this.parseToMapObj(this.baseConfig.issue_solution)
  }
  get matchRoadIssueNet() {
    return this.parseToMapObj(this.baseConfig.road_issue_net)
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
      const { left_geo, right_geo, left_mark, right_mark } = this.curDataRow
      this.geojsons = [left_geo, right_geo]
      this.marks = this.query.blind ? ['左', '右'] : [left_mark, right_mark]
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
    const { code_diff_record_id, path_consis, tag, expect_action, assist1, assist2, issue_type } = this.filterOptions
    const res = await getManagerContentNormalMarkedList({
      user: this.userInfo.username,
      job_id: this.query.job_id,
      page,
      per_page: 10,
      marked: 1,
      ...(code_diff_record_id.value ? { code_diff_record_id: code_diff_record_id.value } : {}),
      ...(tag.value ? { tag: tag.value.join(',') } : {}),
      ...(`${path_consis.value}` ? { path_consis: path_consis.value } : {}),
      ...(expect_action.value ? { expect_action: expect_action.value } : {}),
      ...(assist1.value ? { assist1: assist1.value } : {}),
      ...(assist2.value ? { assist2: assist2.value } : {}),
      ...(issue_type.value ? { issue_type: issue_type.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, mark_jobs, pages } = res
    this.total = total_num
    this.total_pages = pages
    this.dataSource = this.parseDataSource(mark_jobs)
  }
  parseDataSource(data: ManagerContentNormalMarkedListI[]): ManagerContentTaskMarkedListRowI[] {
    return data.map((item) => {
      const {
        id, code_diff_record_id, update_time, path_consis,
        tag, expect_action, assist1, assist2,
        cross_shape, best_code, geojson_didi, geojson_rival,
        didi_code_family, rival_code_family, custom_mark,
        auto_move, issue_type, issue_status, issue_sub_type,
        issue_solution, last_operator, sort_site
      } = item
      const blind = this.query.blind && sort_site && sort_site === 2
      return {
        id,
        code_diff_record_id,
        evaluation_time: update_time,
        consistent_of_route: this.matchPathConsis[path_consis],
        conclusion: `${this.matchManualTag[tag]}`,
        action_of_expectation: this.matchAction[expect_action],
        action_of_auxiliary_1: this.matchAssistAction[assist1],
        action_of_auxiliary_2: this.matchAssistAction[assist2],
        intersection: this.matchCrossAction[cross_shape],
        best_code,
        left_mark: blind ? '滴滴' : '竞品',
        right_mark: blind ? '竞品' : '滴滴',
        left_geo: blind ? geojson_didi : geojson_rival,
        right_geo: blind ? geojson_rival : geojson_didi,
        left_code_family: blind ? didi_code_family : rival_code_family,
        right_code_family: blind ? rival_code_family : didi_code_family,
        note: custom_mark,
        auto_move: auto_move ? '是' : '否',
        issue_type: this.matchIssueType[issue_type],
        issue_status: this.matchIssueStatus[issue_status],
        issue_sub_type: this.matchRoadIssueNet[issue_sub_type] || `${issue_sub_type}-无映射关系`,
        issue_solution: this.matchIssueSolution[issue_solution],
        last_operator,
        extra: item
      }
    })
  }
  handleOnReset() {
    this.filterOptions.code_diff_record_id.value = ''
    this.filterOptions.tag.value = ''
    this.filterOptions.expect_action.value = ''
    this.filterOptions.assist1.value = ''
    this.filterOptions.assist2.value = ''
    this.filterOptions.issue_type.value = ''
    this.getContentMarkedList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await getManagerContentNormalMarkedList({
      user: this.userInfo.username,
      job_id: this.query.job_id,
      page: 1,
      per_page: this.total,
      marked: 1,
    })
    this.exportLoading = false
    if (!res) {
      this.$Message.error('导出失败')
      return
    }
    const { mark_jobs } = res
    const data = this.parseDataSource(mark_jobs)
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns: [
        ...columns.slice(1, columns.length - 1),
        {
          title: '滴滴播报',
          key: 'didi_code',
          align: 'center'
        },
        {
          title: '竞品播报',
          key: 'rival_code',
          align: 'center'
        },
      ],
      quoted: true,
      data: data.map((item: ManagerContentTaskMarkedListRowI) => {
        const { extra } = item
        // @ts-ignore
        delete item.extra
        return {
          ...item,
          didi_code: extra.didi_code,
          rival_code: extra.rival_code
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
  hanleOnSelect(selections: ManagerContentTaskMarkedListRowI[]) {
    this.selections = selections
  }
  handleOnViewCase(row: ManagerContentTaskMarkedListRowI, index: number) {
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
    const { extra } = this.curDataRow
    const { id, mark_job_id } = extra
    const { isDone, msg } = await evaluationTask(id, mark_job_id, 'content', params)
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
    this.filterOptions.tag.value = this.query.tag ? this.query.tag.split(',').map((s) => +s) : []
    this.filterOptions.issue_type.value = this.query.issue_type
    this.filterOptions.path_consis.value = this.query.path_consis
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

