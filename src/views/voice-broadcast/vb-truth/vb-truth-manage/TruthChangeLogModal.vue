<template>
  <Modal 
    :value="show" 
    footer-hide 
    width="70"
    @on-cancel="handleOnCancel">
    <Table :columns="columns" :data="dataSource" :loading="loading" border size="small" max-height="700">
      <template slot-scope="{ row, index }" slot="action">
        <Button type="warning" style="font-size: 12px" size="small" @click="handleOnRollback(row)">回滚</Button>
      </template>
    </Table>
  </Modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { ValueConfig } from '@/types'
import { truthDatabaseChangesColumns } from './columns'
import { pullTruthHistoryList, rollbackTruth, TruthHistoryListResItemI } from '@/presenter/truth.pre'
import { State } from 'vuex-class'
import { UserInfoI } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { TruthRecordRowI } from './types'

@Component
export default class TruthChangeLogModal extends Vue {
  @State('userInfo') userInfo!: UserInfoI
  @State('baseConfig') baseConfig!: BaseConfigI
  @Prop({ type: Boolean, default: false }) readonly show!: boolean
  @Prop({ type: Number, default: 0 }) readonly caseId!: number
  dataSource: TruthRecordRowI[] = []
  columns = truthDatabaseChangesColumns
  loading: boolean = false

  get action() {
    return this.baseConfig.action
  }

  @Watch('caseId')
  onCaseIdChanged(val: number) {
    this.pullHistoryList(val)
  }

  @Emit('on-close')
  onClose(shouldRefresh?: boolean) {
    return shouldRefresh
  }

  handleOnCancel() {
    this.$emit('on-close')
  }
  async handleOnRollback(row: TruthRecordRowI) {
    const { isDone, msg } = await rollbackTruth(row.id)
    if (isDone) {
      this.$Message.success({
        content: `回滚成功, ${msg}`,
        onClose: () => {
          this.$emit('on-close', true)
        }
      })
    } else {
      this.$Message.error(`回滚失败, ${msg}`)
    }
  }
  async pullHistoryList(caseId: number) {
    this.loading = true
    const res = await pullTruthHistoryList(caseId)
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
    }
    this.dataSource = this.parseHistoryData(res || [])
  }
  parseHistoryData(list: TruthHistoryListResItemI[]) {
    return list.map((item) => {
      const { true_value, id, tts, operator, create_time,  } = item
      const { assist_text, code } = true_value
      const _tts = this.action.find((obj: ValueConfig) => obj.value == tts)
      return {
        id,
        operator,
        create_time,
        tts: _tts ? _tts.label : tts,
        assist: assist_text.join(','),
        code_family: code
      }
    })
  }
}
</script>
