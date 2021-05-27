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
            :current="cur_page_num"
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
import { TickTaskDetailColumns } from './columns'
import PreviewWithMap from '@/components/smart/PreviewWithMap.vue'
import { GetMapT } from '@/components/dumb/types'
import { TickTaskDetailRowI } from './types'
import { SelectItem, Columns } from '@/types'
import { getTickTaskDetail, TickTaskDetailListResI } from '@/presenter/machine.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'

@Component({ components: { NFilter, PreviewWithMap } })
export default class TickTaskDetail extends Vue {
  return_service: string = '100.70.178.24:9088'
  // 表格相关
  columns: Columns[] = TickTaskDetailColumns
  dataSource: TickTaskDetailRowI[] = []
  cur_page_num: number = 1 // 当前页
  total_pages: number = 0 // 总页数
  total: number = 0 // 筛选得到的总数量
  loading: boolean = false

  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'id精确匹配'
    },
    hot: {
      type: 'input',
      label: '热度',
      value: '',
      placeholder: '热度精确匹配'
    },
    code_dis: {
      type: 'input-range',
      label: 'Code点距离差',
      value: '',
      value2: '',
      style: { width: '50px' }
    },
    didi_surplus: {
      type: 'input-range',
      label: '滴滴结束点code距离',
      value: '',
      value2: '',
      style: { width: '50px' }
    }
  }
  // 地图部分
  geojsons: string[] = ['']
  curIndex: number = -1

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get query() {
    const query = this.$route.query
    const { task_id, task_name, task_num } = query
    return {
      task_id: +task_id,
      task_name,
      task_num: +task_num
    }
  }
  get navi_api() {
    return this.baseConfig.navi_api
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
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
      this.$Message.warning('暂无权限')
      return
    }
    if (resetView) {
      this.resetMapView()
    }
    this.cur_page_num = page
    this.loading = true
    const { id, hot, code_dis, didi_surplus } = this.filterOptions
    const res = await getTickTaskDetail({
      task_id: this.query.task_id,
      page,
      per_page: 10,
      order_col: 'hot',
      desc: true,
      ...(id.value ? { id: id.value } : {}),
      ...(hot.value ? { id: hot.value } : {}),
      ...(code_dis.value ? { code_dis_min: code_dis.value } : {}),
      ...(code_dis.value ? { code_dis_max: code_dis.value2 } : {}),
      ...(didi_surplus.value ? { didi_surplus_min: didi_surplus.value } : {}),
      ...(didi_surplus.value ? { didi_surplus_max: didi_surplus.value2 } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { data_list, total_num, pages } = res
    this.total = total_num
    this.total_pages = pages
    this.dataSource = this.parseDataSource(data_list)
  }
  parseDataSource(data: TickTaskDetailListResI[]): TickTaskDetailRowI[] {
    return data.map((item) => {
      const {
        id, link_list, didi_tts, rival_tts, delta_act_start_dis, delta_act_end_dis,
        code_dis, didi_surplus, rival_surplus, hot
      } = item
      return {
        id,
        link_list,
        didi_code: didi_tts,
        rival_code: rival_tts,
        delta_act_start_dis,
        delta_act_end_dis,
        code_dis,
        didi_surplus,
        rival_surplus,
        hot,
        extra: item
      }
    })
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.hot.value = ''
    this.filterOptions.code_dis.value = ''
    this.filterOptions.code_dis.value2 = ''
    this.filterOptions.didi_surplus.value = ''
    this.filterOptions.didi_surplus.value2 = ''
    this.pullTaskList(1)
  }
  resetMapView() {
    this.geojsons = ['']
    this.curIndex = -1
  }
  handleOnViewCase(row: TickTaskDetailRowI, index: number) {
    if (!row) {
      return
    }
    this.curIndex = index
    const { extra } = row
    const { geojson_didi } = extra
    this.geojsons = [geojson_didi]
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
  navigateToApply(row: any) {
    const { extra } = row
    const { geojson_didi, geojson_rival, link_list } = extra
    const geojson =  geojson_rival || geojson_didi
    if (!geojson) {
      this.$Message.warning('无geojson')
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
      this.$Message.warning('无效起终点')
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
.input-intern{
  width: 20px;
  text-align: center;
}
</style>
