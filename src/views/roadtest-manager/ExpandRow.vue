<template>
  <div class="expend-row-wrapper">
    <div class="title-wrapper">
      <p>路测人员列表</p>
      <Button size="small" type="primary" @click.stop="handleOnOpenModal(null)">新增路测人员</Button>
    </div>
    <div class="table-wrapper">
      <Table 
        :loading="tableLoading"
        :columns="columns"
        :data="dataSource"
        size="small"
        border>
        <template slot-scope="{ row, index }" slot="is_first_test">
          {{ row.is_first_test ? '是' : '否' }}
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button type="info" style="font-size: 12px;" size="small" @click="handleOnOpenModal(row)">编辑</Button>
            <Poptip transfer word-wrap confirm title="确认删除此路测人员吗" placement="top" @on-ok="handleOnDelete(row, index)">
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
      :value="showModal" 
      footer-hide
      :width="30"
      class-name="vertical-center-modal"
      :mask-closable="false"
      @on-cancel="handleOnCloseModal">
      <p slot="header" style="text-align:center">
        <span>{{ curRoadtesterRow ? '编辑' : '添加' }}人员</span>
      </p>
      <div style="max-height: 90vh;overflow-y: scroll">
        <NFilter 
          :configs="formObjRoadtester" 
          @on-submit="handleOnSubmit"
          @on-cancel="handleOnCloseModal"
          cancelText="取消"
          submitText="确认"
          :tableLoading="editLoading"
          layout="vertically"
        />
      </div>
    </Modal>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { roadtesterListColumns } from './columns'
import * as roadtestManager from '@/models/manager/roadtest'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { validatePhone, validateTestPhone } from '@/utils'

@Component({
  components: {
    NFilter
  }
})
export default class ExpandRow extends Vue {
  @Prop({ type: Object, default: () => null }) readonly curRow!: roadtestManager.RoadtestTaskListI
  formObjRoadtester: { [p: string]: FilterConfigI } = {
    name: {
      type: 'select',
      label: '姓名(邮箱前缀)',
      onSelectQueryChange: (query: string) => {
        this.handleOnFillNameOpts(query)
      },
      options: [],
      value: '',
      validate: () => {
        return this.formObjRoadtester.name.value ? '' : '请填写姓名'
      }
    },
    group: {
      type: 'input',
      label: '组别',
      value: '',
      disabled: true,
      validate: () => {
        return this.formObjRoadtester.group.value ? '' : '请填写组别'
      }
    },
    phone: {
      type: 'input',
      label: '联系电话',
      value: '',
      validate: () => {
        return validatePhone(this.formObjRoadtester.phone.value) ? '' : '请填写11位联系电话'
      }
    },
    test_phone: {
      type: 'input',
      label: '测试手机号',
      value: '',
      placeholder: '请用英文逗号隔开',
      validate: () => {
        return validateTestPhone(this.formObjRoadtester.test_phone.value) ? '' : '请填写11位测试手机号,英文逗号隔开'
      }
    },
    is_first_test: {
      type: 'radio-group',
      label: '是否首次路测',
      value: 1,
      options: [{ label: '是', value: 1 }, { label: '否', value: 0 }]
    }
  }
  columns = roadtesterListColumns
  tableLoading: boolean = false
  editLoading: boolean = false
  total: number = 0
  curPageNum: number = 1
  dataSource: roadtestManager.RoadtesterI[] = []
  showModal: boolean = false
  curRoadtesterRow: roadtestManager.RoadtesterI | null = null

  @Watch('formObjRoadtester.name.value')
  async onNameChange(val: string) {
    if (val && val.includes('-')) {
      this.formObjRoadtester.group.value = val.split('-')[1]
    }
  }
  async handleOnFillNameOpts(query: string) {
    const data = await roadtestManager.getDuser(query)
    this.formObjRoadtester.name.options = data.map((d) => {
      const dep = `${d.deptDescr1}${d.deptDescr2 ? `/${d.deptDescr2}` : ''}${d.deptDescr3 ? `/${d.deptDescr3}` : ''}`
      return {
        label: `${d.name}(${d.emailAddr})`,
        value: `${d.name}-${dep}-${d.emailAddr.replace(/@didiglobal.com/gm, '')}`
      }
    })
  }
  async handleOnGetList(page: number) {
    this.tableLoading = true
    const { id } = this.curRow
    const res = await roadtestManager.getRoadtesterInfo({ road_test_id: id, page, num_per_page: 10 })
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
  async handleOnDelete(row: roadtestManager.RoadtesterI, index: number) {
    const { deleted, msg } = await roadtestManager.delRoadtester(row.id)
    this.$set(this.dataSource[index], 'loading', false)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnGetList(1)
    } else {
      this.$Message.success(`删除失败, ${msg}`)
    }
  }
  handleOnPageChange(page: number) {
    this.curPageNum = page
    this.handleOnGetList(page)
  }
  async handleOnSubmit() {
    const { id = '', road_test_id = '' } = this.curRoadtesterRow || {}
    const { name, group, phone, test_phone, is_first_test } = this.formObjRoadtester
    this.editLoading = true
    const res = await roadtestManager.createRoadtester({
      ...(id ? { id } : {}),
      road_test_id: this.curRow.id,
      name: name.value.split('-')[2],
      nick_name: name.value.split('-')[0],
      user_group: group.value,
      phone: phone.value,
      test_phone: test_phone.value,
      is_first_test: is_first_test.value
    })
    this.editLoading = false
    const action = this.curRoadtesterRow ? '编辑' : '创建'
    if (res.done) {
      this.$Message.success(`${action}成功, ${res.msg}`)
      this.showModal = false
      this.handleOnGetList(1)
    } else {
      this.$Message.success(`${action}失败, ${res.msg}`)
    }
  }
  handleOnCloseModal() {
    this.showModal = false
    this.curRoadtesterRow = null
  }
  async handleOnOpenModal(row: roadtestManager.RoadtesterI | null) {
    this.showModal = true
    this.curRoadtesterRow = row
    if (row && row.name) {
      await this.handleOnFillNameOpts(row.name)
      this.formObjRoadtester.name.value = `${row.nick_name}-${row.user_group}-${row.name}`
    } else {
      this.formObjRoadtester.name.value = ''
    }
    this.formObjRoadtester.group.value = row && row.user_group ? row.user_group : ''
    this.formObjRoadtester.phone.value = row && row.phone ? row.phone : ''
    this.formObjRoadtester.test_phone.value = row && row.test_phone ? row.test_phone : ''
    this.formObjRoadtester.is_first_test.value = row && row.is_first_test ? row.is_first_test :  0
  }
  mounted() {
    this.handleOnGetList(this.curPageNum)
  }
}
</script>

<style lang="less" scoped>
.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
