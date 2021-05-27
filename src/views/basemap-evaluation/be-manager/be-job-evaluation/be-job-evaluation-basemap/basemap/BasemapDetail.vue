<template>
  <div class="task-evaluation-detail">
    <div class="info-wrapper">
      评测名称: {{ query.job_name }}, 评测类型: <Tag color="purple">{{ '评测' }}</Tag>
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
        <template slot-scope="{ row, index }" slot="poi_type">
          <span>{{ mapPoiType[row.Type] || row.Type }}</span>
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
    <BasemapRecord 
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
      <LabelModal :visible="showLabelModal" :poi-config="poiConfig" :hasPano="false">
        <template v-slot:label-form="slotProps">
          <LabelBasemapForm 
            :addOrRmPoiMarkers="slotProps.labelForm.addOrRmPoiMarkers"
            :cur-data-row="curDataRowForLabel" 
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
import { EvaluationBasemapCaselListColumns } from './columns'
import { parseToMapObj, parseToValueConfigArr } from '@/utils'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import BasemapRecord from './BasemapRecord.vue'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelBasemapForm from '@/components/smart/LabelBasemapForm.vue'
import * as basemapManager from '@/models/manager/basemap'
import { BaseMapEvaluationCaseListI } from '@/models/manager/basemap'
import { PoiI, PoiConfigI } from '@/models/machine/basemap';

@Component({ components: { BasemapRecord, LabelModal, LabelBasemapForm } })
export default class BasemapDetail extends Vue {
  columns = EvaluationBasemapCaselListColumns
  dataSource: BaseMapEvaluationCaseListI[] = []
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
  curDataRowForLabel: BaseMapEvaluationCaseListI | null = null
  curDataRowForRecord: BaseMapEvaluationCaseListI | null = null
  curDataIndex: number = 0
  poiConfig: null | PoiConfigI = null

  // get
  get tabs() {
    const status = this.job_mark_status
    const match = parseToMapObj(status)
    let tabs = parseToValueConfigArr(match)
    tabs = [tabs[tabs.length - 1], ...tabs.slice(0, tabs.length - 1)].slice(0, 3)
    return tabs
  }
  get matchTabs() {
    return parseToMapObj(this.tabs)
  }
  get mapPoiType() {
    return this.baseConfig.map_poi_type
  }
  get query() {
    const query = this.$route.query
    const { job_id, job_name, city_code } = query
    return {
      job_id: +job_id,
      job_name,
      city_code: +city_code
    }
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get job_mark_status() {
    return this.baseConfig.job_mark_status
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
  @Watch('curDataRowForLabel', { deep: true })
  onCurDataRowChanged() {
    if (this.curDataRowForLabel) {
      const { BlockNo, BlockID, Lat, Lng, Name, SiweiID, DidiID, DispLevel } = this.curDataRowForLabel
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

  // methods
  async handleOnGetCaseList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const res = await basemapManager.getPaJobCaseList(this.query.job_id, {
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
  handleOnViewMarkRecord(row: BaseMapEvaluationCaseListI) {
    this.showRecordModal = true
    this.curDataRowForRecord = row
  }
  handleOnLabel(row: BaseMapEvaluationCaseListI, index: number) {
    this.showLabelModal = true
    this.curDataRowForLabel = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit'
    params: Array<{
      level: number,
      pois: PoiI[]
    }>
  }) {
    if (!this.curDataRowForLabel) {
      return
    }
    const { type, params } = payload
    const { id, mark_job_id } = this.curDataRowForLabel
    this.submitLoading = true
    const { marked, msg } = await basemapManager.markJob({ id, job_id: mark_job_id, marked_json: JSON.stringify(params) })
    this.submitLoading = false
    if (marked) {
      this.$Message.success('标注成功')
      // isReduce: 是否标注完的case会从本页删除
      this.handleOnPreOrNext(true, { isReduce: this.statusType === '0', refresh: true })
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
