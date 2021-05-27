<template>
  <div class="task-manager-detail">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="getMarkedList(1)" 
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
        <template slot-scope="{ row, index }" slot="gsb">
          <p>{{ matchSelfTag[row.tag] || row.tag }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="err_level">
          <p>{{ matchErrLevel[row.err_level] || row.err_level }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnViewCase(row, index)">查看</Button>
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData">导出CSV</Button>&nbsp;
        <Poptip confirm title="确认导入真值选择项吗？" placement="top" @on-ok="handleOnImportData(true)">
          <Button :loading="importLoading" :disabled="true || !selections.length" type="primary">导入真值选择项</Button>&nbsp;
        </Poptip>
        <Poptip confirm title="确认导入真值全部项吗？" placement="top" @on-ok="handleOnImportData(false)">
          <Button :loading="importLoading" :disabled="true" type="primary">导入真值全部项</Button>
        </Poptip>
      </div>
      <div class="page-wrapper">
        <Page 
          :total="total"
          :current="cur_page_num"
          @on-change="getMarkedList" 
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
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks" :esiweiMapDir="esiweiMapDir">
        <template slot="label-form">
          <LabelCodeDiffForm 
            :cur-data-row="curDataRow" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :blind="query.blind"
            :is-mark-job="true"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext"
          />
        </template>
        <template slot="label-mark">
          <CodeDiffIndicator :curDataRow="curDataRow" />
        </template>
      </LabelModal> 
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { ManagerCodeDiffMarkedTaskListColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { getManagerCodeDiffNormalMarkedList, ManagerCodeDiffNormalMarkedListI, evaluationTask } from '@/presenter/manager.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelCodeDiffForm from '@/components/smart/LabelCodeDiffForm.vue'
import CodeDiffIndicator from '@/components/smart/CodeDiffIndicator.vue'
import { pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { getEsiweiMapDir } from '@/utils';

@Component({
  components: {
    NFilter,
    LabelModal,
    LabelCodeDiffForm,
    CodeDiffIndicator
  }
})
export default class CodeDiffDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    self_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'Record ID精确匹配'
    },
    tag: {
      type: 'select',
      label: 'GSB',
      value: '',
      options: this.baseConfig.self_tag,
      style: { width: '170px' }
    },
    err_level: {
      type: 'select',
      label: '错误等级',
      value: '',
      options: this.baseConfig.err_level,
      style: { width: '100px' }
    }
  }
  // 表格相关
  columns = ManagerCodeDiffMarkedTaskListColumns
  loading: boolean = false
  dataSource: ManagerCodeDiffNormalMarkedListI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: ManagerCodeDiffNormalMarkedListI[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataRow: ManagerCodeDiffNormalMarkedListI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']
  esiweiMapDir: { [propName: string]: number } | null = null

  get query() {
    const query = this.$route.query
    const { job_id, job_name, tag, err_level } = query
    return {
      job_id: +job_id,
      job_name,
      tag: +tag,
      err_level: +err_level
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get matchSelfTag() {
    return this.parseToMapObj(this.baseConfig.self_tag)
  }
  get matchErrLevel() {
    return this.parseToMapObj(this.baseConfig.err_level)
  }

  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }

  @Watch('curDataRow')
  async onCurDataRowChanged() {
    if (this.curDataRow) {
      const { link_list, map_version } = this.curDataRow
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
  parseToMapObj(configs: ValueConfig[]) {
    const mapObj: { [propName: string]: string } = {}
    configs.forEach((c) => {
      mapObj[c.value] = c.label
    })
    return mapObj
  }
  async getMarkedList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const { self_diff_record_id, tag, err_level } = this.filterOptions
    const res = await getManagerCodeDiffNormalMarkedList({
      user: this.userInfo.username,
      job_id: this.query.job_id,
      page,
      per_page: 10,
      marked: 1,
      ...(self_diff_record_id.value ? { self_diff_record_id: self_diff_record_id.value } : {}),
      ...(tag.value ? { tag: tag.value } : {}),
      ...(err_level.value ? { err_level: err_level.value } : {})
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
    this.filterOptions.self_diff_record_id.value = ''
    this.filterOptions.tag.value = ''
    this.filterOptions.err_level.value = ''
    this.getMarkedList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await getManagerCodeDiffNormalMarkedList({
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
    const { data_list } = res
    const data = data_list
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: data.map((d) => {
        return {
          ...d,
          tag: this.matchSelfTag[d.tag],
          err_level: this.matchErrLevel[d.err_level]
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
  hanleOnSelect(selections: ManagerCodeDiffNormalMarkedListI[]) {
    this.selections = selections
  }
  handleOnViewCase(row: ManagerCodeDiffNormalMarkedListI, index: number) {
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
    const { isDone, msg } = await evaluationTask(id, mark_job_id, 'codediff', params)
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
          await this.getMarkedList(this.cur_page_num)
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
          await this.getMarkedList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  mounted() {
    this.filterOptions.tag.value = this.query.tag
    this.filterOptions.err_level.value = this.query.err_level
    this.getMarkedList(1)
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

