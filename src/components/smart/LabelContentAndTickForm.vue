<template>
  <div class="label-content-form">
    <div class="label-title">标注Case</div>
    <div class="label-form">
      <NFilter
        :configs="formObj"
        layout="vertically"
        :has-submit="false"
        :has-cancel="false"
        :has-switch="!isMarkJob"
        @on-get-submit="onGetSubmit"
      />
    </div>
    <div class="label-action">
      <div class="label-action-btns">
        <template v-if="isMarkJob">
          <Button
            :loading="loading"
            type="primary"
            @click="onSubmit('submit')"
            :disabled="submitDisabled"
            >提交</Button
          >
        </template>
        <template v-else>
          <ButtonGroup style="width: 100%">
            <Button
              style="width: 50%"
              :loading="loading"
              type="primary"
              @click="onSubmit('accept')"
              :disabled="submitDisabled"
            >
              通过
            </Button>
            <Button
              style="width: 50%"
              :loading="loading"
              type="error"
              @click="onSubmit('reject')"
              :disabled="submitDisabled"
            >
              驳回
            </Button>
          </ButtonGroup>
        </template>
        <ButtonGroup style="width: 100%">
          <Button
            style="width: 50%"
            @click="onPreOrNext(false)"
            :disabled="!disabledPrevNext.prev"
          >
            <Icon type="ios-arrow-back" />上一个
          </Button>
          <Button
            style="width: 50%"
            @click="onPreOrNext(true)"
            :disabled="!disabledPrevNext.next"
          >
            下一个<Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { EvaluationContentAndTickDetailListI, getEvaluationRecord } from '@/presenter/manager.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { EvaluationContentDetailListI } from '@/presenter/manager.pre'
import { ValueConfig } from '@/types'
import queryString from 'query-string'
import { LatLngLiteral } from 'leaflet'

@Component({ components: { NFilter } })
export default class LabelContentAndTickForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationContentAndTickDetailListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: false }) readonly blind!: boolean
  @Prop({ type: Boolean, default: false }) readonly is_public_evaluation!: boolean
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  @Prop({ type: String, default: '' }) readonly record_id!: '' // 评测|质检

  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Case ID',
      value: ''
    },
    content_tag: {
      type: 'select',
      label: '播报内容评价',
      value: '',
      options: this.jenkins_content_tag,
      disableCtl: !this.isMarkJob,
    },
    content_err_type: {
      type: 'input',
      label: '内容错误分类',
      value: '',
      disableCtl: !this.isMarkJob,
    },
    content_err_reason: {
      type: 'input',
      label: '内容原因分析',
      value: '',
      disableCtl: !this.isMarkJob,
    },
    pos_tag: {
      type: 'select',
      label: '播报时机评价',
      value: '',
      options: this.jenkins_pos_tag,
      disableCtl: !this.isMarkJob,
    },
    pos_err_type: {
      type: 'input',
      label: '时机错误分类',
      value: '',
      disableCtl: !this.isMarkJob,
    },
    pos_err_reason: {
      type: 'input-textarea',
      label: '时机原因分析',
      value: '',
      disableCtl: !this.isMarkJob,
    },
    mark_result: {
      type: 'input-textarea',
      label: '评测结果记录',
      value: '',
      hide: this.is_public_evaluation, // 众验则隐藏
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
  submitDisabled: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }

  get jenkins_pos_tag() {
    return this.baseConfig.jenkins_pos_tag
  }
  get jenkins_pos_tag_match() {
    return this.parseToMapObj(this.jenkins_pos_tag)
  }
  get jenkins_content_tag() {
    return this.baseConfig.jenkins_content_tag
  }
  get jenkinsContentTagMatch() {
    return this.parseToMapObj(this.jenkins_content_tag)
  }
  parseToMapObj(configs: ValueConfig[]) {
    const mapObj: { [propName: string]: string } = {}
    configs.forEach((c) => {
      mapObj[c.value] = c.label
    })
    return mapObj
  }

  @Watch('curDataRow')
  async onCurDataRowChanged(val: EvaluationContentAndTickDetailListI | null) {
    if (val) {
      const {
        jenkins_diff_record_id, content_tag, content_err_type, content_err_reason, pos_err_type, pos_err_reason, pos_tag, id
      } = val
      // console.log(content_tag, '___+_+_+');
      this.$nextTick(() => {
      })
      this.formObj.record_id.value = jenkins_diff_record_id
      this.formObj.content_tag.value = content_tag
      this.formObj.content_err_type.value = content_err_type
      this.formObj.content_err_reason.value = content_err_reason
      this.formObj.pos_tag.value = pos_tag
      this.formObj.pos_err_type.value = pos_err_type
      this.formObj.pos_err_reason.value = pos_err_reason
      const res = await getEvaluationRecord(id, 'contentAndTick')
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
      if (!this.isMarkJob) {
        for (const key in this.formObj) {
          if (this.formObj.hasOwnProperty(key)) {
            if (typeof this.formObj[key].disableCtl === 'boolean') {
              this.formObj[key].disabled = true
            }
          }
        }
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
        const { value } = item
        if (['content_tag', 'content_err_type', 'content_err_reason', 'pos_tag', 'pos_err_type', 'pos_err_reason', 'mark_result', 'verify_result'].includes(key)) {
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
    // console.log('onsubmit','+');
    const valid = this.goSubmit()
    if (!valid) {
      return
    }
    this.onEmitSubmit(type)
  }
  mounted() {
    window.eventBus.$on('as-issue-coor', (latlng: LatLngLiteral) => {
      const { lat, lng } = latlng
      this.formObj.issue_point.value = `${lng.toFixed(5)},${lat.toFixed(5)}`
    })
  }
}
</script>

<style scoped lang='less'>
.label-content-form {
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
