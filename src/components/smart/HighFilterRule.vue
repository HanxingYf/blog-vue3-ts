<template>
  <div class='wrapper'>
    <div class="filter-wrapper">
      <div class="form-wrapper" style="margin-top: 10px">
        <div class="form-item">
          <div class="form-item-label">高级筛选规则:</div>
          <div class="form-item-control">
            <Input type="textarea" ref="customFilter" :rows="1" v-model="customFilter.value" placeholder="高级筛选规则" />
          </div>
        </div>
        <div class="form-item" v-if="customFilter.value">
          <div class="form-item-label">高级筛选规则名称:</div>
          <div class="form-item-control">
            <Input v-model="customFilter.name" placeholder="高级筛选规则名称" style="width: 150px" />
          </div>
        </div>
        <div class="form-item">
          <Button
            :loading="saveLoading"
            :disabled="!(customFilter.value && customFilter.name)"
            style="width: 100px" 
            type="info" 
            @click="handleOnSaveRegular">保存</Button>&nbsp;&nbsp;
          <Button type="default" @click="showCustomList = !showCustomList">{{ showCustomList ? '关闭' : '显示' }}所有规则</Button>
        </div>
      </div>
    </div>
    <div class="custom-filter-list">
      <Table
        v-if="showCustomList"
        width="800"
        max-height="300"
        :loading="regularLoading" 
        :columns="regularColumns"
        :data="customFilter.list" 
        size="small"
        border>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" style="font-size: 12px;" @click="customFilter.value = row.regulation">填充</Button>&nbsp;
          <Poptip @on-ok="handleOnDelRegular(row.id)" word-wrap transfer confirm title="确认删除此规则吗" placement="top">
            <Button size="small" type="error" style="font-size: 12px;">删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { getHighFilterRules, delHighFilterRules, saveHighFilterRule } from '@/presenter/machine.pre'
const regularColumns = [
  {
    title: 'ID',
    key: 'id',
    align: 'center',
    width: 50
  },
  {
    title: '名称',
    key: 'name',
    align: 'center',
  },
  {
    title: '规则',
    key: 'regulation',
    align: 'center',
    ellipsis: true,
    tooltip: true
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
    width: 150,
    slot: 'action'
  }
]

@Component
export default class HighFilterRule extends Vue {
  @Prop({ type: String, default: 'code' }) readonly type!: 'code' | 'self' | 'lane' | 'enlargeMap'
  @Prop({ type: String, default: 'v2' }) readonly version!: string
  // 高级筛选规则
  customFilter: { value: string; name: string; list: Array<{
    id: number;
    name: string;
    regulation: string;
  }> } = {
    value: '',
    name: '',
    list: []
  }
  regularColumns = regularColumns
  regularLoading: boolean = false
  saveLoading: boolean = false
  showCustomList: boolean = false

  @Watch('customFilter.value')
  onCustomFilterValChanged(val: string) {
    const isValidJson = this.judgeIsValidJson(val)
    if (!isValidJson) {
      this.$Message.warning(`规则不是JSON字符串, 筛选将被忽略`);
      (this.$refs.customFilter as any).focus()
      return
    }
    this.onSendCustomFilterVal()
  }

  @Emit('onSendCustomFilterVal')
  onSendCustomFilterVal() {
    return this.customFilter.value
  }

  judgeIsValidJson(val: string) {
    let isValidJson = true
    try {
      JSON.parse(val)
    } catch (error) {
      isValidJson = false
    }
    return isValidJson
  }

  async handleOnSaveRegular() {
    const { value, name, list } = this.customFilter
    const isValidJson = this.judgeIsValidJson(value)
    if (!isValidJson) {
      this.$Message.warning(`规则不是JSON字符串`)
      return
    }
    const isRepeat = list.some((item) => item.name === name || item.regulation === value)
    if (isRepeat) {
      this.$Message.warning(`保存失败，名称或规则重复了！`)
      return
    }
    this.saveLoading = true
    const { saved, msg } = await saveHighFilterRule(this.type, {
      name,
      regulation: value
    }, this.version)
    this.saveLoading = false
    if (saved) {
      this.$Message.success(`保存成功, ${msg}`)
      this.pullCustomFilterList()
    } else {
      this.$Message.error(`保存失败, ${msg}`)
    }
  }
  async pullCustomFilterList() {
    this.regularLoading = true
    const result = await getHighFilterRules(this.type, {}, this.version)
    this.customFilter.list = result
    this.regularLoading = false
  }
  async handleOnDelRegular(id: number) {
    const { deleted, msg } = await delHighFilterRules(id, this.version)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.pullCustomFilterList()
    } else {
      this.$Message.error(`删除失败, ${msg}`)
    }
  }
  mounted() {
    this.pullCustomFilterList()
  }
}
</script>

<style scoped lang='less'>
.wrapper {
  .custom-filter-list {
    margin-top: 10px;
  }
}
</style>
