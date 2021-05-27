<template>
  <Modal 
    :value="visible"
    width="60"
    class-name="vertical-center-modal"
    footer-hide 
    :mask-closable="false"
    @on-cancel="handleOnCancel(false)">
    <p slot="header" style="text-align:center">
      <span>详情</span>
    </p>
    <div class="content">
      <div class="content-left">
        <Table 
          :columns="numsColumns" 
          :data="numsDataSource" 
          border 
          size="small" 
          :loading="tableLoading">
        </Table>
        <Table 
          style="margin-top: 10px;"
          max-height="300"
          :columns="markPersonColumns" 
          :data="markPersonDataSource" 
          border 
          size="small" 
          :loading="tableLoading">
          <template slot-scope="{ row, index }" slot="action">
            <Poptip confirm title="确认收回吗？" transfer placement="top" @on-ok="handleOnRecall(row)">
              <Button :loading="row.loading" size="small" type="error" style="font-size: 12px;" :disabled="row.disabled">收回</Button>
            </Poptip>
          </template>
        </Table>
        <Table 
          style="margin-top: 10px;"
          max-height="300"
          :columns="verifyPersonColumns" 
          :data="verifyPersonDataSource" 
          border 
          size="small" 
          :loading="tableLoading">
          <template slot-scope="{ row, index }" slot="action">
            <Poptip confirm title="确认收回吗？" transfer placement="top" @on-ok="handleOnRecall(row)">
              <Button :loading="row.loading" size="small" type="error" style="font-size: 12px;" :disabled="row.disabled">收回</Button>
            </Poptip>
          </template>
        </Table>
      </div>
      <div class="content-right">
        <div class="content-right-title">
          分发
        </div>
        <NFilter 
          :configs="formObj" 
          @on-submit="onDeliveryContentTask" 
          :loading="loading" 
          layout="vertically"
          submit-text="确定"
          cancel-text="取消"
          @on-cancel="handleOnCancel(false)"
        />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { DeliveryDetailListNumsColumns, DeliveryDetailListMarkPersonColumns, DeliveryDetailListVerifyPersonColumns } from './columns'
import { DeliveryDetailListNumsI, DeliveryDetailListPersonI, } from './types';
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import * as lanelineManager from '@/models/manager/laneline'

@Component({ components: { NFilter } })
export default class DeliveryModal extends Vue {
  @Prop({type: Boolean, default: false}) readonly visible!: boolean
  @Prop({type: Object, default: () => null}) readonly curDataRow!: lanelineManager.LanelineJobListI | null

  // 分发表单
  formObj: { [propName: string]: FilterConfigI } = {
    pa_name: {
      type: 'select-multi',
      label: '分发人员',
      value: [],
      options: [],
      validate: () => this.formObj.pa_name.value.length ? '' : '请选择分发人员'
    },
    num: {
      type: 'input-number',
      label: '数量',
      value: 0,
      minNum: 1,
      maxNum: 0,
      validate: () => this.formObj.num.value ? '' : '数量不少于1',
      placeholder: '人均数量'
    },
    type: {
      type: 'radio-group',
      label: '分发选项',
      value: 1,
      options: [{ label: '分发到评测', value: 1 }, { label: '分发到质检', value: 2 }],
      validate: () => this.formObj.type.value ? '' : '请选择分发选项'
    }
  }
  numsColumns = DeliveryDetailListNumsColumns
  numsDataSource: DeliveryDetailListNumsI[] = []
  markPersonColumns = DeliveryDetailListMarkPersonColumns
  markPersonDataSource: DeliveryDetailListPersonI[] = []
  verifyPersonColumns = DeliveryDetailListVerifyPersonColumns
  verifyPersonDataSource: DeliveryDetailListPersonI[] = []
  markTotalNum: number = 0
  verifyTotalNum: number = 0

  loading: boolean = false
  tableLoading: boolean = false

  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job_manager_dispatch() {
    return this.flags.some((f) => f.name.includes('nc_job_manager_dispatch'))
  }

  @Watch('formObj.pa_name.value')
  onPaNameChange(val: string[]) {
    const total = this.formObj.type.value === 1 ? this.markTotalNum : this.verifyTotalNum
    const num = Math.floor(total / (val.length || 1))
    this.formObj.num.maxNum = num
    this.formObj.num.value = num
  }
  @Watch('formObj.type.value')
  onTypeNameChange(val: number) {
    const total = val === 1 ? this.markTotalNum : this.verifyTotalNum
    const num = Math.floor(total / (this.formObj.pa_name.value.length || 1))
    this.formObj.num.maxNum = num
    this.formObj.num.value = num
  }
  @Watch('curDataRow')
  onCurDataRowChange() {
    this.getDeliveryRecord()
  }

  @Emit('on-close')
  handleOnCancel(reflash: boolean) {
    return reflash
  }

  async getDeliveryRecord() {
    if (!this.curDataRow) {
      return
    }
    const { id } = this.curDataRow
    this.tableLoading = true
    const res = await lanelineManager.getDeliveryDetail(id)
    this.tableLoading = false
    if (!res) {
      this.$Message.error('获取分发记录失败')
      return
    }
    const {
      total_num, mark_dispatch_num, marked_num, verify_dispatch_num,
      mark_person, verify_person, verified_num
    } = res
    this.markTotalNum = total_num - mark_dispatch_num
    this.verifyTotalNum = marked_num - verify_dispatch_num
    this.numsDataSource = [{
      verify_dispatch: `${verified_num}/  ${verify_dispatch_num}`,
      mark_dispatch: `${marked_num} / ${mark_dispatch_num}`,
      circulation: '-',
      total: total_num
    }]
    this.markPersonDataSource = mark_person.map((m) => {
      return {
        user_name: m.person,
        dis_id: m.dis_id,
        type: m.type,
        nums: `${m.complete_count} / ${m.total_count}`,
        disabled: m.complete_count === m.total_count
      }
    })
    this.verifyPersonDataSource = verify_person.map((m) => {
      return {
        user_name: m.person,
        dis_id: m.dis_id,
        type: m.type,
        nums: `${m.complete_count} / ${m.total_count}`,
        disabled: m.complete_count === m.total_count
      }
    })
  }
  async handleOnRecall(row: DeliveryDetailListPersonI) {
    const { id } = this.curDataRow!;
    (row as any).loading = true
    const { dis_id, type } = row
    const { recalled, msg } = await lanelineManager.recallDelivery(id, { dis_id, type });
    (row as any).loading = false
    this.$forceUpdate()
    if (recalled) {
      this.$Message.success(`收回成功, ${msg}`)
      this.getDeliveryRecord()
    } else {
      this.$Message.error(`收回失败, ${msg}`)
    }
  }
  async onDeliveryContentTask() {
    if (!this.nc_job_manager_dispatch) {
      this.$Message.warning('你无权限')
      return
    }
    if (!this.curDataRow) {
      return
    }
    const { pa_name, num, type, blind, tag } = this.formObj
    const { id } = this.curDataRow
    this.loading = true
    const { deliveried, msg } = await lanelineManager.deliveryJob(`${id}`, {
      pa_name: pa_name.value,
      type: type.value,
      num: num.value
    })
    this.loading = false
    if (deliveried) {
      this.$Message.success(`分发成功, ${msg}`)
      this.handleOnCancel(true)
    } else {
      this.$Message.error(`分发失败, ${msg}`)
    }
  }
  async mounted() {
    const users = await getUsersByRole('pa_mark')
    this.formObj.pa_name.options = users.map((u) => ({ label: u.usernameZh, value: u.username }))
  }
}
</script>

<style lang="less" scoped>
.content {
  position: relative;
  display: flex;
  align-items: top;
  justify-content: space-between;
  .content-left {
    width: 50%;
    padding: 10px;
    border-right: 1px solid #c5c8ce;
    .content-left-item {
      margin-bottom: 20px;
    }
    .content-left-table {
      width: 97%
    }
    .content-left-detail {
      max-height: 300px;
      overflow-y: scroll;
      .detail-evaluation, .detail-qua-inspect {
        .detail-values {
          padding: 5px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          div {
            width: 25%;
            text-align: center;
          }
        }
      }
    }
  }
  .content-right {
    width: 50%;
    padding: 10px;
    // background-color: aliceblue ;
    .content-right-title {
      text-align: center;
      margin-bottom: 10px;
      font-size: 16px;
    }
  }
}
</style>
