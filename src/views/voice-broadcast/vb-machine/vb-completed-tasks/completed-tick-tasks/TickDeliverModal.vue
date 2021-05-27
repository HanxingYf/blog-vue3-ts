<template>
  <Modal 
    :value="visible" 
    footer-hide
    :width="30"
    class-name="vertical-center-modal"
    :mask-closable="false"
    @on-cancel="handleOnCancel">
    <p slot="header" style="text-align:center">
      <span>任务下发</span>
    </p>
    <div class="content" style="position: relative;max-height: 90vh;overflow-y: scroll">
      <Spin size="large" fix v-if="calcLoading">正在计算可下发数量...</Spin>
      <NFilter 
        :configs="formObj" 
        @on-submit="handleOnDistributeJob" 
        :loading="loading" 
        layout="vertically"
        submit-text="下发"
        cancel-text="取消"
        @on-cancel="handleOnCancel"/>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import moment from 'moment'
import { distributeTickTask, getDistributeTickFilterCount } from '@/presenter/machine.pre'
import { DistributorI, ValueConfig } from '@/types'
import { TickTaskListRowI } from './types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: {
    NFilter
  }
})

export default class TickDeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: TickTaskListRowI | null
  formObj: { [propName: string]: FilterConfigI } = {
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      validate: () => this.formObj.job_name.value ? '' : '请填写评测名称'
    },
    city: {
      type: 'select-multi',
      label: '城市',
      value: [],
      options: this.city_list,
      validate: () => this.formObj.city.value.length ? '' : '请选择城市'
    },
    to_user: {
      type: 'select',
      label: '下发人员',
      value: '',
      options: [],
      validate: () => this.formObj.to_user.value.length ? '' : '请选择下发人员'
    },
    code: {
      type: 'select-multi',
      label: 'Code筛选',
      value: [],
      options: this.code_list
    },
    dis_filter: {
      type: 'input-range-select',
      label: '播报结束至Code点距',
      value: '',
      value2: 0,
      value3: 0,
      options: [{ label: '包含', value: 1 }, { label: '不包含', value: 0 }]
    },
    num: {
      type: 'input-number',
      label: '数量',
      value: 1,
      minNum: 1,
      maxNum: 0,
      onFocus: () => {
        this.calcNumMaxNum()
      },
      validate: () => {
        let msg = ''
        if (this.formObj && this.curDataRow) {
          const { num } = this.formObj
          const { task_num } = this.curDataRow
          if (num.value > 0 && num.value <= task_num) {
          } else {
            msg = `请输入正确数量`
          }
        }
        return msg
      },
      placeholder: '',
    },
    desc: {
      type: 'input',
      label: '任务描述',
      value: ''
    },
    dead_line: {
      type: 'datetime',
      label: '截止时间',
      value: new Date(moment().valueOf() + 1 * 24 * 3600 * 1000),
      validate: () => this.formObj.dead_line.value ? '' : '请选择截止日期',
      style: { width: '100%' }
    }
  }
  loading: boolean = false
  calcLoading: boolean = false

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
  @Emit('on-close')
  handleOnCancel() {
    return true
  }
  @Watch('curDataRow')
  onChanged() {
    if (this.curDataRow) {
      this.formObj.num.maxNum = this.curDataRow.task_num
      this.formObj.num.placeholder = `最少1，最多${this.curDataRow.task_num}`
    }
  }
  @Watch('formObj.dis_filter', { deep: true })
  async onDisFilterValueChanged(dis_filter: FilterConfigI) {
    const { value } = dis_filter
    const val: string | number | undefined = value
    const choosed = typeof val === 'number'
    this.formObj.dis_filter.validate = choosed ? this.disFilterValidate : undefined
    // this.calcNumMaxNum()
  }
  @Watch('formObj.city.value', { deep: true })
  onCityChanged(val: number[]) {
    // this.calcNumMaxNum()
  }

  disFilterValidate() {
    const { value, value2, value3 } = this.formObj.dis_filter
    if (typeof value === 'number') {
      if (typeof value2 === 'number' && typeof value3 === 'number') {
        return value2 >= value3 ? `起始点距应该小于结束点距` : ''
      } else {
        return '请输入点距数值'
      }
    } else {
      return ''
    }
  }
  async calcNumMaxNum() {
    const { city, dis_filter } = this.formObj
    const { value, value2, value3 } = dis_filter
    const val: string | number | undefined = value
    const choosed = typeof val === 'number'
    const { id, task_num } = this.curDataRow!
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
      this.formObj.num.maxNum = task_num
      this.formObj.num.placeholder = `最少1，最多${task_num}`
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
    const { id, task_num } = this.curDataRow
    const {
      job_name, city, to_user, tag, code, num, desc, dead_line, dis_filter
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await distributeTickTask({
      task_id: id,
      city: city.value,
      job_name: job_name.value,
      code: code.value,
      dis_include: !!dis_filter.value,
      dis_scope: [+dis_filter.value2, +dis_filter.value3],
      num: num.value,
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
  async mounted() {
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
