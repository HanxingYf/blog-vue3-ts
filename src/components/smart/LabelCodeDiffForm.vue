<template>
  <div class='label-codediff-form'>
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
          <Button :loading="loading" type="primary" @click="onSubmit('submit')" >提交</Button>
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
import { getEvaluationRecord } from '@/presenter/manager.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { EvaluationCodeDiffDetailListI } from '@/presenter/manager.pre'
import L, { LatLngLiteral } from 'leaflet'
import { parseToMapObj } from '@/utils'
import { ValueConfig } from '@/types';

@Component({ components: { NFilter } })
export default class LabelCodeDiffForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationCodeDiffDetailListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: ''
    },
    ori_code: {
      type: 'text',
      label: '线上版本code',
      value: ''
    },
    ori_assi_code1: {
      type: 'text',
      label: '辅助动作1',
      value: ''
    },
    ori_assi_code2: {
      type: 'text',
      label: '辅助动作2',
      value: ''
    },
    final_code: {
      type: 'text',
      label: '新策略版本code',
      value: ''
    },
    final_assi_code1: {
      type: 'text',
      label: '辅助动作1',
      value: ''
    },
    final_assi_code2: {
      type: 'text',
      label: '辅助动作2',
      value: ''
    },
    tag: {
      type: 'select',
      label: 'GSB',
      value: '',
      defaultVal: '',
      options: this.baseConfig.self_tag,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.tag
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择GSB'
      }
    },
    err_level: {
      type: 'select',
      label: '错误等级',
      value: '',
      defaultVal: -2,
      options: this.baseConfig.err_level,
      disableCtl: !this.isMarkJob,
      hide: true,
      validate: () => {
        const { value, options } = this.formObj.err_level
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择错误等级'
      }
    },
    truth_code: {
      type: 'select-img',
      label: 'Code真值',
      value: -1,
      defaultVal: -1,
      options: this.codeList,
      disableCtl: !this.isMarkJob,
      disabled: !this.isMarkJob,
      hide: true,
      validate: () => {
        const { value, options } = this.formObj.truth_code
        return value || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择code真值'
      }
    },
    truth_assi_code1: {
      type: 'select',
      label: '辅助动作1',
      value: -1,
      defaultVal: -1,
      hide: true,
      options: this.baseConfig.assist_action,
      disableCtl: !this.isMarkJob,
      disabled: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.truth_assi_code1
        return value || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作1'
      }
    },
    truth_assi_code2: {
      type: 'select',
      label: '辅助动作2',
      value: -1,
      defaultVal: -1,
      hide: true,
      options: this.baseConfig.assist_action,
      disableCtl: !this.isMarkJob,
      disabled: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.truth_assi_code2
        return value || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作2'
      }
    },
    custom_mark: {
      type: 'input-textarea',
      label: '备注',
      value: '',
      defaultVal: '',
      disableCtl: !this.isMarkJob,
      placeholder: '备注'
    },
    mark_result: {
      type: 'input-textarea',
      label: '评测结果记录',
      value: '',
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
  get codeList(): ValueConfig[] {
    const codeMatch = this.baseConfig.action
    const codeList: ValueConfig[] = []
    codeMatch.forEach((cm) => {
      const { label, value } = cm
      if (`${value}`.includes('_')) {
        `${value}`.split('_').forEach((code) => {
          codeList.push({ label: `${label}-${code}`, value: +code })
        })
      } else {
        codeList.push({ label: `${label}-${value}`, value: +value })
      }
    })
    return codeList
  }
  get matchCode() {
    return parseToMapObj(this.baseConfig.all_code_action)
  }
  get matchAssiCode() {
    return parseToMapObj(this.baseConfig.assist_action)
  }
  get matchSelfTag() {
    return parseToMapObj(this.baseConfig.self_tag)
  }
  get matchErrLevel() {
    return parseToMapObj(this.baseConfig.err_level)
  }
  @Watch('curDataRow')
  async onCurDataRowChanged(val: EvaluationCodeDiffDetailListI | null) {
    if (val) {
      const {
        self_diff_record_id, ori_code, ori_assi_code, id,
        final_code, final_assi_code, tag, err_level, truth_code,
        truth_assi_code1, truth_assi_code2, custom_mark
      } = val
      this.formObj.record_id.value = self_diff_record_id
      this.formObj.ori_code.value = this.matchCode[ori_code] ? this.matchCode[ori_code].replace(/\-\d+/, '') : ori_code
      const ori_assi_code_1_2 = ori_assi_code.split(',')
      this.formObj.ori_assi_code1.value = this.matchAssiCode[ori_assi_code_1_2[0]] ? this.matchAssiCode[ori_assi_code_1_2[0]].replace(/\-\d+/, '') : ori_assi_code_1_2[0]
      this.formObj.ori_assi_code2.value = this.matchAssiCode[ori_assi_code_1_2[1]] ? this.matchAssiCode[ori_assi_code_1_2[1]].replace(/\-\d+/, '') : ori_assi_code_1_2[1]
      this.formObj.ori_assi_code1.hide = !this.formObj.ori_assi_code1.value
      this.formObj.ori_assi_code2.hide = !this.formObj.ori_assi_code2.value
      const final_assi_code_1_2 = final_assi_code.split(',')
      this.formObj.final_code.value = this.matchCode[final_code] ? this.matchCode[final_code].replace(/\-\d+/, '') : final_code
      this.formObj.final_assi_code1.value = this.matchAssiCode[final_assi_code_1_2[0]] ? this.matchAssiCode[final_assi_code_1_2[0]].replace(/\-\d+/, '') : final_assi_code_1_2[0]
      this.formObj.final_assi_code2.value = this.matchAssiCode[final_assi_code_1_2[1]] ? this.matchAssiCode[final_assi_code_1_2[1]].replace(/\-\d+/, '') : final_assi_code_1_2[1]
      this.formObj.final_assi_code1.hide = !this.formObj.final_assi_code1.value
      this.formObj.final_assi_code2.hide = !this.formObj.final_assi_code2.value
      this.formObj.tag.value = tag
      this.$nextTick(() => {
        this.formObj.err_level.value = err_level
        this.formObj.truth_code.value = truth_code
        this.formObj.truth_assi_code1.value = truth_assi_code1
        this.formObj.truth_assi_code2.value = truth_assi_code2
        if (!this.isMarkJob) {
          for (const key in this.formObj) {
            if (this.formObj.hasOwnProperty(key)) {
              if (typeof this.formObj[key].disableCtl === 'boolean') {
                this.formObj[key].disabled = true
              }
            }
          }
        }
      })
      this.formObj.custom_mark.value = custom_mark
      const res = await getEvaluationRecord(id, 'codediff')
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
    }
  }
  @Watch('formObj.tag.value')
  onTagChanged(val: number) {
    this.formObj.err_level.hide = val != 3
    this.formObj.err_level.value =  this.formObj.err_level.defaultVal
    this.formObj.truth_code.hide = val == 1 || val == 2 // good || same 不标真值
    this.formObj.truth_code.value = this.formObj.truth_code.defaultVal
    this.formObj.truth_assi_code1.hide = this.formObj.truth_assi_code2.hide = val == 1 || val == 2 // good || same 不标真值辅助动作
    this.formObj.truth_assi_code1.value = this.formObj.truth_assi_code1.defaultVal
    this.formObj.truth_assi_code2.value = this.formObj.truth_assi_code2.defaultVal
    const validateTrCo = [1, 2].includes(+val) ? () => {
      const { value, options } = this.formObj.truth_code
      return value || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择code真值'
    } : undefined
    const validateTrCoAssi = [1, 2].includes(+val) ? () => {
      const { value, options } = this.formObj.truth_assi_code1
      return value || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作'
    } : undefined
    this.formObj.truth_code.validate = validateTrCo
    this.formObj.truth_assi_code1.validate = validateTrCoAssi
    this.formObj.truth_assi_code2.validate = validateTrCoAssi

    if (!this.isMarkJob) {
      this.formObj.err_level.disabled = !(val == 3) || this.formObj.tag.disabled
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
        const { hide, value, disabled, type, validate, defaultVal } = item
        if (['tag', 'err_level', 'truth_code', 'truth_assi_code1', 'truth_assi_code2', 'custom_mark'].includes(key)) {
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
.label-codediff-form {
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
