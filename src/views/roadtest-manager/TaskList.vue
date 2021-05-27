<template>
  <div class='task-list'>
    <NaviTitle :navi-title="[{ name: '路测任务列表'}]" />
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnPullTaskList(1)" 
      :tableLoading="tableLoading" 
      submit-text="查询"
      @on-cancel="hadnelOnReset"
    />
    <div class="btn-wrapper">
      <Button type="primary" @click="handleOnOpenEditModal(null)">新增路测任务</Button>
    </div>
    <div class="table-wrapper">
      <Table 
        :loading="tableLoading"
        :columns="columns"
        :data="dataSource"
        size="small"
        border>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button style="font-size: 12px;" size="small" type="warning" @click="handleOnOpenEditModal(row)">编辑</Button>
            <Button style="font-size: 12px;" size="small" type="info" @click="handleOnOpenEditModal(row, true)">查看</Button>
            <Button  type="primary" size="small" style="font-size: 12px;" @click="handleOnOpenNotifyModal(row)">一键通知</Button>
            <Poptip transfer word-wrap confirm title="确认删除此任务吗" placement="top" @on-ok="handleOnDeleteTask(row, index)">
              <Button type="error" style="font-size: 12px;" size="small" :loading="row.loading">删除</Button>
            </Poptip>
          </div>
        </template>
      </Table>
      <div class="table-page">
        <Page :total="total" :current="curPageNum" show-total show-elevator @on-change="handleOnPageChange"/>
      </div>
    </div>
    <Modal 
      :value="showNotifyModal" 
      footer-hide
      :width="30"
      class-name="vertical-center-modal"
      :mask-closable="false"
      @on-cancel="handleOnCloseModal(false)">
      <p slot="header" style="text-align:center">
        <span>一键通知</span>
      </p>
      <div class="notify-list" style="max-height: 90vh;overflow-y: scroll">
        <div class="list-item">
          <div class="list-item-checkbox">
            ·Dchat一键通知
          </div>
        </div>
        <div class="list-item">
          <div class="list-item-checkbox">
            ·邮件发送
          </div>
        </div>
        <!-- <div class="list-item">
          <CheckboxGroup v-model="toUsers">
            <Checkbox v-for="(s, i) in toUsersOptions" :k :label="s">{{ s }}</Checkbox>
          </CheckboxGroup>
        </div> -->
        <div class="list-item">
          <Button type="primary" @click="handleOnNotify(0)" :loading="notifyLoading" size="small">通知所有人</Button>&nbsp;
          <Button type="primary" @click="handleOnNotify(1)" :loading="notifyLoading" size="small">通知新增人</Button>&nbsp;
          <Button size="small" @click="handleOnCloseModal(false)">取消</Button>
        </div>
      </div>
    </Modal>
    <Modal 
      :value="showEditModal" 
      footer-hide
      :width="90"
      fullscreen
      class-name="vertical-center-modal"
      :mask-closable="false"
      @on-cancel="handleOnCloseModal(false)">
      <p slot="header" style="text-align:center">
        <span>{{ curRow ? (justView ? '查看' : '修改') : '创建' }}任务信息</span>
      </p>
      <CreateTask :cur-row="curRow" :just-view="justView" @cancel="handleOnCloseModal" />
    </Modal>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { FilterConfigI } from '@/components/dumb/types';
import NFilter from '@/components/dumb/N-filter.vue'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import { getH5Html, taskListColumns } from './columns'
import { BaseConfigI } from '@/models/distribute_config';
import * as roadtestManager from '@/models/manager/roadtest'
import { UserInfoI } from '@/models/common';
import ExpandRow from './ExpandRow.vue'
import CreateTask from './CreateTask.vue'
import { uploadCDN } from '@/models/manager/vector';
import { getUid } from '@/utils';

@Component({
  components: {
    NFilter,
    NaviTitle,
    ExpandRow,
    CreateTask
  }
})
export default class RoadtestTaskList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    title: {
      type: 'input',
      label: '路测标题',
      value: '',
      placeholder: '路测标题模糊匹配'
    },
    city: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    },
    creator: {
      type: 'input',
      label: '创建人',
      value: '',
      placeholder: '创建人模糊匹配'
    },
    update_person: {
      type: 'input',
      label: '修改人',
      value: '',
      placeholder: '修改人模糊匹配'
    }
  }
  tableLoading: boolean = false
  notifyLoading: boolean = false
  columns = [
    {
      type: 'expand',
      title: '路测人员列表',
      align: 'center',
      width: 120,
      render: (h: any, params: { row: roadtestManager.RoadtestTaskListI }) => {
        const { row } = params
        return h(ExpandRow, {
          props: { curRow: row }
        })
      }
    },
    ...taskListColumns
  ]
  dataSource: roadtestManager.RoadtestTaskListI[] = []
  total: number = 0
  curPageNum: number = 1
  showNotifyModal: boolean = false
  showEditModal: boolean = false
  withDchat: boolean = true
  withEmail: boolean = true
  curRow: roadtestManager.RoadtestTaskListI | null = null
  justView: boolean | undefined = false
  toUsersOptions: string[] = []
  toUsers: string[] = []

  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }

  async handleOnPullTaskList(page: number) {
    this.tableLoading = true
    const { id, title, city, creator, update_person } = this.filterOptions
    const res = await roadtestManager.getTaskList({
      page,
      per_page: 10,
      id: id.value,
      city: city.value,
      title: title.value,
      creator: creator.value,
      update_person: update_person.value
    })
    this.tableLoading = false
    if (res) {
      const { data_list, cur_page_num, total_num } = res
      this.curPageNum = cur_page_num
      this.dataSource = data_list
      this.total = total_num
    } else {
      this.$Message.error('请求失败')
    }
  }
  hadnelOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.title.value = ''
    this.filterOptions.city.value = ''
    this.filterOptions.creator.value = ''
    this.filterOptions.update_person.value = ''
    this.handleOnPullTaskList(1)
  }
  async handleOnDeleteTask(row: roadtestManager.RoadtestTaskListI, index: number) {
    const { deleted, msg } = await roadtestManager.deleteTask(row.id)
    this.$set(this.dataSource[index], 'loading', false)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullTaskList(1)
    } else {
      this.$Message.success(`删除失败, ${msg}`)
    }
  }
  async handleOnOpenNotifyModal(row: roadtestManager.RoadtestTaskListI) {
    this.showNotifyModal = true
    this.curRow = row
    // * 如果通知时可选用户
    // const { id } = row
    // const res = await roadtestManager.getRoadtesterInfo({ road_test_id: id })
    // if (res) {
    //   this.toUsersOptions = res.data_list.map((d) => d.name)
    // }
  }
  handleOnOpenEditModal(row: roadtestManager.RoadtestTaskListI | null, justView?: boolean) {
    this.showEditModal = true
    this.curRow = row
    this.justView = justView
  }
  async handleOnNotify(send_to_new: number) {
    if (!this.curRow) {
      return
    }
    this.notifyLoading = true
    const { id } = this.curRow
    const roadtester = await roadtestManager.getRoadtesterInfo({ road_test_id: id, page: 1 })
    const formData = new FormData()
    formData.append('content', getH5Html(this.curRow, roadtester ? roadtester.data_list : []))
    formData.append('filename', `${getUid()}.html`)
    const uploadRes = await uploadCDN(formData)
    if (uploadRes && uploadRes.data) {
      const res = await roadtestManager.notifyMsg({
        send_to_new,
        road_test_id: id,
        detail_url: uploadRes.data,
      })
      if (res.done) {
        this.$Message.success(`通知成功, ${res.msg}`)
      } else {
        this.$Message.success(`通知失败, ${res.msg}`)
      }
    }
    this.notifyLoading = false
  }
  handleOnPageChange(page: number) {
    this.curPageNum = page
    this.handleOnPullTaskList(page)
  }
  handleOnCloseModal(shouldUpdateList?: boolean) {
    this.curRow = null
    this.showEditModal = false
    this.showNotifyModal = false
    shouldUpdateList && this.handleOnPullTaskList(this.curPageNum)
  }
  mounted() {
    this.handleOnPullTaskList(1)
  }
}
</script>

<style lang="less">
.btn-wrapper {
  text-align: right;
}
.notify-list {
  width: fit-content;
  margin: auto;
  padding: 10px 0;
  .list-item {
    margin-bottom: 10px;
    .list-item-checkbox {}
    .list-item-extra {
      padding-left: 18px;
      p {
        margin-top: 5px;
      }
    }
  }
}
</style>

