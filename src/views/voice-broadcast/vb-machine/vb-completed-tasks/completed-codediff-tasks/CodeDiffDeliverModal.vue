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
    <div class="content" style="max-height: 90vh;overflow-y: scroll">
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
import { distributeCodeDiffTask, CodeDiffTaskRunningListResI, getHighFilterRules } from '@/presenter/machine.pre'
import { DistributorI, ValueConfig } from '@/types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { parseToMapObj } from '@/utils'

@Component({
  components: {
    NFilter
  }
})
export default class CodeDiffDeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: CodeDiffTaskRunningListResI | null
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
      // validate: () => this.formObj.city.value.length ? '' : '请选择城市'
    },
    diff_type: {
      type: 'select-multi',
      label: '对比结果',
      value: [],
      options: [],
      // validate: () => this.formObj.diff_type.value.length ? '' : '请选择对比结果'
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
          const task_num = this.curDataRow.num
          if (num.value > 0 && num.value <= task_num) {
          } else {
            msg = `数量必须大于0且小于${task_num}`
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
  get mapCityList() {
    return parseToMapObj(this.city_list, true)
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
      const { structure } = this.curDataRow
      try {
        const { City, DiffIndicator, DiffType, inLinkLevel, outLinkLevel } = JSON.parse(structure)
        this.formObj.diff_type.options = DiffType.map((d: string) => {
          return {
            label: d,
            value: d
          }
        })
      } catch (error) {
        console.error('解析structure失败', structure)
      }
      this.formObj.city.options = this.curDataRow.cities.split(',').map((name) => {
        return {
          label: name,
          value: +this.mapCityList[name.slice(0, name.length - 1)]
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
    const { id } = this.curDataRow
    const {
      job_name, city, diff_type, to_user, tag, code, custom_filter,
      content, num, desc, dead_line
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await distributeCodeDiffTask({
      task_id: id,
      city: city.value,
      diff_type: diff_type.value,
      job_name: job_name.value,
      custom_filter: custom_filter.value,
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
    // 获取高级筛选规则
    const result = await getHighFilterRules('self', {})
    this.formObj.custom_filter.options = result.map((r) => ({ label: r.name, value: r.regulation }))
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
