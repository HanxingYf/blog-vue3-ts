<template>
  <Modal 
    :value="visible" 
    footer-hide
    :width="30"
    class-name="vertical-center-modal"
    :mask-closable="false"
    @on-cancel="handleOnCancel(false)">
    <p slot="header" style="text-align:center">
      <span>任务下发</span>
    </p>
    <div class="content" style="max-height: 90vh;overflow-y: scroll">
      <NFilter 
        :configs="formObj" 
        @on-submit="handleOnDistributeJob" 
        :loading="loading" 
        layout="vertically"
        submit-text="下发"
        cancel-text="取消"
        @on-cancel="handleOnCancel(false)"/>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import moment from 'moment'
import { getHighFilterRules } from '@/presenter/machine.pre'
import { DistributorI, ValueConfig } from '@/types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import * as vectorMachine from '@/models/machine/vector'
import { parseToMapObj } from '@/utils';

@Component({
  components: {
    NFilter
  }
})

export default class DeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: vectorMachine.TaskListI | null
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
      options: [],
      validate: () => this.formObj.city.value.length ? '' : '请选择城市'
    },
    filter_type: {
      type: 'select',
      label: '对比结果',
      value: '',
      options: this.baseConfig.enlarge_map_diff_type
    },
    custom_filter: {
      type: 'select',
      label: '高级筛选',
      value: '',
      options: []
    },
    to_user: {
      type: 'select',
      label: '下发人员',
      value: '',
      options: [],
      validate: () => this.formObj.to_user.value.length ? '' : '请选择下发人员'
    },
    num: {
      type: 'input-number',
      label: '数量',
      value: 1,
      minNum: 1,
      maxNum: 0,
      validate: () => {
        let msg = ''
        if (this.formObj && this.curDataRow) {
          const { num } = this.formObj
          if (num.value > 0 && num.value <= this.curDataRow.num) {
          } else {
            msg = `数量必须大于0且小于${this.curDataRow.num}`
          }
        }
        return msg
      },
      placeholder: '',
    },
    desc: {
      type: 'input',
      label: '评测描述',
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

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get mapCityList() {
    return parseToMapObj(this.city_list, true)
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
  handleOnCancel(shouldFreash: boolean) {
    return shouldFreash
  }

  @Watch('curDataRow')
  onChanged() {
    this.formObj.job_name.value = ''
    this.formObj.city.value = []
    this.formObj.filter_type.value = ''
    this.formObj.custom_filter.value = ''
    this.formObj.to_user.value = ''
    this.formObj.num.value = 0
    this.formObj.desc.value = ''
    this.formObj.dead_line.value = new Date(moment().valueOf() + 1 * 24 * 3600 * 1000)
    if (this.curDataRow) {
      this.formObj.num.maxNum = this.curDataRow.num
      this.formObj.num.placeholder = `最少1，最多${this.curDataRow.num}`
      this.formObj.city.options = this.curDataRow.city_name.split(',').map((name) => {
        return {
          label: name,
          value: +this.mapCityList[name]
        }
      })
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
    const { id, task_type } = this.curDataRow
    const {
      job_name, city, to_user, filter_type, custom_filter,
      num, desc, dead_line
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await vectorMachine.distributeTask(id, {
      city: city.value,
      job_name: job_name.value,
      ...(filter_type.value ? {filter_type: filter_type.value} : {}),
      custom_filter: custom_filter.value,
      num: num.value,
      desc: desc.value,
      to_user: to_user.value,
      info: `${task_type}`,
      dead_line: moment(dead_line.value).format('YYYY-MM-DD HH:mm:ss')
    })
    this.loading = false
    if (distributed) {
      this.$Message.success(`下发成功, ${msg}`)
      this.handleOnCancel(true)
    } else {
      this.$Message.success(`下发失败, ${msg}`)
    }
  }
  async mounted() {
    // 获取高级筛选规则
    const result = await getHighFilterRules('enlargeMap', {}, 'v3')
    this.formObj.custom_filter.options = result.map((r) => ({ label: r.name, value: r.regulation }))
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
