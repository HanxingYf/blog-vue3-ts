<template>
  <div class='label-truth-form'>
    <div class="label-title">标注Case</div>
    <div class="label-form">
      <NFilter 
        :configs="formObj"
        layout="vertically"
        :has-submit="false"
        :has-cancel="false"
        @on-get-submit="onGetSubmit"/>
    </div>
    <div class="label-action">
      <div class="label-action-btns">
        <ButtonGroup style="width: 100%">
          <Button style="width: 50%" :loading="loading" type="primary" @click="onSubmit('submit')">
            提交
          </Button>
          <Poptip style="width: 50%" confirm title="确认删除此项吗？" placement="top" @on-ok="onSubmit('delete')">
            <Button style="width: 100%" :loading="loading" type="error">
              删除
            </Button>
          </Poptip>
        </ButtonGroup>
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
import { TruthDatabaseListResItemI } from '@/presenter/truth.pre'


@Component({ components: { NFilter } })
export default class LabelTruthForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: TruthDatabaseListResItemI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: ''
    },
    tts: {
      type: 'select',
      label: '期望播报',
      value: 0,
      options: this.baseConfig.action,
      validate: () => {
        const { value, options } = this.formObj.tts
        return value && `${value}` && options!.find((op) => op.value == value) ? '' : '请选择期望播报'
      }
    },
    code: {
      type: 'select-img',
      label: '最佳Code',
      value: '',
      hide: true,
      options: [],
      validate: () => {
        const { value, options } = this.formObj.code
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择最佳code'
      }
    },
    cross_kind: {
      type: 'select',
      label: '路口形态',
      value: 0,
      options: this.baseConfig.cross_action,
      validate: () => {
        const { value, options } = this.formObj.cross_kind
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路口形态'
      }
    },
    assist1: {
      type: 'select',
      label: '辅助动作1',
      value: 0,
      options: this.baseConfig.assist_action,
      validate: () => {
        const { value, options } = this.formObj.assist1
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作1'
      }
    },
    assist2: {
      type: 'select',
      label: '辅助动作2',
      value: 0,
      hide: true,
      options: this.baseConfig.assist_action,
      validate: () => {
        const { value, options } = this.formObj.assist2
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作2'
      }
    }
  }

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }

  @Watch('curDataRow')
  async onCurDataRowChanged(val: TruthDatabaseListResItemI | null) {
    this.resetFormObj()
    if (val) {
      const { record_id, status, tts, true_value } = val
      const { assist_text, assist, code, cross_kind } = true_value
      this.formObj.record_id.value = record_id
      this.formObj.tts.value = tts
      this.$nextTick(() => {
        this.formObj.code.value = code
      })
      this.formObj.cross_kind.value = cross_kind
      this.formObj.assist1.value = assist.length ? assist[0] : 0,
      this.formObj.assist2.value = assist.length == 2 ? assist[1] : 0
    }
  }
  @Watch('formObj.tts', { deep: true })
  onTtsChanged(conf: FilterConfigI) {
    const { value, hide } = conf
    this.formObj.code.hide = !(!hide && value !== '0' && value)
    // 联动最佳code选择
    const o: any = {};
    (value || '').split(/[_]/).forEach((c: string) => {
      o[c] = c
    })
    this.formObj.code.options = Object.keys(o).map((k: string) => ({ label: k, value: +k }))
  }
  @Watch('formObj.assist1', { deep: true })
  onAssist1Changed(conf: FilterConfigI) {
    const { value, hide } = conf
    this.formObj.assist2.hide = !(!hide && value !== 0)
  }

  goSubmit: () => boolean = () => false
  onGetSubmit(cb: () => boolean) {
    this.goSubmit = cb
  }

  @Emit('on-submit')
  onEmitSubmit(type: 'submit' | 'delete') {
    const params: { [propName: string]: number | string } = {}
    for (const key in this.formObj) {
      if (this.formObj.hasOwnProperty(key)) {
        const item = this.formObj[key]
        const { hide, value, disabled } = item
        if (!hide && !disabled) {
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
  onSubmit(type: 'submit' | 'delete') {
    if (type === 'delete') {
      this.onEmitSubmit(type)
      return
    }
    const valid = this.goSubmit()
    if (!valid) {
      return
    }
    this.onEmitSubmit(type)
  }
  resetFormObj() {
  }
}
</script>

<style scoped lang='less'>
.label-truth-form {
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
