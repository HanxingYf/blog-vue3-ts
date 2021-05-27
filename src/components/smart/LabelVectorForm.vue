<template>
  <div class='label-vector-form'>
    <div class="label-title">标注Case</div>
    <div class="label-form">
      <NFilter 
        :configs="formObj"
        layout="vertically"
        :has-submit="false"
        :has-cancel="false"
        :has-switch="!isMarkJob"
        @on-get-submit="onGetSubmit($event, 'formObj')">
        <template slot="tag">
          <Collapse value="1" accordion size="small">
            <Panel name="1">
              展示内容问题分类
              <template slot="content">
                <NFilter 
                  :configs="formObjForTag"
                  layout="vertically"
                  :has-submit="false"
                  :has-cancel="false"
                  @on-get-submit="onGetSubmit($event, 'formObjForTag')"/>
              </template>
            </Panel>
          </Collapse>
        </template>
        <template slot="beauty">
          <Collapse value="1" accordion size="small">
            <Panel name="1">
              美观问题分类
              <template slot="content">
                <NFilter 
                  :configs="formObjForBeauty"
                  layout="vertically"
                  :has-submit="false"
                  :has-cancel="false"
                  @on-get-submit="onGetSubmit($event, 'formObjForBeauty')"/>
              </template>
            </Panel>
          </Collapse>
        </template>
      </NFilter>
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
import * as vectorManager from '@/models/manager/vector'

@Component({ components: { NFilter } })
export default class LabelVectorForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: vectorManager.VectorEvaluationCaseListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Boolean, default: true }) readonly isMarkJob!: boolean // 评测|质检
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: '',
      disabled: true
    },
    better_version: {
      type: 'select',
      label: '版本评价',
      value: 0,
      hide: false,
      disableCtl: !this.isMarkJob,
      options: [],
      validate: () => this.formObj.better_version.value ? '' : '请选择版本评价'
    },
    should_recall: {
      type: 'radio-group',
      label: '策略是否应召回',
      value: 0,
      disableCtl: !this.isMarkJob,
      options: this.baseConfig.enlarge_map_should_recall,
      validate: () => this.formObj.should_recall.value ? '' : '请选择策略是否应召回'
    },
    tag: {
      type: 'radio-group',
      label: '展示内容准确性',
      value: 0,
      slot: 'tag',
      disableCtl: !this.isMarkJob,
      disabled: false,
      showSlot: false,
      hide: true,
      options: this.baseConfig.enlarge_map_tag,
      validate: () => {
        if (this.formObj.tag.value) {
          // 不准确
          if (this.formObj.tag.value === 2) {
            const atLeastOne = Object.keys(this.formObjForTag).some((k) => {
              return k === 'show_range' ? this.formObjForTag[k].value : this.formObjForTag[k].value.length
            })
            return atLeastOne ? '' : '请至少选择一个展示内容问题！'
          }
          return ''
        } else {
          return '请选择展示内容准确性'
        }
      }
    },
    beauty: {
      type: 'radio-group',
      label: '美观度',
      value: 0,
      slot: 'beauty',
      disableCtl: !this.isMarkJob,
      disabled: false,
      showSlot: false,
      hide: true,
      options: this.baseConfig.enlarge_map_beauty,
      validate: () => {
        if (this.formObj.beauty.value) {
          // 不美观
          if (this.formObj.beauty.value === 2) {
            const atLeastOne = Object.keys(this.formObjForBeauty).some((k) => {
              return this.formObjForBeauty[k].value.length
            })
            return atLeastOne ? '' : '请至少选择一个美观问题！'
          }
          return ''
        } else {
          return '请选择美观度'
        }
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
  formObjForTag: { [propName: string]: FilterConfigI } = {
    show_range: {
      type: 'radio-group',
      label: '展示范围',
      value: '',
      options: [{ label: '偏大', value: 1 }, { label: '偏小', value: 2 }]
    },
    road_issue: {
      type: 'checkbox-group',
      label: '道路问题',
      value: [],
      options: this.baseConfig.enlarge_map_issue_road
    },
    arrow_issue: {
      type: 'checkbox-group',
      label: '诱导箭头',
      value: [],
      options: this.baseConfig.enlarge_map_issue_arrow
    },
    other_issue: {
      type: 'checkbox-group',
      label: '其他页面元素',
      value: [],
      options: this.baseConfig.enlarge_map_issue_other
    }
  }
  formObjForBeauty: { [propName: string]: FilterConfigI } = {
    beauty_road_issue: {
      type: 'checkbox-group',
      label: '道路问题',
      value: [],
      options: this.baseConfig.enlarge_map_beauty_road
    },
    beauty_arrow_issue: {
      type: 'checkbox-group',
      label: '诱导箭头',
      value: [],
      options: this.baseConfig.enlarge_map_beauty_arrow
    }
  }
  submitCbs: { [propName: string]: { cb: () => boolean, formObj: { [propName: string]: FilterConfigI } } } = {}

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get isCanvasEditable() {
    return this.isMarkJob ? (
      this.formObj.should_recall.value === 2 ||
      this.formObj.tag.value === 2 ||
      this.formObj.beauty.value === 2
    ) : false
  }
  @Watch('isCanvasEditable', { immediate: true })
  onIsCanvasEditableChange(isCanvasEditable: boolean) {
    this.setEditable(isCanvasEditable)
  }
  @Watch('formObj.better_version.value')
  onBetterVersionChange(better_version: number) {
    const hasBetterVerTag = better_version == 1 || better_version == 2
    if (!hasBetterVerTag) {
      this.formObj.should_recall.value = 0
    }
    this.formObj.should_recall.hide = !hasBetterVerTag
    this.onSetBetterVersion(better_version)
  }
  @Watch('formObj.should_recall.value')
  onShouldRecallChange(should_recall: number) {
    const unRecall = should_recall == 2
    this.formObj.tag.hide = unRecall || !should_recall
    if (unRecall || !should_recall) {
      this.formObj.tag.value = 0
    }
  }
  @Watch('formObj.tag.value')
  onTagChange(tag: number) {
    const unSure = tag === 2
    this.formObj.tag.showSlot = unSure
    this.formObj.beauty.hide = unSure || !tag
    if (unSure || !tag) {
      this.formObj.beauty.value = 0
    }
  }
  @Watch('formObj.tag.disabled')
  onTagDisabledChange(disabled: boolean) {
    for (const key in this.formObjForTag) {
      if (this.formObjForTag.hasOwnProperty(key)) {
        this.$set(this.formObjForTag[key], 'disabled', disabled)
      }
    }
  }
  @Watch('formObj.beauty.value')
  onBeautyChange(beauty: number) {
    if (!beauty) {
      return
    }
    this.formObj.beauty.showSlot = beauty === 2
  }
  @Watch('formObj.beauty.disabled')
  onBeautyDisabledChange(disabled: boolean) {
    for (const key in this.formObjForBeauty) {
      if (this.formObjForBeauty.hasOwnProperty(key)) {
        this.$set(this.formObjForBeauty[key], 'disabled', disabled)
      }
    }
  }
  @Watch('curDataRow')
  async onCurDataRowChanged(val: vectorManager.VectorEvaluationCaseListI | null) {
    if (val) {
      const {
        enlarge_map_diff_record_id, id, tag, should_recall, show_range,
        beauty, road_issue, arrow_issue, other_issue, beauty_arrow_issue, beauty_road_issue, mark_pic_url,
        custom_mark, status, better_version, sort_site
      } = val
      this.formObj.record_id.value = enlarge_map_diff_record_id
      // sort_site=0:与现实做对比  sort_site=1,2自身新旧版本对比
      if (sort_site) {
        this.formObj.better_version.value = better_version
        // sort_site: 1正序 2逆序
        const isRight = sort_site === 1
        this.formObj.better_version.options = [
          { label: this.isMarkJob ? '上边好' : '旧版本好', value: isRight ? 1 : 2 },
          { label: this.isMarkJob ? '下边好' : '新版本好', value: isRight ? 2 : 1 },
          ...this.baseConfig.enlarge_map_better_version.slice(2)
        ]
      } else {
        // 与现实做对比
        this.formObj.better_version.hide = true
      }
      this.formObj.should_recall.value = should_recall
      this.formObj.tag.value = +tag
      this.formObjForTag.show_range.value = show_range
      this.formObjForTag.road_issue.value = road_issue
      this.formObjForTag.arrow_issue.value = arrow_issue
      this.formObjForTag.other_issue.value = other_issue
      this.formObj.beauty.value = beauty
      this.formObjForBeauty.beauty_road_issue.value = beauty_road_issue
      this.formObjForBeauty.beauty_arrow_issue.value = beauty_arrow_issue
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
      const res = await vectorManager.getMarkRecord(val.id)
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
        this.formObj.verify_result.value = verify_records
      }
    }
  }
  @Emit('on-set-better-version')
  onSetBetterVersion(better_version: number) {
    return better_version
  }
  @Emit('on-pre-or-next')
  onPreOrNext(isNext: boolean) {
    return isNext
  }
  @Emit('on-submit')
  onEmitSubmit(type: 'submit' | 'accept' | 'reject', imgSrc: string) {
    const params: { [propName: string]: number | string } = type === 'accept' ? {} : {
      mark_pic_url: imgSrc
    }
    // 展示准确 || 隐藏状态，清除formObjForTag选项
    if (this.formObj.tag.value === 1 || this.formObj.tag.hide) {
      for (const k in this.formObjForTag) {
        if (this.formObjForTag.hasOwnProperty(k)) {
          if (k === 'show_range') {
            this.formObjForTag[k].value = 0
          } else {
            this.formObjForTag[k].value = []
          }
        }
      }
    }
    // 隐藏置0
    if (this.formObj.tag.hide) {
      this.formObj.tag.value = 0
    }
    // 美观 || 隐藏状态，清除formObjForBeauty选项
    if (this.formObj.beauty.value === 1 || this.formObj.beauty.hide) {
      for (const k in this.formObjForBeauty) {
        if (this.formObjForBeauty.hasOwnProperty(k)) {
          this.formObjForBeauty[k].value = []
        }
      }
    }
    // 隐藏置0
    if (this.formObj.beauty.hide) {
      this.formObj.beauty.value = 0
    }
    Object.keys(this.submitCbs).forEach((key) => {
      const { cb, formObj } = this.submitCbs[key]
      for (const key in formObj) {
        if (formObj.hasOwnProperty(key)) {
          const item = formObj[key]
          const { hide, value, disabled, type } = item
          if (!['mark_result', 'verify_result'].includes(key)) {
            params[key] = value
          }
        }
      }
    })
    return { type, params }
  }
  @Emit('on-set-editable')
  setEditable(isCanvasEditable: boolean) {
    return isCanvasEditable
  }
  // NFilter内部是v-show指令控制显隐，此方法只执行一次
  onGetSubmit(cb: () => boolean, type: string) {
    this.$set(this.submitCbs, type, {
      cb,
      formObj: (this as any)[type]
    })
  }
  async onSubmit(type: 'submit' | 'accept' | 'reject') {
    let isValid = true
    for (const key in this.submitCbs) {
      if (this.submitCbs.hasOwnProperty(key)) {
        const { cb } = this.submitCbs[key]
        if (!cb()) {
          isValid = false
        }
      }
    }
    if (!isValid) {
      return
    }
    if (this.isCanvasEditable && (this.$root as any).getNewImgSrc) {
      const imgSrc = await (this.$root as any).getNewImgSrc()
      if (!imgSrc) {
        this.$Message.warning('请编辑图片!')
        return
      }
      this.onEmitSubmit(type, imgSrc)
    } else {
      this.onEmitSubmit(type, '')
    }
  }
}
</script>

<style lang='less'>
.label-vector-form {
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
.ivu-collapse-content {
  padding: 0;
  .ivu-collapse-content-box {
    padding: 0;
    .filter-wrapper {
      padding: 5 0;
    }
  }
}
</style>
