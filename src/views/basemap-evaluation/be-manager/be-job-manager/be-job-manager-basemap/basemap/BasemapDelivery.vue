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
          max-height="300"
          size="small" 
          :loading="tableLoading">
          <template slot-scope="{ row, index }" slot="mark_dispatch">
            <p>{{ row.mark_dispatch.split('&')[0] }}</p>
            <p>{{ row.mark_dispatch.split('&')[1] }}</p>
          </template>
          <template slot-scope="{ row, index }" slot="total">
            <p>{{ row.total.split('&')[0] }}</p>
            <p>{{ row.total.split('&')[1] }}</p>
          </template>
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
        <!-- <Table 
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
        </Table> -->
      </div>
      <div class="content-right">
        <div class="content-right-title">
          分发
        </div>
        <NFilter 
          :configs="formObj" 
          @on-submit="onDeliveryTask" 
          :loading="loading" 
          layout="vertically"
          submit-text="确定"
          cancel-text="取消"
          @on-cancel="handleOnCancel(false)"
        />
      </div>
    </div>
    <TileNoSelect 
      :visible="showModal" 
      @on-cancel="showModal = false" 
      :city-code="city_id"
      :renderBlocks="block_noes"
      :radio="true"
      :renderHighlightBlocks="renderHighlightBlocks"
      @onGetSelectedBlocks="onGetSelectedBlocks"/>
  </Modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { deliveryTask, getDeliveryDetail } from '@/presenter/manager.pre'
import { DeliveryDetailListNumsColumns, DeliveryDetailListMarkPersonColumns, DeliveryDetailListVerifyPersonColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import TileNoSelect from '@/components/smart/TileNoSelect.vue'
import * as basemapManage from '@/models/manager/basemap'
import { BaseMapManagerListI } from '@/models/manager/basemap'
import { BlockI } from '@/models/machine/basemap';

@Component({ components: { NFilter, TileNoSelect } })
export default class BasemapDelivery extends Vue {
  @Prop({type: Boolean, default: false}) readonly visible!: boolean
  @Prop({type: Object, default: () => null}) readonly curDataRow!: BaseMapManagerListI | null

  // 分发表单
  formObj: { [propName: string]: FilterConfigI } = {
    pa_name: {
      type: 'select-multi',
      label: '分发人员',
      value: [],
      options: [],
      validate: () => this.formObj.pa_name.value !== '' ? '' : '请选择分发人员'
    },
    block_nos: {
      type: 'input',
      label: '子块编号',
      value: '',
      onFocus: () => {
        this.onFocus()
      },
      placeholder: '子块编号',
      validate: () => {
        const v = this.formObj.block_nos.value
        if (!v || !JSON.parse(v).length) {
          return '请选择子块'
        } else {
          return ''
        }
      }
    },
    num: {
      type: 'input-number',
      label: '数量',
      value: 0,
      minNum: 1,
      maxNum: 0,
      validate: () => this.formObj.num.value ? '' : '数量不少于1',
      placeholder: '数量'
    },
  }
  numsColumns = DeliveryDetailListNumsColumns
  numsDataSource: any[] = []
  count: number = 0
  markPersonColumns = DeliveryDetailListMarkPersonColumns
  markPersonDataSource: any[] = []
  verifyPersonColumns = DeliveryDetailListVerifyPersonColumns
  verifyPersonDataSource: any[] = []

  loading: boolean = false
  tableLoading: boolean = false
  showModal: boolean = false

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
  get city_id() {
    return this.curDataRow ? +this.curDataRow.city_filter : 0
  }
  get block_noes() {
    return this.curDataRow ? this.curDataRow.blocks.BlockNos : []
  }
  get renderHighlightBlocks() {
    const v = this.formObj.block_nos.value
    const l = v ? JSON.parse(v) as BlockI[] : []
    return l
  }

  @Emit('on-close')
  handleOnCancel(reflash: boolean) {
    return reflash
  }
  @Watch('curDataRow')
  onChange() {
    this.curDataRow && this.getDeliveryRecord()
  }
  @Watch('formObj.pa_name.value', { deep: true })
  onPaNameChange(val: string[]) {
    const l = val.length
    const n = l ? this.count / l : 0
    this.formObj.num.maxNum = Math.floor(n)
    this.formObj.num.value = Math.floor(n)
  }
  @Watch('formObj.block_nos.value', { deep: true })
  async onBlockNosChange(val: string) {
    if (this.curDataRow) {
      const { id } = this.curDataRow
      const blockI = val ? (JSON.parse(val) as BlockI[])[0] : null
      if (blockI) {
        const { block_ids, block_no } = blockI
        const res = await basemapManage.getCanDeliveryNums({
          job_id: id,
          blockNo: block_no,
          blockID: block_ids[0]
        })
        if (!res) {
          return
        }
        const l = this.formObj.pa_name.value.length
        const n = l ? res.count / l : 0
        this.count = res.count
        this.formObj.num.maxNum = Math.floor(n)
        this.formObj.num.value = Math.floor(n)
      }
    }
  }

  async getDeliveryRecord() {
    if (!this.curDataRow) {
      return
    }
    const { id } = this.curDataRow
    this.tableLoading = true
    const res = await basemapManage.getDeliveryDetail(id)
    this.tableLoading = false
    if (!res) {
      this.$Message.error('获取分发记录失败')
      return
    }
    const {
      total_num, Block_disp_num,
      mark_dispatch_num, block_num, mark_person,
      // marked_num, verify_dispatch_num,
      // verify_person, verified_num
    } = res
    this.numsDataSource = (Block_disp_num || []).map((b, i) => {
      return {
        mark_dispatch: `子块编号：${b.block_id}&POI数量：${b.poi_complete_num} / ${b.poi_num}`,
        total: i ? '/' : `子块数量：${block_num} &POI数量：${total_num}`
      }
    })
    this.markPersonDataSource = mark_person.map((m) => {
      return {
        user_name: m.person,
        dis_id: m.dis_id,
        block_id: m.block_id,
        type: m.type,
        poi_nums: `${m.complete_count} / ${m.total_count}`,
        disabled: m.complete_count === m.total_count
      }
    })
    // this.verifyPersonDataSource = verify_person.map((m) => {
    //   return {
    //     user_name: m.person,
    //     dis_id: m.dis_id,
    //     type: m.type,
    //     nums: `${m.complete_count} / ${m.total_count}`,
    //     disabled: m.complete_count === m.total_count
    //   }
    // })
  }
  async handleOnRecall(row: any) {
    const { id } = this.curDataRow!;
    (row as any).loading = true
    const { dis_id, type } = row
    const { recalled, msg } = await basemapManage.recallDelivery(id, { dis_id, type });
    (row as any).loading = false
    this.$forceUpdate()
    if (recalled) {
      this.$Message.success(`收回成功, ${msg}`)
      this.getDeliveryRecord()
    } else {
      this.$Message.error(`收回失败, ${msg}`)
    }
  }
  async onDeliveryTask() {
    if (!this.nc_job_manager_dispatch) {
      this.$Message.warning('你无权限')
      return
    }
    if (!this.curDataRow) {
      return
    }
    const { pa_name, block_nos, num } = this.formObj
    const { id } = this.curDataRow
    this.loading = true
    const { deliveried, msg } = await basemapManage.deliveryJob(`${id}`, {
      pa_name: pa_name.value,
      blocks: block_nos.value,
      num: num.value,
      type: 1
    })
    this.loading = false
    if (deliveried) {
      this.$Message.success(`分发成功, ${msg}`)
      this.handleOnCancel(true)
    } else {
      this.$Message.error(`分发失败, ${msg}`)
    }
  }
  onFocus() {
    this.showModal = true
  }
  onGetSelectedBlocks(selectedBlocks: BlockI[]) {
    this.formObj.block_nos.value = JSON.stringify(selectedBlocks)
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
