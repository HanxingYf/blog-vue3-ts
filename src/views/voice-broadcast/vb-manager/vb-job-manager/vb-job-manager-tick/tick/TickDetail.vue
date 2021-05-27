<template>
  <div class="task-manager-detail">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="getTickMarkedList(1)" 
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
        size="small">
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
          @on-change="getTickMarkedList" 
          show-total 
          show-elevator/>
      </div>
    </div>
    <Modal v-model="showLabelModal" footer-hide width="98" class-name="vertical-center-modal" @on-cancel="showLabelModal = false">
      <LabelModal :visible="showLabelModal" :geojsons="geojsons" :marks="marks" :layer-items="layerItems">
        <template slot="label-form">
          <LabelTickForm 
            :cur-data-row="curDataRow && curDataRow.extra" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :blind="false"
            :is-mark-job="true"
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
import { ManagerTickMarkedListColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { getManagerTickNormalMarkedList, ManagerTickNormalMarkedListI, evaluationTask } from '@/presenter/manager.pre'
import { ValueConfig } from '@/types';
import { ManagerTickTaskMarkedListRowI } from './types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelTickForm from '@/components/smart/LabelTickForm.vue'
import { LayerItemsI } from 'src/views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-tick/tick/types'

@Component({
  components: {
    NFilter,
    LabelModal,
    LabelTickForm
  }
})
export default class TickDetail extends Vue {
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    voice_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'Record ID精确匹配'
    },
    tag: {
      type: 'select-multi',
      label: '播报体验',
      value: [],
      options: this.voice_tag,
      style: { width: '170px' }
    },
    issue_type: {
      type: 'select',
      label: '问题类型',
      value: '',
      options: this.voice_issue_type1,
      style: { width: '100px' }
    },
    issue_sub_type: {
      type: 'select',
      label: '细分类',
      value: '',
      options: [],
      style: { width: '100px' }
    }
  }
  // 表格相关
  loading: boolean = false
  columns = ManagerTickMarkedListColumns
  dataSource: ManagerTickTaskMarkedListRowI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  submitLoading: boolean = false
  showLabelModal: boolean = false
  curDataRow: ManagerTickTaskMarkedListRowI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']
  layerItems: LayerItemsI | null = null

  get query() {
    const query = this.$route.query
    const { job_id, job_name, voice_tag, issue_type } = query
    return {
      job_id: +job_id,
      job_name,
      voice_tag: voice_tag ? voice_tag as string : '',
      issue_type: issue_type ? +issue_type : ''
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get voice_tag() {
    return this.baseConfig.voice_tag
  }
  get voice_issue_type1() {
    return this.baseConfig.voice_issue_type1
  }
  get voice_issue_type2() {
    return this.baseConfig.voice_issue_type2
  }
  get voice_issue_road_type() {
    return this.baseConfig.voice_issue_road_type
  }
  get voice_issue_strategy_type() {
    return this.baseConfig.voice_issue_strategy_type
  }
  get cross_type() {
    return this.baseConfig.cross_type
  }
  get issue_type() {
    return this.baseConfig.issue_type
  }
  get matchPathConsis() {
    return this.parseToMapObj(this.baseConfig.path_consis)
  }
  get matchCrossType() {
    return this.parseToMapObj(this.cross_type)
  }
  get matchVoiceTag() {
    return this.parseToMapObj(this.voice_tag)
  }
  get matchVoiceIssueType1() {
    return this.parseToMapObj(this.voice_issue_type1)
  }
  get matchVoiceIssueType2() {
    return this.parseToMapObj(this.voice_issue_type2)
  }
  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }

  @Watch('filterOptions.issue_type.value')
  onChange(val: number) {
    this.filterOptions.issue_sub_type.value = ''
    this.filterOptions.issue_sub_type.options = val == 1 ?
      this.voice_issue_road_type : this.voice_issue_strategy_type
  }
  @Watch('curDataRow')
  onCurDataRowChanged() {
    if (this.curDataRow) {
      const { extra } = this.curDataRow
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

  parseToMapObj(configs: ValueConfig[]) {
    const mapObj: { [propName: string]: string } = {}
    configs.forEach((c) => {
      mapObj[c.value] = c.label
    })
    return mapObj
  }
  async getTickMarkedList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const { voice_diff_record_id, tag, issue_type, issue_sub_type } = this.filterOptions
    const res = await getManagerTickNormalMarkedList({
      job_id: this.query.job_id,
      page,
      per_page: 10,
      marked: 1,
      ...(voice_diff_record_id.value ? { voice_diff_record_id: voice_diff_record_id.value } : {}),
      ...(tag.value && tag.value.length ? { tag: tag.value.join(',') } : {}),
      ...(issue_type.value ? { issue_type: issue_type.value } : {}),
      ...(issue_sub_type.value ? { issue_sub_type: issue_sub_type.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list, pages } = res
    this.total = total_num
    this.total_pages = pages
    this.dataSource = this.parseDataSource(data_list)
  }
  parseDataSource(data: ManagerTickNormalMarkedListI[]): ManagerTickTaskMarkedListRowI[] {
    return data.map((item) => {
      const {
        id, voice_diff_record_id, mark_job_id, update_time, path_consis,
        tag, cross_type, weight, start_turning_dis, end_turning_dis,
        geojson_didi, geojson_rival, custom_mark, turning_dis, div_turning_dis,
        auto_move, last_operator, issue_type1, issue_type2, timing, check_timing,
        main_assi_end_coor, didi_tts, rival_tts, hot, status, didi_act_start_coor,
        didi_code_fix_coor, didi_act_end_coor, didi_code_coor, traj_geojson,
        rival_act_start_coor, rival_act_end_coor, rival_code_coor, turning_coor,
        cross_sub_type
      } = item
      return {
        id,
        mark_job_id,
        voice_diff_record_id, // caseID
        update_time, // 评测时间
        path_consis: this.matchPathConsis[path_consis], // 路线是否一致
        cross_type: this.matchCrossType[cross_type], // 路口类型
        weight, // 路段道路等级
        start_turning_dis, // 起始至转向点距
        end_turning_dis, // 结束至转向点距
        turning_dis, // 转向点偏差
        div_turning_dis, // 分歧至转向点距
        tag: this.matchVoiceTag[tag], // 播报体验
        custom_mark, // 备注
        issue_type1: this.matchVoiceIssueType1[issue_type1], // 问题类型
        issue_type2: this.matchVoiceIssueType2[issue_type2], // 细分类
        last_operator, // 最后操作人
        // 以下不展示在表格内
        main_assi_end_coor, // 主辅结束点
        didi_tts, // 滴滴播报
        rival_tts, // 竞品播报
        hot, // 热度
        status, // 任务状态
        geojson_didi, // 滴滴geojson
        geojson_rival, // 竞品geojson
        didi_act_start_coor, // didi开始播报点
        didi_code_fix_coor, // didi开始播报点（改）
        didi_act_end_coor, // didi结束播报点
        didi_code_coor, // didi路网分歧点
        traj_geojson, // 轨迹点
        rival_act_start_coor, // 竞品开始播报点
        rival_act_end_coor, // 竞品结束播报点
        rival_code_coor, // 竞品路网分歧点
        turning_coor, // 路口转向点坐标
        auto_move, // 是否流转
        cross_sub_type, // 二级分类
        extra: item
      }
    })
  }
  handleOnReset() {
    this.filterOptions.voice_diff_record_id.value = ''
    this.filterOptions.tag.value = ''
    this.filterOptions.issue_type.value = ''
    this.filterOptions.issue_sub_type.value = ''
    this.getTickMarkedList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await getManagerTickNormalMarkedList({
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
    const data = this.parseDataSource(data_list)
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: data.map((item: ManagerTickTaskMarkedListRowI) => {
        const { extra } = item
        delete item.extra
        return item
      })
    })
  }
  handleOnViewCase(row: ManagerTickTaskMarkedListRowI, index: number) {
    this.showLabelModal = true
    this.curDataRow = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit' | 'accept' | 'reject' // 已标注任务只有submit
    params: { [propName: string]: string | number }
  }) {
    if (!this.curDataRow) {
      return
    }
    const { type, params } = payload
    this.submitLoading = true
    const { extra } = this.curDataRow
    const { id, mark_job_id } = extra
    const { isDone, msg } = await evaluationTask(id, mark_job_id, 'tick', params)
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
          await this.getTickMarkedList(this.cur_page_num)
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
          await this.getTickMarkedList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  mounted() {
    const { voice_tag, issue_type } = this.query
    this.filterOptions.tag.value = voice_tag && voice_tag.split(',').map((s) => +s)
    this.filterOptions.issue_type.value = issue_type
    this.getTickMarkedList(1)
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

