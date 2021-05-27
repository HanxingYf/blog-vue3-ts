<template>
  <div class='label-tick-form'>
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
import { EvaluationTickDetailListI } from '@/presenter/manager.pre'
import L, { LatLngLiteral } from 'leaflet'

@Component({ components: { NFilter } })
export default class LabelTickForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: EvaluationTickDetailListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: false }) readonly blind!: boolean
  @Prop({ type: Boolean, default: false }) readonly is_public_evaluation!: boolean
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: ''
    },
    path_consis: {
      type: 'select',
      label: '路线一致性',
      value: '',
      options: this.baseConfig.path_consis,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.path_consis
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路线一致性'
      }
    },
    cross_type: {
      type: 'select',
      label: '路口类型',
      value: '',
      options: this.baseConfig.cross_type,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.cross_type
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择路口类型'
      }
    },
    cross_sub_type: {
      type: 'select',
      label: '二级分类',
      value: '',
      options: this.cross_sub_type,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.cross_sub_type
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择二级分类'
      }
    },
    weight: {
      type: 'input-number',
      label: '路段道路等级',
      value: 0,
      disableCtl: !this.isMarkJob,
      validate: () => this.formObj.weight.value.toString() ? '' : '请选择路段道路等级'
    },
    turning_coor: {
      type: 'input',
      label: '路口转向点坐标',
      value: '',
      disableCtl: !this.isMarkJob,
      disabled: !this.isMarkJob,
      validate: () => this.formObj.turning_coor.value.toString() ? '' : '请输入路口转向点坐标'
    },
    start_turning_dis: {
      type: 'input-number',
      label: '起始至转向点距',
      value: 0,
      disabled: !this.isMarkJob,
      validate: () => this.formObj.start_turning_dis.value.toString() ? '' : '请输入起始至转向点距'
    },
    end_turning_dis: {
      type: 'input-number',
      label: '结束至转向点距',
      value: 0,
      disabled: !this.isMarkJob,
      validate: () => this.formObj.end_turning_dis.value.toString() ? '' : '请输入结束至转向点距'
    },
    div_turning_dis: {
      type: 'input-number',
      label: '分歧至转向点距',
      value: 0,
      disabled: !this.isMarkJob,
      validate: () => this.formObj.div_turning_dis.value.toString() ? '' : '请输入分歧至转向点距'
    },
    turning_dis: {
      type: 'input-number',
      label: '转向点偏差',
      value: 0,
      disabled: !this.isMarkJob,
      validate: () => this.formObj.turning_dis.value.toString() ? '' : '请输入转向点偏差'
    },
    tag: {
      type: 'select',
      label: '播报体验',
      value: '',
      disableCtl: !this.isMarkJob,
      options: this.baseConfig.voice_tag,
      validate: () => {
        const { value, options } = this.formObj.tag
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择播报体验'
      }
    },
    custom_mark: {
      type: 'input-textarea',
      label: '备注',
      value: '',
      disableCtl: !this.isMarkJob,
      placeholder: '备注'
    },
    issue_type1: {
      type: 'select',
      label: '问题类型',
      value: '',
      options: this.baseConfig.voice_issue_type1,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options, disabled } = this.formObj.issue_type1
        return disabled || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择问题类型'
      }
    },
    auto_move: {
      type: 'radio-group',
      label: '是否流转',
      value: 0,
      hide: true,
      options: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options } = this.formObj.auto_move
        return `${value}` && options!.find((op) => op.value == value) ? '' : '请选择是否流转'
      }
    },
    issue_type2: {
      type: 'select',
      label: '细分类',
      value: '',
      options: this.baseConfig.voice_issue_type2,
      disableCtl: !this.isMarkJob,
      validate: () => {
        const { value, options, disabled } = this.formObj.issue_type2
        return disabled || `${value}` && options!.find((op) => op.value == value) ? '' : '请选择细分类'
      }
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
  get submitDisabled() {
    const { path_consis, tag } = this.formObj
    // 路线一致且未评价，无法提交
    return path_consis.value == 0 && tag.value === 0
  }
  get cross_sub_type() {
    return this.baseConfig.cross_sub_type_map[this.formObj ? this.formObj.cross_type.value : -1]
  }

  @Watch('curDataRow')
  async onCurDataRowChanged(val: EvaluationTickDetailListI | null) {
    if (val) {
      const {
        voice_diff_record_id, id, path_consis,
        cross_type, cross_sub_type, weight, turning_coor,
        start_turning_dis, end_turning_dis, div_turning_dis, turning_dis,
        tag, custom_mark, issue_type1, auto_move, issue_type2, status
      } = val
      this.formObj.record_id.value = voice_diff_record_id
      this.formObj.path_consis.value = path_consis
      this.formObj.cross_type.value = cross_type
      this.formObj.weight.value = weight
      this.formObj.turning_coor.value = turning_coor
      this.formObj.start_turning_dis.value = start_turning_dis
      this.formObj.end_turning_dis.value = end_turning_dis
      this.formObj.div_turning_dis.value = div_turning_dis
      this.formObj.turning_dis.value = turning_dis
      this.formObj.tag.value = tag
      this.$nextTick(() => {
        this.formObj.cross_sub_type.value = cross_sub_type
        this.formObj.issue_type1.value = issue_type1
        this.formObj.issue_type2.value = issue_type2
        this.$nextTick(() => {
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
      this.formObj.custom_mark.value = custom_mark
      this.formObj.auto_move.value = auto_move
      const res = await getEvaluationRecord(id, 'tick')
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
    }
  }
  @Watch('formObj.cross_type.value')
  onCrossTypeChanged(val: number) {
    this.formObj.cross_sub_type.options = this.baseConfig.cross_sub_type_map[val] || []
  }
  @Watch('formObj.tag.value')
  onTagChanged(val: number) {
    this.formObj.issue_type1.disabled = val == 1
    this.formObj.issue_type2.disabled = val == 1
    if (val == 1) {
      this.formObj.issue_type1.value = -1
      this.formObj.issue_type2.value = -1
    }
  }
  @Watch('formObj.turning_coor.disabled')
  onTurningCoorChanged(val: boolean) {
    ['start_turning_dis', 'end_turning_dis', 'div_turning_dis', 'turning_dis'].forEach((key) => {
      this.formObj[key].disabled = val
    })
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
  onSubmit(type: 'submit' | 'accept' | 'reject') {
    const valid = this.goSubmit()
    if (!valid) {
      return
    }
    this.onEmitSubmit(type)
  }
  pointDistance(startPoint: string, endPoint: string) {
    if (startPoint === '' || endPoint === '') {
      return {
        dis: 0,
        vectorX: 0,
        vectorY: 0
      }
    }
    const startPoints = startPoint.split(',').map((e: any) => {
      return parseFloat(e)
    })
    const endPoints = endPoint.split(',').map((e: any) => {
      return parseFloat(e)
    })
    const start = L.latLng(startPoints[1], startPoints[0])
    const end = L.latLng(endPoints[1], endPoints[0])
    // 向量
    const vectorX = startPoints[0] - endPoints[0]
    const vectorY = startPoints[1] - endPoints[1]
    return {
      dis: Math.round(start.distanceTo(end)),
      vectorX,
      vectorY
    }
  }
  computeVector(startX: number, startY: number, endX: number, endY: number) {
    const temp = startX * endX + startY * endY
    return temp >= 0 ? 1 : -1
  }

  mounted() {
    window.eventBus.$on('click-nearby-link', (kind: string) => {
      // 道路等级 过滤点(10ff)
      if (kind !== '10ff') {
        const weight = kind.slice(0, 2)
        if (weight !== '0a' && weight !== '0b') {
          this.formObj.weight.value = parseInt(weight, 10)
        }
      }
    })
    window.eventBus.$on('as-turn-coor', (latlng: LatLngLiteral) => {
      const { lat, lng } = latlng
      this.formObj.turning_coor.value = `${lng.toFixed(5)},${lat.toFixed(5)}`
      if (!this.curDataRow) {
        return
      }
      const lnglat = `${lng},${lat}`
      const { didi_act_start_coor, didi_act_end_coor, didi_code_fix_coor } = this.curDataRow
      const startTurning = this.pointDistance(didi_act_start_coor, lnglat) // start->转向点
      const endTurning = this.pointDistance(didi_act_end_coor, lnglat) // end->转向点
      const startToEnd = this.pointDistance(didi_act_start_coor, didi_act_end_coor) // start->end
      const divTurning = this.pointDistance(lnglat, didi_code_fix_coor) // code点
      const startVector = this.computeVector(
        startToEnd.vectorX, startToEnd.vectorY,
        startTurning.vectorX, startTurning.vectorY
      )
      const endVector = this.computeVector(
        startToEnd.vectorX, startToEnd.vectorY,
        endTurning.vectorX, endTurning.vectorY
      )
      this.formObj.start_turning_dis.value = startTurning.dis * startVector
      this.formObj.end_turning_dis.value = endTurning.dis * endVector
      this.formObj.turning_dis.value = divTurning.dis
    })
  }
}
</script>

<style scoped lang='less'>
.label-tick-form {
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
