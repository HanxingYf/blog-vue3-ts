<template>
  <div class="task-manager-detail">
    <NFilter
      :configs="filterOptions"
      @on-cancel="handleOnReset"
      @on-submit="getContentAndTickMarkedList(1)"
      :loading="loading"
    />
    <div class="table-wrapper">
      <div class="info">评测名称：{{ query.job_name }}</div>
      <Table
        :columns="columns"
        :data="dataSource"
        border
        ref="table"
        :loading="loading"
        size="small"
      >
        <template slot-scope="{ row, index }" slot="content_tag">
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
          <p>{{ row.create_time.split(" ")[0] }}</p>
          <p>{{ row.create_time.split(" ")[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button
            size="small"
            type="primary"
            @click="handleOnViewCase(row, index)"
            >查看</Button
          >
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData"
          >导出CSV</Button
        >&nbsp;
      </div>
      <div class="page-wrapper">
        <Page
          :total="total"
          :current="cur_page_num"
          @on-change="getContentAndTickMarkedList"
          show-total
          show-elevator
        />
      </div>
    </div>
    <Modal
      v-model="showLabelModal"
      footer-hide
      width="98"
      class-name="vertical-center-modal"
      @on-cancel="showLabelModal = false"
    >
      <LabelModal
        :visible="showLabelModal"
        :geojsons="geojsons"
        :marks="marks"
        :esiweiMapDir="esiweiMapDir"
        :layerItemsForContentAndTick="layerItemsForContentAndTick"
      >
        <template slot="label-form">
          <LabelContentAndTickForm
            :cur-data-row="curDataRowForLabel"
            :loading="submitLoading"
            :disabled-prev-next="disabledPrevNext"
            :blind="query.blind"
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
import { State } from 'vuex-class'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { ManagerContentAndTickMarkedTaskListColumns } from './columns'
import { ManagerContentAndTickNormalMarkedRowI } from './type'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { getManagerContentAndTickNormalMarkedList, ManagerContentAndTickNormalMarkedListI, evaluationTask, evaluationContentAndTickTask, acceptOrRejectContentAndTickTask } from '@/presenter/manager.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types'
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelCodeDiffForm from '@/components/smart/LabelCodeDiffForm.vue'
import CodeDiffIndicator from '@/components/smart/CodeDiffIndicator.vue'
import { pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { getEsiweiMapDir } from '@/utils';
import LabelContentAndTickForm from '@/components/smart/LabelContentAndTickForm.vue'
import { ContentAndTickLayerItemsI } from '../../../vb-job-evaluation/vb-job-evaluation-tick/tick/types'


@Component({
  components: {
    NFilter,
    LabelModal,
    LabelContentAndTickForm,
    CodeDiffIndicator
  }
})
export default class ContentAndTickDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    jenkins_diff_record_id: {
      type: 'input',
      label: 'CaseID',
      value: '',
      placeholder: 'CaseID精确匹配'
    },
    content_tag: {
      type: 'select',
      label: '播报内容评价',
      value: '',
      options: this.jenkins_content_tag
    },
    pos_tag: {
      type: 'select',
      label: '播报时机评价',
      value: '',
      options: this.jenkins_pos_tag
    },
  }
  // 表格相关
  columns = ManagerContentAndTickMarkedTaskListColumns
  loading: boolean = false
  dataSource: ManagerContentAndTickNormalMarkedRowI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  dispatch_type: number = 0 // 全部|评测|质检

  hasPrev: boolean = false
  hasNext: boolean = false
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: ManagerContentAndTickNormalMarkedRowI[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataIndex: number = 0
  geojsons: string[] = ['', '']
  marks: string[] = ['', '']
  esiweiMapDir: { [propName: string]: number } | null = null
  curDataRowForLabel: ManagerContentAndTickNormalMarkedRowI | null = null
  statusType: string = '-1'
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get jenkins_pos_tag() {
    return this.baseConfig.jenkins_pos_tag
  }
  get jenkins_pos_tag_match() {
    return this.parseToMapObj(this.jenkins_pos_tag)
  }
  get jenkins_content_tag() {
    return this.baseConfig.jenkins_content_tag
  }
  get jenkinsContentTagMatch() {
    return this.parseToMapObj(this.jenkins_content_tag)
  }
  get job_type() {
    return this.baseConfig.job_type
  }
  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }
  get layerItemsForContentAndTick(): ContentAndTickLayerItemsI | null {
    if (!this.curDataRowForLabel) {
      return null
    }
    const { new_json, original_json } = this.curDataRowForLabel
    return {
      original_json,
      new_json
    }
  }

  @Watch('dispatch_type')
  onJobTypeChanged(val: number) {
    this.getContentAndTickMarkedList(this.cur_page_num)
    window.localStorage.setItem('content_and_tick_select_job_type', `${val}`)
  }

  @Watch('curDataRowForLabel')
  async onCurDataRowChanged() {
    if (this.curDataRowForLabel) {
      const { original_geojson, new_geojson, original_tts, new_tts, new_links, original_links, map_version } = this.curDataRowForLabel
      this.marks = [original_tts, new_tts]
      this.geojsons = [original_geojson, new_geojson]
      // console.log(this.geojsons, '-----');
    }
  }
  get query() {
    const query = this.$route.query
    const { job_id, job_name, blind, content_tag, pos_tag, issue_type, path_consis } = query
    return {
      job_id: +job_id,
      job_name,
      blind: blind ? !!+blind : false,
      content_tag: content_tag as string || '',
      pos_tag: pos_tag as string || '',
      issue_type: issue_type ? +issue_type : '',
      path_consis: path_consis ? +path_consis : ''
    }
  }
  parseToMapObj(configs: ValueConfig[]) {
    const mapObj: { [propName: string]: string } = {}
    configs.forEach((c) => {
      mapObj[c.value] = c.label
    })
    return mapObj
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
    const { isDone, msg } = type === 'submit' ? await evaluationContentAndTickTask(id, mark_job_id, params) :
      await acceptOrRejectContentAndTickTask(id, mark_job_id, type === 'accept', params)
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
    const { getContentAndTickMarkedList } = this
    const { isReduce, refresh } = options || { isReduce: false, refresh: false }
    if (isNext) {
      if (isReduce) {
        if (this.hasNext) {
          await getContentAndTickMarkedList(this.cur_page_num)
          this.curDataRowForLabel = this.dataSource[this.curDataIndex]
        } else {
          if (this.dataSource.length > 1) {
            await getContentAndTickMarkedList(this.cur_page_num)
            if (this.curDataIndex > this.dataSource.length - 1) {
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            } else {
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            }
          } else {
            if (this.hasPrev) {
              this.cur_page_num--
              await getContentAndTickMarkedList(this.cur_page_num)
              this.curDataIndex = this.dataSource.length - 1
              this.curDataRowForLabel = this.dataSource[this.curDataIndex]
            } else {
              await getContentAndTickMarkedList(this.cur_page_num)
              this.showLabelModal = false
              this.curDataRowForLabel = null
            }
          }
        }
      } else {
        if (this.curDataIndex === this.dataSource.length - 1) {
          if (this.hasNext) {
            this.cur_page_num++
            await getContentAndTickMarkedList(this.cur_page_num)
            this.curDataIndex = 0
            this.curDataRowForLabel = this.dataSource[0]
          } else {
            this.$Message.warning('已经是最后一个')
          }
        } else {
          refresh && await getContentAndTickMarkedList(this.cur_page_num)
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
          await getContentAndTickMarkedList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRowForLabel = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }

  async getContentAndTickMarkedList(page: number) {
    // console.log(this.curDataRowForLabel?.mark_job_id,'--=-=');
    this.cur_page_num = page
    this.loading = true
    const { jenkins_diff_record_id, content_tag, pos_tag } = this.filterOptions
    const res = await getManagerContentAndTickNormalMarkedList({
      page,
      per_page: 10,
      marked: 1,
      job_id: this.query.job_id,
      desc: false,
      ...(jenkins_diff_record_id.value ? { jenkins_diff_record_id: jenkins_diff_record_id.value } : {}),
      ...(content_tag.value ? { content_tag: content_tag.value } : {}),
      ...(pos_tag.value ? { pos_tag: pos_tag.value } : {}),
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    // console.log(res, '+++');
    const { total_num, data_list, pages, has_next, has_prev } = res
    this.total = total_num
    this.total_pages = pages
    this.hasPrev = has_prev
    this.hasNext = has_next
    this.dataSource = this.parseDataSource(data_list)
    // console.log(this.dataSource, 'aaa');

  }
  parseDataSource(data: ManagerContentAndTickNormalMarkedListI[]): ManagerContentAndTickNormalMarkedRowI[] {
    return data.map((item) => {
      const {
        id,
        mark_job_id,
        jenkins_diff_record_id,
        mark_job_dispatch_id,
        mark_job_verify_id,
        create_time,
        update_time,
        last_operator,
        content_tag,
        content_err_type,
        content_err_reason,
        pos_tag,
        pos_err_type,
        pos_err_reason,
        original_json,
        new_json,
        original_links,
        new_links,
        map_version,
        original_tts,
        new_tts,
        original_geojson,
        new_geojson
      } = item
      return {
        id,
        mark_job_id,
        jenkins_diff_record_id,
        mark_job_dispatch_id,
        mark_job_verify_id,
        create_time,
        update_time,
        last_operator,
        content_tag: this.jenkinsContentTagMatch[content_tag],
        content_err_type,
        content_err_reason,
        pos_tag: this.jenkins_pos_tag_match[pos_tag],
        pos_err_type,
        pos_err_reason,
        original_json,
        new_json,
        original_links,
        new_links,
        map_version,
        original_tts,
        new_tts,
        original_geojson,
        new_geojson
      }
    })
  }
  handleOnReset() {
    this.filterOptions.jenkins_diff_record_id.value = ''
    this.filterOptions.content_tag.value = ''
    this.filterOptions.pos_tag.value = ''
    this.getContentAndTickMarkedList(1)
  }

  handleOnViewCase(row: ManagerContentAndTickNormalMarkedRowI, index: number) {
    this.showLabelModal = true
    this.curDataRowForLabel = row
    this.curDataIndex = index
  }

  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await getManagerContentAndTickNormalMarkedList({
      page: 1,
      per_page: this.total,
      marked: 1,
      job_id: this.query.job_id,
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
      columns: columns.slice(0, columns.length - 1),
      quoted: true,
      data
    })
  }
  mounted() {
    this.filterOptions.content_tag.value = this.query.content_tag ? +this.query.content_tag : []
    this.filterOptions.pos_tag.value = this.query.pos_tag ? +this.query.pos_tag : []
    this.getContentAndTickMarkedList(1)
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

