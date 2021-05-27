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
    <TileNoSelect 
      :visible="showModal" 
      @on-cancel="showModal = false" 
      :city-code="city_id"
      :renderBlocks="block_noes"
      :renderHighlightBlocks="renderHighlightBlocks"
      @onGetSelectedBlocks="onGetSelectedBlocks"/>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import moment from 'moment'
import { DistributorI, ValueConfig } from '@/types'
import TileNoSelect from '@/components/smart/TileNoSelect.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import * as basemapManage from '@/models/machine/basemap'
import { BaseMapRunningTaskI, BlockI } from '@/models/machine/basemap'

@Component({
  components: {
    NFilter,
    TileNoSelect
  }
})
export default class BasemapDeliverModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: BaseMapRunningTaskI
  showModal: boolean = false
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
    block_nos: {
      type: 'input',
      label: '子块编号',
      value: '',
      onFocus: () => {
        this.onFocus()
      },
      validate: () => {
        const v = this.formObj.block_nos.value
        if (!v || !JSON.parse(v).length) {
          return '请选择子块'
        } else {
          return ''
        }
      }
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
  get city_id() {
    return this.curDataRow ? this.curDataRow.city_id : 0
  }
  get block_noes() {
    return this.curDataRow ? this.curDataRow.block_noes.BlockNos : []
  }
  get renderHighlightBlocks() {
    const v = this.formObj.block_nos.value
    const l = v ? JSON.parse(v) as BlockI[] : []
    return l
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
      job_name, city, to_user, block_nos, desc, dead_line
    } = this.formObj
    this.loading = true
    const { distributed, msg } = await basemapManage.distributeTask(id, {
      job_name: job_name.value,
      blocks: block_nos.value,
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
  onFocus() {
    this.showModal = true
  }
  onGetSelectedBlocks(selectedBlocks: BlockI[]) {
    this.formObj.block_nos.value = JSON.stringify(selectedBlocks)
  }
  async mounted() {
    // 获取拥有角色：pa_manager 的人
    const list = await getUsersByRole('pa_manager')
    this.formObj.to_user.options = list.map((l) => ({ label: l.usernameZh, value: l.username }))
  }
}
</script>
