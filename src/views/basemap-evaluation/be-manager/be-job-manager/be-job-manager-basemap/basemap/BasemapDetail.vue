<template>
  <div class="task-manager-detail">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetCaseList(1)" 
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
        <template slot-scope="{ row, index }" slot="poi_type">
          {{ mapPoiType[row.Type] || row.Type }}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnViewCase(row, index)">查看</Button>
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData">导出CSV</Button>&nbsp;
        <!-- <Poptip confirm title="确认导入真值选择项吗？" placement="top" @on-ok="handleOnImportData(true)">
          <Button :loading="importLoading" :disabled="!selections.length" type="primary">导入真值选择项</Button>&nbsp;
        </Poptip>
        <Poptip confirm title="确认导入真值全部项吗？" placement="top" @on-ok="handleOnImportData(false)">
          <Button :loading="importLoading" type="primary">导入真值全部项</Button>
        </Poptip> -->
      </div>
      <div class="page-wrapper">
        <Page 
          :total="total"
          :current="cur_page_num"
          @on-change="handleOnGetCaseList" 
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
      <LabelModal :visible="showLabelModal" :poi-config="poiConfig" :hasPano="false">
        <template v-slot:label-form="slotProps">
          <LabelBasemapForm 
            :addOrRmPoiMarkers="slotProps.labelForm.addOrRmPoiMarkers"
            :cur-data-row="curDataRow" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
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
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { ManagerBasemapMarkedTaskListColumns, ExportExpandRowColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelBasemapForm from '@/components/smart/LabelBasemapForm.vue'
import * as basemapManager from '@/models/manager/basemap'
import { BaseMapManagerCaseListI } from '@/models/manager/basemap'
import { PoiI, PoiConfigI } from '@/models/machine/basemap'
import ExpandRow from './ExpandRow.vue'

@Component({
  components: {
    NFilter,
    LabelModal,
    LabelBasemapForm,
    ExpandRow
  }
})
export default class BasemapDetail extends Vue {
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'ID精确匹配'
    },
    poi_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      placeholder: 'Record ID精确匹配',
      style: { width: '150px' }
    },
    BlockID: {
      type: 'input',
      label: '子块编号',
      value: '',
      style: { width: '170px' },
      placeholder: '子块编号精确匹配'
    },
    Type: {
      type: 'input',
      label: '类型',
      value: '',
      style: { width: '150px' },
      placeholder: '0: 新增；1：删除'
    }
  }
  // 表格相关
  loading: boolean = false
  columns = [
    {
      type: 'expand',
      width: 50,
      render: (h: any, params: { row: BaseMapManagerCaseListI }) => {
        const { row } = params
        const { marked_json } = row
        let markedJson = []
        try {
          markedJson = JSON.parse(marked_json || '[]') as any[]
        } catch (error) {
          console.error(error, '解析marked_json失败')
        }
        return h(ExpandRow, {
          props: { markedJson }
        })
      }
    },
    ...ManagerBasemapMarkedTaskListColumns
  ]
  dataSource: BaseMapManagerCaseListI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  hasPrev: boolean = false
  hasNext: boolean = false
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: any[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataRow: BaseMapManagerCaseListI | null = null
  curDataIndex: number = 0
  poiConfig: null | PoiConfigI = null

  get query() {
    const query = this.$route.query
    const { job_id, job_name, city_code } = query
    return {
      job_id: +job_id,
      job_name,
      city_code: +city_code
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get mapPoiType() {
    return this.baseConfig.map_poi_type
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
      const { BlockNo, BlockID, Lat, Lng, Name, SiweiID, DidiID, DispLevel } = this.curDataRow
      this.poiConfig = {
        CityCode: this.query.city_code,
        BlockNo,
        BlockId: BlockID,
        DidiID,
        SiweiID,
        Lat,
        Lng,
        DispLevel: DispLevel.split(',').map((l) => +l),
        PoiName: Name
      }
    }
  }
  async handleOnGetCaseList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const { id, BlockID, Type, poi_diff_record_id } = this.filterOptions
    const res = await basemapManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page,
      per_page: 10,
      marked: 1,
      id: id.value,
      BlockID: BlockID.value,
      Type: Type.value,
      poi_diff_record_id: poi_diff_record_id.value
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list, pages, has_prev, has_next } = res
    this.total = total_num
    this.total_pages = pages
    this.hasPrev = has_prev
    this.hasNext = has_next
    this.dataSource = data_list
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.BlockID.value = ''
    this.filterOptions.Type.value = ''
    this.filterOptions.poi_diff_record_id.value = ''
    this.handleOnGetCaseList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await basemapManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page: 1,
      per_page: this.total,
      marked: 1
    })
    this.exportLoading = false
    if (!res) {
      this.$Message.error('导出失败')
      return
    }
    const { data_list } = res
    // [x, x, [x, x, [x, x, x]]] => [x, x, x, x, x, x, x]
    const data = data_list.flatMap((cur, index) => {
      const { Type, marked_json, DidiID } = cur
      cur.DidiID = `${DidiID.slice(0, 10)}_${DidiID.slice(10)}`
      const type = this.mapPoiType[Type] || Type
      const levels = JSON.parse(marked_json) as Array<{ level: number; pois: PoiI[] }>
      const RC_data: any[] = []
      levels.forEach((ll) => {
        const { level, pois } = ll
        pois.forEach((poi) => {
          poi.DidiID = `${poi.DidiID.slice(0, 10)}_${poi.DidiID.slice(10)}`
          const rc_poi: any = {
            ...cur,
            Type: type,
            RC_level: level
          }
          Object.keys(poi).forEach((k) => {
            const v = (poi as any)[k]
            rc_poi[`RC_${k}`] = k === 'keep' ? (v == 1 ? '保留' : '不保留') : v
          })
          RC_data.push(rc_poi)
        })
      })
      return [
        {
          ...cur,
          Type: type,
          ...(RC_data[0] || {})
        },
        ...RC_data.slice(1)
      ]
    })
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns: [
        ...columns.slice(1, columns.length - 2),
        ...ExportExpandRowColumns,
        ...columns.slice(columns.length - 2, columns.length - 1)
      ],
      quoted: true,
      data
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
  hanleOnSelect(selections: any[]) {
    this.selections = selections
  }
  handleOnViewCase(row: any, index: number) {
    this.showLabelModal = true
    this.curDataRow = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit'
    params: Array<{
      level: number,
      pois: PoiI[]
    }>
  }) {
    if (!this.curDataRow) {
      return
    }
    const { type, params } = payload
    const { id, mark_job_id } = this.curDataRow
    this.submitLoading = true
    const { marked, msg } = await basemapManager.markJob({ id, job_id: mark_job_id, marked_json: JSON.stringify(params) })
    this.submitLoading = false
    if (marked) {
      this.$Message.success('标注成功')
      this.handleOnPreOrNext(true, { isReduce: false, refresh: true })
    } else {
      this.$Message.success(`标注失败：${msg}`)
    }
  }
  async handleOnPreOrNext(isNext: boolean, options?: { isReduce?: boolean, refresh?: boolean }) {
    const { handleOnGetCaseList } = this
    const { isReduce, refresh } = options || { isReduce: false, refresh: false }
    if (isNext) {
      if (isReduce) {
        if (this.hasNext) {
          await handleOnGetCaseList(this.cur_page_num)
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          if (this.dataSource.length > 1) {
            await handleOnGetCaseList(this.cur_page_num)
            if (this.curDataIndex > this.dataSource.length - 1) {
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRow = this.dataSource[this.curDataIndex]
            } else {
              this.curDataRow = this.dataSource[this.curDataIndex]
            }
          } else {
            if (this.hasPrev) {
              this.cur_page_num--
              await handleOnGetCaseList(this.cur_page_num)
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRow = this.dataSource[this.curDataIndex]
            } else {
              await handleOnGetCaseList(this.cur_page_num)
              this.showLabelModal = false
              this.curDataRow = null
            }
          }
        }
      } else {
        if (this.curDataIndex === this.dataSource.length - 1) {
          if (this.hasNext) {
            this.cur_page_num++
            await handleOnGetCaseList(this.cur_page_num)
            this.curDataIndex = 0
            this.curDataRow = this.dataSource[0]
          } else {
            this.$Message.warning('已经是最后一个')
          }
        } else {
          refresh && await handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex++
          this.curDataRow = this.dataSource[this.curDataIndex]
        }
      }
    } else {
      if (this.curDataIndex > 0) {
        this.curDataIndex--
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        if (this.hasPrev) {
          this.cur_page_num--
          await handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  mounted() {
    this.handleOnGetCaseList(1)
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

