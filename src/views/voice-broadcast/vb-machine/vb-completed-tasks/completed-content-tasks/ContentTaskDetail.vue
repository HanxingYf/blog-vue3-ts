<template>
  <Layout class="task-detail">
    <template v-if="nc_task_load">
      <div class="task-name">任务名称：{{ query.task_name }}</div>
      <NFilter 
        :configs="filterOptions" 
        @on-submit="pullTaskList(1)" 
        :loading="loading" 
        @on-cancel="handleOnReset"
      />
      <!-- 高级筛选 -->
      <HighFilterRule @onSendCustomFilterVal="onSendCustomFilterVal" type="code" />
      <div class="table-wrapper">
        <div class="table-search task-table-search">
          <div class="numbers">
            命中数量：{{ total }}； 总量：{{ query.task_num }}； 占比：{{ `${((total / query.task_num) * 100).toFixed(2)}%` }}
          </div>
          <div>
            <span style="font-size: 12px">回归服务: </span>
            <Select v-model="return_service" style="width: 120px;text-align: left">
              <Option
                v-for="item in navi_api"
                v-bind:key="item.value"
                :value="item.value"
              >{{ item.label }}</Option>
            </Select>
          </div>
        </div>
        <Table
          :loading="loading" 
          :columns="columns"
          :data="dataSource" 
          size="small"
          border>
          <template slot-scope="{ row, index }" slot="action">
            <Button size="small" style="font-size: 12px;" type="info" :disabled="curIndex === index" @click="handleOnViewCase(row, index)">在地图中查看</Button>&nbsp;
            <Button size="small" style="font-size: 12px;" @click.stop="navigateToApply(row)">去Apply查看</Button>
          </template>
        </Table>
        <div class="table-page">
          <Page 
            :total="total" 
            @on-change="pullTaskList" 
            show-total
            :current.sync="cur_page_num"
            show-elevator/>
        </div>
      </div>
      <div class="action-btns">
        <ButtonGroup>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(false)" :disabled="disabledPrev">
              <Icon type="ios-arrow-back" />
              上一个
          </Button>
          <Button type="primary">{{ dataSource[curIndex] && dataSource[curIndex].id }}</Button>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(true)" :disabled="disabledNext">
              下一个
              <Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
      <div class="map-wrapper">
        <PreviewWithMap :geojsons="geojsons" />
      </div>
    </template>
    <template v-else>
      <div class="no-permission">
        无此页面权限
      </div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { contentTaskDetailColumns } from './columns'
import PreviewWithMap from '@/components/smart/PreviewWithMap.vue'
import HighFilterRule from '@/components/smart/HighFilterRule.vue'
import { getContentAndHotCodeTaskDetail, ContentAndHotCodeTaskDetailListResI } from '@/presenter/machine.pre'
import { ContentTaskDetailRowI, ContentTaskRowI } from './types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: { NFilter, HighFilterRule, PreviewWithMap }
})
export default class ContentTaskDetail extends Vue {
  return_service: string = '100.70.178.24:9088'
  // 表格相关
  columns = contentTaskDetailColumns
  dataSource: ContentTaskDetailRowI[] = []
  cur_page_num: number = 1 // 当前页
  num_per_page: number = 10 // 每页数量
  total_pages: number = 0 // 总页数
  total: number = 0 // 筛选得到的总数量
  loading: boolean = false

  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    tag: {
      type: 'select',
      label: '对比结果筛选',
      value: [],
      options: this.machine_tag,
      style: { width: '150px' }
    },
    code_family: {
      type: 'select',
      label: 'Code筛选',
      value: '',
      options: this.code_list,
      style: { width: '150px' }
    },
    didi_code: {
      type: 'input',
      label: '滴滴Code',
      value: '',
      placeholder: '滴滴code模糊匹配',
      style: { width: '150px' }
    },
    rival_code: {
      type: 'input',
      label: '竞品Code',
      value: '',
      placeholder: '竞品code模糊匹配',
      style: { width: '150px' }
    }
  }
  customFilter: string = ''

  geojsons: string[] = ['', '']
  curIndex: number = -1

  get query() {
    const query = this.$route.query
    const { task_id, task_name, task_num } = query
    return {
      task_id: +task_id,
      task_name,
      task_num: +task_num
    }
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get navi_api() {
    return this.baseConfig.navi_api
  }
  get code_match() {
    return this.baseConfig.code_match
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
  }
  get machine_tag() {
    return this.baseConfig.machine_tag
  }
  get code_list() {
    return this.baseConfig.code_list
  }
  get disabledPrev() {
    // 处于第一页且第一个 或 初始状态下
    return (this.cur_page_num === 1 && this.curIndex === 0) || this.curIndex === -1 || !this.dataSource.length
  }
  get disabledNext() {
    // 处于最后一页最后一个
    return this.cur_page_num === this.total_pages && this.curIndex === this.dataSource.length - 1 || !this.dataSource.length
  }

  async pullTaskList(page: number, resetView: boolean = true) {
    if (!this.nc_task_load) {
      this.$Message.warning('你无权限')
      return
    }
    if (resetView) {
      this.resetMapView()
    }
    const { tag, code_family, didi_code, rival_code } = this.filterOptions
    this.cur_page_num = page
    this.loading = true
    const { task_id } = this.query
    const res = await getContentAndHotCodeTaskDetail({
      id: task_id,
      page,
      per_page: 10,
      ...(`${tag.value}` ? { tag: tag.value } : {}),
      ...(`${code_family.value}` ? { code_family: code_family.value } : {}),
      ...(`${didi_code.value}` ? { didi_code: didi_code.value } : {}),
      ...(`${rival_code.value}` ? { rival_code: rival_code.value } : {}),
      ...(`${this.customFilter}` ? { custom_filter: this.customFilter } : {})
    })
    this.loading = false
    if (!res) {
      return
    }
    const { cur_page_num, total_num, pages, code_diff_records } = res
    this.total = total_num
    this.cur_page_num = cur_page_num
    this.total_pages = pages
    this.dataSource = this.parseDataSource(code_diff_records)
  }
  parseDataSource(data: ContentAndHotCodeTaskDetailListResI[]): ContentTaskDetailRowI[] {
    return data.map((item) => {
      const {
        id, link_list, tag, didi_code, rival_code, hot,
        didi_assist1, didi_assist2, rival_assist1, rival_assist2
      } = item
      return {
        id,
        link_list,
        result_of_comparison: tag,
        didi_broadcast: didi_code,
        competitive_broadcast: rival_code,
        didi_assist1,
        didi_assist2,
        rival_assist1,
        rival_assist2,
        heat: `${hot}`,
        extra: item
      }
    })
  }
  handleOnReset() {
    this.filterOptions.tag.value = ''
    this.filterOptions.code_family.value = ''
    this.filterOptions.didi_code.value = ''
    this.filterOptions.rival_code.value = ''
    this.pullTaskList(1)
  }
  resetMapView() {
    this.geojsons = ['', '']
    this.curIndex = -1
  }
  handleOnViewCase(row: ContentTaskDetailRowI, index: number) {
    if (!row) {
      return
    }
    this.curIndex = index
    const { extra } = row
    const { geojson_didi, geojson_rival } = extra
    this.geojsons = [geojson_didi, geojson_rival]
  }
  async onPrevOrNext(isNext: boolean) {
    if (isNext) {
      if (this.curIndex === this.dataSource.length - 1) {
        this.cur_page_num = this.cur_page_num + 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = 0
      } else {
        this.curIndex = this.curIndex + 1
      }
    } else {
      if (this.cur_page_num !== 1 && this.curIndex === 0) {
        this.cur_page_num = this.cur_page_num - 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = this.dataSource.length - 1
      } else {
        this.curIndex = this.curIndex - 1
      }
    }
    this.handleOnViewCase(this.dataSource[this.curIndex], this.curIndex)
  }
  navigateToApply(row: ContentTaskDetailRowI) {
    const { extra } = row
    const { geojson_didi, geojson_rival, link_list } = extra
    const geojson =  geojson_rival || geojson_didi
    if (!geojson) {
      this.$Message.warning('无geojson!')
      return
    }
    const { return_service } = this
    const { src, dst } = this.computeSrcDst(geojson)
    const json = JSON.stringify({
      linkids: link_list,
      host: return_service,
      src,
      dst
    })
    if (!src || !dst) {
      this.$Message.warning('无效起终点，无法跳转')
      return
    }
    const href = `http://10.89.110.12:8055/apply?json=${json}#/`
    window.open(href, '_blank')
  }
  computeSrcDst(geojson: string) {
    const { features } = JSON.parse(geojson)
    let src = ''
    let dst = ''
    features.forEach((f: any) => {
      const { name } = f.properties
      let { geo } = f.properties
      geo = geo && geo.split(';')
      if (name === 'inLink0') {
        src = geo && geo[0]
      }
      if (name === 'outLink') {
        dst = geo && geo[geo.length - 1]
      }
    })
    return {
      src,
      dst
    }
  }
  onSendCustomFilterVal(val: string) {
    this.customFilter = val
  }
  // hooks
  mounted() {
    this.pullTaskList(1)
  }
}
</script>

<style lang="less" scoped>
.task-table-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .numbers {
    font-size: 12px;
  }
}
.action-btns {
  margin-bottom: 20px;
}
.map-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 100px;
  height: 500px;
}
</style>
