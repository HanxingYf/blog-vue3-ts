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
import { getHighFilterRules, distributeContentAndHotCodeTask } from '@/presenter/machine.pre'
import { DistributorI, ValueConfig } from '@/types'
import { ContentTaskRowI } from './types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: {
    NFilter
  }
})

export default class ContentDeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: ContentTaskRowI | null
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
    tag: {
      type: 'select-multi',
      label: '对比结果',
      value: [],
      options: this.machine_tag
    },
    code: {
      type: 'select-multi',
      label: 'Code筛选',
      value: [],
      options: this.code_list
    },
    custom_filter: {
      type: 'select',
      label: '高级筛选',
      value: '',
      options: []
    },
    content: {
      type: 'input-select',
      label: '文本筛选',
      value: '',
      value2: 1,
      options: this.filter_type,
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
          const { task_num } = this.curDataRow
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
    },
    marked_filter: {
      type: 'radio-group',
      label: 'link_list筛选',
      value: 0,
      options: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
      validate: () => this.formObj.marked_filter.value.toString() ? '' : '请选择是否筛选link_list',
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
      job_name, city, to_user, tag, code, custom_filter,
      content, num, desc, dead_line, marked_filter
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await distributeContentAndHotCodeTask({
      task_id: id,
      city: city.value,
      job_name: job_name.value,
      tag: tag.value,
      custom_filter: custom_filter.value,
      code: code.value,
      content: content.value,
      filter_type: content.value2,
      num: num.value,
      desc: desc.value,
      to_user: to_user.value,
      dead_line: moment(dead_line.value).format('YYYY-MM-DD HH:mm:ss'),
      marked_filter: !!marked_filter.value
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
    const result = await getHighFilterRules('code', {})
    this.formObj.custom_filter.options = result.map((r) => ({ label: r.name, value: r.regulation }))
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
