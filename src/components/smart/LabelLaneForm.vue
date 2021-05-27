<template>
  <div class='label-lane-form'>
    <div class="label-title">标注Case</div>
    <div class="label-form">
      <NFilter 
        :configs="formObj"
        layout="vertically"
        :has-submit="false"
        :has-cancel="false"
        :has-switch="!isMarkJob"
        @on-get-submit="onGetSubmit"/>
    </div>
    <div class="label-action">
      <div class="label-action-btns">
        <template v-if="isMarkJob">
          <Button :loading="loading" type="primary" @click="onSubmit('submit')">提交</Button>
        </template>
        <template v-else>
          <ButtonGroup style="width: 100%">
            <Button style="width: 50%" :loading="loading" type="primary" @click="onSubmit('accept')">
              通过
            </Button>
            <Button style="width: 50%" :loading="loading" type="error" @click="onSubmit('reject')">
              驳回
            </Button>
          </ButtonGroup>
        </template>
        <ButtonGroup style="width: 100%">
          <Button style="width: 50%" @click="onPreOrNext(false)" :disabled="!disabledPrevNext.prev">
            <Icon type="ios-arrow-back" />上一个
          </Button>
          <Button style="width: 50%" @click="onPreOrNext(true)" :disabled="!disabledPrevNext.next">
            下一个<Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { ValueConfig } from '@/types'
import queryString from 'query-string'
import { LatLngLiteral } from 'leaflet'
import * as lanelineManager from '@/models/manager/laneline'

@Component({ components: { NFilter } })
export default class LabelLaneForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: lanelineManager.LanelineEvaluationCaseListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: '',
      disabled: true
    },
    path_consis: {
      type: 'select',
      label: '路口一致性',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.path_consis,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.path_consis
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路口一致性'
      }
    },
    tag: {
      type: 'select',
      label: '内容评价结论',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.lane_content_tag,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.tag
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择内容评价结论'
      }
    },
    lane_issue_type: {
      type: 'select',
      label: '内容问题类型',
      value: 0,
      hide: true,
      defaultVal: 0,
      options: this.baseConfig.lane_issue_type,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.lane_issue_type
        return value && options!.find((op) => op.value == value) ? '' : '请选择内容问题类型'
      }
    },
    display_tag: {
      type: 'select',
      label: '时机评价结论',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.lane_display_tag,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.display_tag
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择时机评价结论'
      }
    },
    custom_mark: {
      type: 'input-textarea',
      label: '备注',
      value: '',
      placeholder: '备注',
      disableCtl: !this.isMarkJob,
    },
    mark_result: {
      type: 'input-textarea',
      label: '评测结果记录',
      value: '',
      // hide: this.is_public_evaluation, // 众验则隐藏
      placeholder: '评测结果记录',
      disabled: true
    },
    verify_result: {
      type: 'input-textarea',
      label: '质检结果记录',
      value: '',
      placeholder: '质检结果记录',
      disabled: true
    }
  }

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }

  @Watch('formObj.tag.value')
  onTagChanged(val: number) {
    // 竞品好 | 两方都不好
    if (val === 2 || val === 4) {
      this.formObj.lane_issue_type.hide = false
    } else {
      this.formObj.lane_issue_type.hide = true
      this.formObj.lane_issue_type.value = 0
    }
  }

  @Watch('curDataRow')
  async onCurDataRowChanged(val: lanelineManager.LanelineEvaluationCaseListI | null) {
    if (val) {
      const {
        lane_diff_record_id, id, display_tag,
        path_consis, tag, lane_issue_type, custom_mark, status
      } = val
      this.formObj.record_id.value = lane_diff_record_id
      this.formObj.path_consis.value = path_consis
      this.formObj.tag.value = tag
      this.formObj.display_tag.value = display_tag
      this.formObj.lane_issue_type.value = lane_issue_type
      this.formObj.custom_mark.value = custom_mark
      if (!this.isMarkJob) {
        for (const key in this.formObj) {
          if (this.formObj.hasOwnProperty(key)) {
            if (typeof this.formObj[key].disableCtl === 'boolean') {
              this.formObj[key].disabled = true
            }
          }
        }
      }
      const res = await lanelineManager.getMarkRecord(id)
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
    }
  }

  goSubmit: () => boolean = () => false
  onGetSubmit(cb: () => boolean) {
    this.goSubmit = cb
  }

  @Emit('on-submit')
  onEmitSubmit(type: 'submit' | 'accept' | 'reject') {
    const params: { [propName: string]: number | string } = {}
    for (const key in this.formObj) {
      if (this.formObj.hasOwnProperty(key)) {
        const item = this.formObj[key]
        const { hide, value, disabled, type } = item
        if (!['mark_result', 'verify_result'].includes(key)) {
          params[key] = value
        }
      }
    }
    return { type, params }
  }
  @Emit('on-pre-or-next')
  onPreOrNext(isNext: boolean) {
    return isNext
  }
  onSubmit(type: 'submit' | 'accept' | 'reject') {
    const valid = this.goSubmit()
    if (!valid) {
      return
    }
    this.onEmitSubmit(type)
  }
}
</script>

<style scoped lang='less'>
.label-lane-form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .label-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    padding: 5px 0;
    background-color: aliceblue;
  }
  .label-form {
    flex: 1;
    overflow-y: scroll;
  }
  .label-action {
    width: 100%;
    background-color: aliceblue;
    padding: 10px 0;
    .label-action-btns {
      width: 50%;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(1, 100%);
      grid-row-gap: 10px;
    }
  }
}
</style>
