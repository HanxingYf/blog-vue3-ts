<template>
  <div class="truth-database-list">
    <!-- 筛选 -->
    <NFilter 
      :configs="filterOptions" 
      @on-submit="pullCaseList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"/>
    <!-- 表格 -->
    <div class="table-wrapper">
      <Table 
        :columns="columns" 
        :data="dataSource" 
        :loading="loading"
        border 
        ref="table"
        size="small"
        @on-selection-change="handleOnSelect">
        <template slot-scope="{ row, index }" slot="status">
          <div v-if="dataSource[index].status == '正常'">
            <div style="color: #32af30; font-weight: 900;">{{ dataSource[index].status }}</div>
          </div>
          <div v-if="dataSource[index].status == '待继承'">
            <div style="color: #ff9635; font-weight: 900;">{{ dataSource[index].status }}</div>
          </div>
          <div v-if="dataSource[index].status == '失效'">
            <div style="color: #f51407; font-weigth: 900;">{{ dataSource[index].status }}</div>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="evaluation_record">
          <Button size="small" type="info" @click="handleOnViewChangeLog(row)">查看</Button>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button size="small" type="primary" @click="handleOnViewDetails(row, index)">查看</Button>&nbsp;
            <Poptip 
              confirm 
              title="确认删除此项吗？" 
              placement="left" 
              @on-ok="handleOnDeleteTruth([row.case_id])" 
              popper-class="delete-tip">
              <Button size="small" type="error">删除</Button>
            </Poptip>
          </div>
        </template>
      </Table>
      <div class="table-page">
        <div class="button-wrap">
          <Poptip confirm title="确认删除选择项吗？" placement="top" @on-ok="handleOnDeleteTruth">
            <Button :disabled="!selectedIds.length" type="error">删除选择项</Button>
          </Poptip>
          <Button :loading="exportLoading" @click="handleOnExportData">导出全部CSV</Button>
        </div>
        <Page 
          :total="total" 
          :page-size="num_per_page" 
          :current="cur_page_num"
          show-total 
          show-elevator 
          @on-change="pullCaseList" >
        </Page>
      </div>
    </div>
    <!-- 变更记录 -->
    <TruthChangeLogModal 
      :show="showRecordModal" 
      :case-id="curCaseId" 
      @on-close="handleOnCloseChangeLogModal"
    />
    <!-- 真值标注 -->
    <Modal 
      v-model="showLabelModal" 
      footer-hide 
      width="98" 
      class-name="vertical-center-modal" 
      @on-cancel="showLabelModal = false">
      <LabelModal 
        :visible="showLabelModal" 
        :geojsons="geojsons"
        :esiweiMapDir="esiweiMapDir" 
        :marks="marks">
        <template slot="label-form">
          <LabelTruthForm 
            :cur-data-row="curDataRow && curDataRow.extra" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="onPreOrNext"
          />
        </template>
      </LabelModal> 
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Emit, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import TruthChangeLogModal from './TruthChangeLogModal.vue'
import { truthDatabaseListColumns } from './columns'
import { ValueConfig } from '@/types'
import {
  pullTruthDatabaseList, TruthDatabaseListResItemI,
  updatedTurthDatabase, deleteTruthDatabase
} from '@/presenter/truth.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI, pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { TruthListRowI } from './types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelTruthForm from '@/components/smart/LabelTruthForm.vue'
import { getEsiweiMapDir } from '@/utils'

@Component({
  components: {
    LabelModal,
    LabelTruthForm,
    TruthChangeLogModal,
    NFilter
  }
})
export default class TruthList extends Vue {
  @Prop({ type: String, default: 'normal' }) readonly truthType!: 'normal' | 'inhreit'
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  columns = truthDatabaseListColumns
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'caseID',
      value: '',
      placeholder: '真值id精确匹配',
      style: { width: '200px' }
    },
    group_id: {
      type: 'input',
      label: 'group_id',
      value: '',
      placeholder: '批次精确匹配',
      style: { width: '200px' }
    },
    checker_name: {
      type: 'input',
      label: '审核人',
      value: '',
      placeholder: '审核人名称',
      style: { width: '150px' }
    },
    status: {
      type: 'select',
      label: '状态',
      value: '',
      options: this.truth_status,
      placeholder: '请选择状态',
      style: { width: '150px' }
    }
  }
  dataSource: TruthListRowI[] = []
  total: number = 0 // 总条数
  num_per_page: number = 10 // 每页条数
  cur_page_num: number = 1 // 当前页码
  total_pages: number = 1 // 总页码
  loading: boolean = false
  selectedIds: number[] = []
  exportLoading: boolean = false // 导出loading
  showLabelModal: boolean = false // 显示标注浮窗
  curDataRow: TruthListRowI | null = null
  curDataIndex: number = 0
  curCaseId: number = 0 // 当前caseId(查看变更记录)
  showRecordModal: boolean = false
  submitLoading: boolean = false
  geojsons: string[] = ['']
  marks: string[] = ['']
  esiweiMapDir: { [propName: string]: number } | null = null

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get cross_action() {
    return this.baseConfig.cross_action
  }
  get truth_source() {
    return this.baseConfig.truth_source
  }
  get action() {
    return this.baseConfig.action
  }
  get truth_status() {
    return this.baseConfig.truth_status
  }
  get isNormalTruth() {
    return this.truthType === 'normal'
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
      const { extra } = this.curDataRow
      const { code_link_list, map_version } = extra
      const { linkids, esiweiMapDir } = getEsiweiMapDir(code_link_list)
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

  // 拉取数据
  async pullCaseList(page: number, index?: number) {
    this.loading = true
    const { id, group_id, checker_name, status } = this.filterOptions
    const res = await pullTruthDatabaseList(this.truthType, {
      page: page || this.cur_page_num,
      per_page: 10,
      id: id.value,
      group_id: group_id.value,
      checker_name: checker_name.value,
      status: +status.value
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { codes, total_num, num_per_page, cur_page_num, pages } = res
    Object.assign(this, {
      total: total_num,
      num_per_page,
      cur_page_num,
      total_pages: pages,
      dataSource: this.parseDataSource(codes)
    })
  }
  // 解析 dataSource
  parseDataSource(dataSource: TruthDatabaseListResItemI[]) {
    return dataSource.map((item: TruthDatabaseListResItemI) => {
      const {
        id, group_id, true_value, city_code, source, tts,
        status, task_id, record_id, checker_name, code_family
      } = item
      const _status = this.truth_status.find((obj: ValueConfig) => obj.value == status)

      const _tts = this.action.find((obj: ValueConfig) => obj.value == tts)

      const assist = true_value.assist_text ? true_value.assist_text.join(',') : '-'

      const city_name = this.city_list.find((obj: ValueConfig) => obj.value == city_code)

      const _cross_kind = this.cross_action.find((obj: ValueConfig) => obj.value == true_value.cross_kind)

      const _source = this.truth_source.find ((obj: ValueConfig) => obj.value == source)

      return {
        id,
        status: _status ? _status.label : status,
        group_id,
        tts: _tts ? _tts.label : tts,
        assist,
        code_family,
        code: true_value.code,
        city_name: city_name ? city_name.label : city_code,
        cross_kind: _cross_kind ? _cross_kind.label : true_value.cross_kind,
        source: _source ? _source.label : source,
        task_id,
        record_id,
        checker_name,
        extra: item
      }
    })
  }
  // 重置
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.group_id.value = ''
    this.filterOptions.checker_name.value = ''
    this.filterOptions.status.value = ''
    this.pullCaseList(1)
  }
  // 选择
  handleOnSelect(selection: TruthListRowI[]) {
    this.selectedIds = selection.map((sel) => sel.case_id)
  }
  // 删除
  async handleOnDeleteTruth(ids?: number[]) {
    const delIds = ids || this.selectedIds
    if (!delIds.length) {
      this.$Message.warning('请先选择')
      return
    }
    const { isDone, msg } = await deleteTruthDatabase({ ids: delIds })
    if (isDone) {
      this.$Message.success(`删除成功, ${msg}`)
      this.selectedIds = []
      this.pullCaseList(this.cur_page_num)
    } else {
      this.$Message.error(`删除失败, ${msg}`)
    }
  }
  // 导出
  async handleOnExportData() {
    const table: any = this.$refs.table
    const { columns } = this
    await this.handleOnReset() // 重置筛选以获取总页数
    this.exportLoading = true
    const res = await pullTruthDatabaseList(this.truthType, {
      page: 1,
      per_page: this.total,
      id: '',
      group_id: '',
      checker_name: ''
    })
    this.exportLoading = false
    if (!res) {
      this.$Message.success('导出失败， 请求失败')
      return
    }
    const { codes } = res
    table.exportCsv({
      filename: `${ this.isNormalTruth ? '真值列表' : '待继承真值列表' }--${new Date().toLocaleString()}`,
      columns: columns.slice(1, columns.length - 2),
      data: this.parseDataSource(codes),
      quoted: true
    })
    this.$Message.success('导出成功')
  }
  // 查看真值case
  handleOnViewDetails(row: TruthListRowI, index: number) {
    this.showLabelModal = true
    this.curDataIndex = index
    this.curDataRow = row
  }
  // 查看变更记录
  handleOnViewChangeLog(row: TruthListRowI) {
    this.curCaseId = row.case_id
    this.showRecordModal = true
  }
  // 关闭变更记录
  handleOnCloseChangeLogModal(shouldRefresh?: boolean) {
    this.showRecordModal = false
    shouldRefresh && this.pullCaseList(this.cur_page_num)
  }
  // 上、下一个
  async onPreOrNext(isNext: boolean) {
    if (isNext) {
      // 当前页非最后一个 -> 下一个
      if (this.curDataIndex < this.dataSource.length - 1) {
        this.curDataIndex++
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        // 非最后一页 -> 翻页
        if (this.cur_page_num < this.total_pages) {
          this.cur_page_num++
          await this.pullCaseList(this.cur_page_num)
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
          await this.pullCaseList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  async handleOnSubmit(payload: {
    type: 'submit' | 'delete'
    params: { [propName: string]: string | number }
  }) {
    if (!this.curDataRow) {
      return
    }
    const { type, params } = payload
    this.submitLoading = true
    const { extra } = this.curDataRow
    const { id } = extra
    const { isDone, msg } = type === 'submit' ? await updatedTurthDatabase(id, params) :
      await deleteTruthDatabase({ ids: [id] })
    this.submitLoading = false
    const mapMsg: { [propName: string]: string } = {
      'submit': '标注',
      'delete': '删除'
    }
    if (isDone) {
      this.$Message.success(`${mapMsg[type]}成功, ${msg}`)
      if (type === 'delete') {
        this.showLabelModal = false
        this.pullCaseList(1)
      }
    } else {
      this.$Message.error(`${mapMsg[type]}失败, ${msg}`)
    }
  }
  mounted() {
    this.pullCaseList(1)
  }
}
</script>

<style lang="less" scoped>
.table-search, .table-page{
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    text-align: left;
  }
  .button-wrap{
    display: flex;
    margin-top: 10px;
    button {
      margin-right: 12px;
    }
  }
}

.action-btn-group{
  .delete-tip{
    background-color: black !important;
    top: 1000px !important;
    i{
      left: 22px !important;
    }
  }
}
</style>
