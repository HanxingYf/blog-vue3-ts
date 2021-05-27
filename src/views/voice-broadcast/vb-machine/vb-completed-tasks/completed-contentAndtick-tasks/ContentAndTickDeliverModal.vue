<template>
  <Modal
    :value="visible"
    footer-hide
    :width="30"
    class-name="vertical-center-modal"
    :mask-closable="false"
    @on-cancel="handleOnCancel"
  >
    <p slot="header" style="text-align: center">
      <span>任务下发</span>
    </p>
    <div
      class="content"
      style="position: relative; max-height: 90vh; overflow-y: scroll"
    >
      <Spin size="large" fix v-if="calcLoading">正在计算可下发数量...</Spin>
      <NFilter
        :configs="formObj"
        :loading="loading"
        layout="vertically"
        submit-text="下发"
        cancel-text="取消"
        @on-submit="handleOnDistributeJob"
        @on-cancel="handleOnCancel"
      />
    </div>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import moment from 'moment'
import { distributeContentAndTickTask, getDistributeTickFilterCount, getHighFilterRules } from '@/presenter/machine.pre'
import { DistributorI, ValueConfig } from '@/types'
import { ContentAndTickTaskListRowI } from './types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: {
    NFilter
  }
})

export default class ContentAndTickDeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: ContentAndTickTaskListRowI | null
  loading: boolean = false
  calcLoading: boolean = false

  formObj: { [propName: string]: FilterConfigI } = {
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      validate: () => this.formObj.job_name.value ? '' : '请填写评测名称'
    },
    to_user: {
      type: 'select',
      label: '下发人员',
      value: '',
      options: [],
      validate: () => this.formObj.to_user.value.length ? '' : '请选择下发人员'
    },
    custom_filter: {
      type: 'select',
      label: '高级筛选',
      value: '',
      options: []
    },
    num: {
      type: 'input-number',
      label: '数  量',
      value: 1,
      minNum: 1,
      validate: () => this.formObj.num.value ? '' : '请填写下发数量',
      placeholder: '',
    },
    desc: {
      type: 'input',
      label: '任务描述',
      value: '',
    },
    dead_line: {
      type: 'datetime',
      label: '截止时间',
      value: new Date(moment().valueOf() + 1 * 24 * 3600 * 1000),
      validate: () => this.formObj.dead_line.value ? '' : '请选择截止日期',
      style: { width: '100%' }
    },
  }

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get machine_tag() {
    return this.baseConfig.machine_tag
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get code_list() {
    return this.baseConfig.code_list
  }
  get filter_type() {
    return this.baseConfig.filter_type
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_to_job() {
    return this.flags.some((f) => f.name.includes('nc_task_to_job'))
  }

  async calcNumMaxNum() {
    const { city, dis_filter } = this.formObj
    const { value, value2, value3 } = dis_filter
    const val: string | number | undefined = value
    const choosed = typeof val === 'number'
    const { id, num } = this.curDataRow!
    if (choosed && +value2 < +value3 && city.value.length) {
      this.calcLoading = true
      const count = await getDistributeTickFilterCount({
        task_id: id,
        cities: city.value,
        dis_include: !!+val!,
        dis_scope: [+value2, +value3]
      })
      this.calcLoading = false
      this.formObj.num.maxNum = count
      this.formObj.num.placeholder = `最少1，最多${count}`
    } else {
      this.formObj.num.maxNum = num
      this.formObj.num.placeholder = `最少1，最多${num}`
    }
  }

  async handleOnDistributeJob() {
    if (!this.nc_task_to_job) {
      this.$Message.warning('你无权限')
      return
    }
    if (!this.curDataRow) {
      return
    }
    const { id, } = this.curDataRow
    const {
      job_name, to_user, num, custom_filter, desc, dead_line
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await distributeContentAndTickTask({
      task_id: id,
      job_name: job_name.value,
      num: +num.value,
      custom_filter: custom_filter.value,
      desc: desc.value,
      to_user: to_user.value,
      dead_line: moment(dead_line.value).format('YYYY-MM-DD HH:mm:ss')
    })
    this.loading = false
    if (distributed) {
      this.$Message.success(`下发成功, ${msg}`)
      this.handleOnCancel()
    } else {
      this.$Message.success(`下发失败, ${msg}`)
    }
  }

  @Emit('on-close')
  handleOnCancel() {
    return true
  }

  @Watch('curDataRow')
  onChanged() {
    if (this.curDataRow) {
      this.formObj.num.maxNum = this.curDataRow.num
      this.formObj.num.placeholder = `最少1，最多${this.curDataRow.num}`
    }
  }
  async mounted() {
    // 获取高级筛选规则
    const result = await getHighFilterRules('self', {})
    this.formObj.custom_filter.options = result.map((r) => ({ label: r.name, value: r.regulation }))
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
