<template>
  <div class='label-content-form'>
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
          <Button :loading="loading" type="primary" @click="onSubmit('submit')" :disabled="submitDisabled">提交</Button>
        </template>
        <template v-else>
          <ButtonGroup style="width: 100%">
            <Button style="width: 50%" :loading="loading" type="primary" @click="onSubmit('accept')" :disabled="submitDisabled">
              通过
            </Button>
            <Button style="width: 50%" :loading="loading" type="error" @click="onSubmit('reject')" :disabled="submitDisabled">
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
import { EvaluationContentDetailListI } from '@/presenter/manager.pre'
import { ValueConfig } from '@/types'
import queryString from 'query-string'
import { LatLngLiteral } from 'leaflet'

@Component({ components: { NFilter } })
export default class LabelContentForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationContentDetailListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: false }) readonly blind!: boolean
  @Prop({ type: Boolean, default: false }) readonly is_public_evaluation!: boolean
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
      label: '路线一致性',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.path_consis,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.path_consis
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路线一致性'
      }
    },
    tag: {
      type: 'select',
      label: '评价结论',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.manual_tag,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.tag
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择评价结论'
      }
    },
    expect_action: {
      type: 'select',
      label: '期望播报',
      value: '0',
      defaultVal: '',
      hide: true,
      options: this.baseConfig.action,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.expect_action
        return value && `${value}` && options!.find((op) => op.value == value) ? '' : '请选择期望播报'
      }
    },
    best_code: {
      type: 'select-img',
      label: '最佳Code',
      value: 0,
      defaultVal: 0,
      hide: true,
      options: [],
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.best_code
        return value && options!.find((op) => op.value == value) ? '' : '请选择最佳code'
      }
    },
    cross_shape: {
      type: 'select',
      label: '路口形态',
      value: 0,
      defaultVal: 0,
      hide: true,
      options: this.baseConfig.cross_action,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.cross_shape
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路口形态'
      }
    },
    assist1: {
      type: 'select',
      label: '辅助动作1',
      value: 0,
      defaultVal: 0,
      hide: true,
      options: this.baseConfig.assist_action,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.assist1
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作1'
      }
    },
    assist2: {
      type: 'select',
      label: '辅助动作2',
      value: 0,
      defaultVal: 0,
      hide: true,
      options: this.baseConfig.assist_action,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.assist2
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择辅助动作2'
      }
    },
    issue_type: {
      type: 'select',
      label: '问题类型',
      value: 2,
      defaultVal: 0,
      options: this.baseConfig.issue_type,
      hide: true,
      disableCtl: !this.isMarkJob,
      validate: this.is_public_evaluation && !this.isMarkJob ? undefined : () => {
        const { value, options } = this.formObj.issue_type
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择问题类型'
      }
    },
    err_level: {
      type: 'select',
      label: '问题等级',
      value: 1,
      defaultVal: 0,
      options: this.baseConfig.err_level,
      hide: true,
      disableCtl: !this.isMarkJob,
      validate: this.is_public_evaluation && !this.isMarkJob ? undefined : () => {
        const { value, options } = this.formObj.err_level
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择问题等级'
      }
    },
    issue_sub_type: {
      type: 'select',
      label: '问题原因',
      value: 1,
      defaultVal: 0,
      disableCtl: !this.isMarkJob,
      options: this.baseConfig.road_issue_net,
      hide: true,
      validate: () => {
        const { value, options } = this.formObj.issue_sub_type
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择问题原因'
      }
    },
    issue_solution: {
      type: 'select',
      label: '解决办法',
      value: 1,
      defaultVal: 0,
      disableCtl: !this.isMarkJob,
      options: this.baseConfig.issue_solution,
      hide: true,
      validate: () => {
        const { value, options } = this.formObj.issue_solution
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择解决办法'
      }
    },
    navigate: {
      type: 'button',
      label: '跳转强制诱导',
      value: '',
      click: () => {
        if (!this.curDataRow) {
          return
        }
        const { link_list, map_ver } = this.curDataRow
        const { best_code, assist1, assist2, custom_mark } = this.formObj
        const link_list_arr = link_list.split(',')
        const inlink = link_list_arr[0]
        const outlink = link_list_arr[link_list_arr.length - 1]
        const passlinks = link_list_arr.slice(1, link_list_arr.length - 1).join(',')
        const url = `http://10.89.110.12:8070/#/code/nav-new?` + queryString.stringify({
          inlink,
          outlink,
          passlinks,
          roadver: map_ver,
          from: 'navicompass',
          maincode: best_code.value,
          assist: `${assist1.value},${assist2.value}`,
          type: 1,
          remark: custom_mark.value
        })
        window.open(url, '_blank')
      },
      hide: true
    },
    auto_move: {
      type: 'radio-group',
      label: '是否流转',
      value: 0,
      defaultVal: 0,
      options: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
      hide: true,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.auto_move
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择是否流转'
      }
    },
    issue_point: {
      type: 'input',
      label: '问题点',
      value: '',
      defaultVal: '',
      placeholder: 'lng,lat',
      disableCtl: !this.isMarkJob,
      validate: () => this.formObj.issue_point.value ? '' : '请输入问题点',
      hide: true
    },
    issue_status: {
      type: 'select',
      label: '问题状态',
      value: 0,
      defaultVal: 0,
      options: this.baseConfig.issue_status,
      disableCtl: !this.isMarkJob,
      hide: true,
      validate: () => {
        const { value, options } = this.formObj.issue_status
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择问题状态'
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

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  calc_manual_tag() {
    const { blind } = this
    const { sort_site } = this.curDataRow || { sort_site: 1 }
    let manual_tag = this.baseConfig.manual_tag
    const item2 = manual_tag[2] // 竞品 2
    const item3 = manual_tag[3] // 滴滴 3
    const isLeftRivalRightDidi = sort_site === 2
    manual_tag = [
      ...manual_tag.slice(0, 2),
      // 竞品
      {
        label: blind ? (isLeftRivalRightDidi ? '左边好' : '右边好') : item2.label,
        value: item2.value
      },
      // 滴滴
      {
        label: blind ? (isLeftRivalRightDidi ? '右边好' : '左边好') : item3.label,
        value: item3.value
      },
      ...manual_tag.slice(4),
    ]
    this.formObj.tag.options = manual_tag
  }
  get submitDisabled() {
    const { path_consis, tag } = this.formObj
    // 路线一致且未评价，无法提交
    return path_consis.value == 0 && tag.value === 0
  }

  @Watch('curDataRow')
  async onCurDataRowChanged(val: EvaluationContentDetailListI | null) {
    if (val) {
      const {
        code_diff_record_id, id, sort_site, err_level,
        path_consis, tag, expect_action, best_code, cross_shape,
        assist1, assist2, custom_mark, issue_type, issue_sub_type,
        issue_solution, auto_move, issue_point, issue_status, status
      } = val
      this.calc_manual_tag()
      this.formObj.record_id.value = code_diff_record_id
      this.formObj.path_consis.value = path_consis
      // 由于联动逻辑，这里也需要注意时序（谁影响谁）
      this.$nextTick(() => {
        this.formObj.tag.value = tag
        this.$nextTick(() => {
          this.formObj.expect_action.value = expect_action
          this.$nextTick(() => {
            this.formObj.best_code.value = best_code
          })
          this.formObj.cross_shape.value = cross_shape
          this.formObj.assist1.value = assist1
          this.$nextTick(() => {
            this.formObj.assist2.value = assist2
          })
          this.formObj.err_level.value = err_level
          this.formObj.issue_type.value = issue_type
          this.$nextTick(() => {
            this.formObj.issue_sub_type.value = issue_sub_type
            this.formObj.issue_solution.value = issue_solution
            this.formObj.auto_move.value = auto_move
            this.formObj.issue_point.value = issue_point
            this.formObj.issue_status.value = issue_status
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
        })
      })
      this.formObj.custom_mark.value = custom_mark
      const res = await getEvaluationRecord(id, 'content')
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
    }
  }

  @Watch('formObj.path_consis.value')
  onPathConsisChanged(val: number) {
    // 路线不一致
    if (val == 1) {
      this.formObj.tag.value = 6 // 路线不一致
      this.formObj.tag.disabled = this.is_public_evaluation ? false : true // 无法选择
    } else {
      this.formObj.tag.value = 0
      if (this.isMarkJob) {
        this.formObj.tag.disabled = false
      }
    }
  }
  @Watch('formObj.tag.value')
  onTagChanged(val: number) {
    // {label: "未评价", value: 0}
    // {label: "两方都好", value: 1}
    // {label: "竞品好", value: 2}-
    // {label: "滴滴好", value: 3}
    // {label: "两方都不好", value: 4}-
    // {label: "自定义", value: 5}
    // {label: "路线不一致", value: 6}
    // {label: "路网不一致", value: 7}
    // {label: "策略修复", value: 8}
    // {label: "不是badcase", value: 9}
    // {label: "无法确定", value: 10}
    const $1 = ([1, 2, 3, 4].includes(+val)) && !this.is_public_evaluation
    const $2 = this.is_public_evaluation && !this.isMarkJob ? // 众验且质检时
      ([2, 4].includes(+val)) :
      ([2, 4, 5].includes(+val) || ([2, 3, 4].includes(+val) && this.blind)) && !this.is_public_evaluation;
    ([
      'expect_action',
      'cross_shape',
      'assist1'
    ]).forEach((key) => {
      this.formObj[key]['hide'] = !$1
      this.formObj[key]['value'] = this.formObj[key].defaultVal
    });
    (this.is_public_evaluation && !this.isMarkJob ? ['issue_type', 'err_level'] : [
      'issue_type'
    ]).forEach((key) => {
      this.formObj[key]['hide'] = !$2
      this.formObj[key]['disabled'] = !$2
      this.formObj[key]['value'] = this.formObj[key].defaultVal
    })
  }
  @Watch('formObj.expect_action', { deep: true }) // 期望动作联动最佳code
  onExpectActionChanged(conf: FilterConfigI) {
    const { value, hide, defaultVal } = conf
    this.formObj.best_code.hide = !(!hide && value !== '0' && value)
    this.formObj.best_code.value = 0
    // 联动最佳code选择
    const o: any = {};
    (value || '').split(/[_]/).forEach((c: string) => {
      o[c] = c
    })
    this.formObj.best_code.options = Object.keys(o).map((k: string) => ({ label: k, value: +k }))
  }
  @Watch('formObj.assist1', { deep: true })
  onAssist1Changed(conf: FilterConfigI) {
    const { value, hide, defaultVal } = conf
    this.formObj.assist2.hide = !(!hide && value !== 0)
    this.formObj.assist2.value = defaultVal
  }
  @Watch('formObj.issue_type', { deep: true })
  onIssueTypeChanged(conf: FilterConfigI) {
    if (this.is_public_evaluation && !this.isMarkJob) {
      return
    }
    const { value, hide } = conf
    const is1 = !(!hide && value === 1);
    const is2 = !(!hide && value === 2);
    (['issue_sub_type', 'auto_move', 'issue_point']).forEach((key) => {
      this.formObj[key]['hide'] = is1
      this.formObj[key]['value'] = this.formObj[key].defaultVal
    });
    (['issue_solution']).forEach((key) => {
      this.formObj[key]['hide'] = is2
      this.formObj[key]['value'] = this.formObj[key].defaultVal
    });
    (['issue_status']).forEach((key) => {
      this.formObj[key]['hide'] = hide || (is1 && is2)
      this.formObj[key]['value'] = this.formObj[key].defaultVal
    })
  }
  @Watch('formObj.issue_solution', { deep: true })
  onIssueSoluationChanged(conf: FilterConfigI) {
    const { value, hide } = conf
    this.formObj.navigate.hide = !(!hide && value === 2)
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
        if (!['mark_result', 'verify_result', 'navigate'].includes(key)) {
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
