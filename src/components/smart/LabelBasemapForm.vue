<template>
  <div class='label-content-form'>
    <div class="label-title">标注Case</div>
    <div class="label-form">
      <NFilter 
        :configs="formObj"
        layout="vertically"
        :has-submit="false"
        :has-cancel="false"
        @on-get-submit="onGetSubmit"
      />
      <div class="level-content" style="position: relative">
        <Spin v-if="isLoadingPois" fix></Spin>
        <Collapse v-model="curLevelIndexes" accordion>
          <Panel v-for="(item, index) in dispLevelItems" :key="index" :name="`${index}`">
            <span :style="getDisabled(index) ? { 'text-decoration': 'line-through' } : {}">
              层级：{{ item.level }} &nbsp;
              POI数量：{{ item.pois.length }}&nbsp;
              {{ item.loading ? '...' : '' }}
            </span>
            <template slot="content">
              {{ item.loading ? '加载中...' : '' }}
              <div class="check-all" style="text-align: center;border-bottom: 1px solid #ccc;padding-bottom: 5px" v-if="item.pois.length">
                <Checkbox @on-change="onCheckAll($event, item.pois, index)">全选为保留/不保留</Checkbox>
              </div>
              <RadioGroup style="width: 100%" v-model="curPoiIndex" vertical>
                <div class="poi-row" v-for="(poi, idx) in item.pois" :key="poi.DidiID">
                  <div class="radio">
                    <Radio :label="idx" style="display: inline-block;width: 100%;text-overflow: ellipsis;overflow: hidden">
                      {{ poi.PoiName }}
                    </Radio>
                  </div>
                  <div class="switch">
                    <i-switch 
                      size="small" 
                      :true-value="1" 
                      :false-value="0" 
                      :disabled="getDisabled(index)"
                      :value="poi.keep === -1 ? 0 : poi.keep" 
                      @on-change="onKeep($event, idx, index)"
                      @click.stop>
                    </i-switch>
                    {{ poi.keep == -1 ? '-' : (poi.keep ? '保留' : '不保留') }}
                  </div>
                </div>
              </RadioGroup>
            </template>
          </Panel>
        </Collapse>
      </div>
    </div>
    <div class="label-action">
      <div class="label-action-btns">
        <Button :loading="loading" type="primary" @click="onSubmit('submit')">提交</Button>
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
import { BaseMapEvaluationCaseListI } from '@/models/manager/basemap'
import { PoiI } from '@/models/machine/basemap'
import * as basemapManager from '@/models/manager/basemap'
import * as basemapMachine from '@/models/machine/basemap'
import { ValueConfig } from '@/types'
import queryString from 'query-string'
import L, { LatLngLiteral } from 'leaflet'
import { genCircleMarker, bindPopup, bindTooltip, mapZoomAndRadius } from '@/utils'

@Component({ components: { NFilter } })
export default class LabelBasemapForm extends Vue {
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean
  @Prop({ type: Object, default: () => null }) readonly curDataRow!: BaseMapEvaluationCaseListI | null
  @Prop({ type: Object, default: () => ({ prev: false, next: false }) }) readonly disabledPrevNext!: { prev: boolean, next: boolean }
  @Prop({ type: Function, default: null }) readonly addOrRmPoiMarkers!: (add: boolean, maxZoom: number, layer: L.FeatureGroup) => void
  formObj: { [propName: string]: FilterConfigI } = {
    record_id: {
      type: 'text',
      label: 'Record ID',
      value: '',
      diffVal: '',
      disabled: true
    },
    BlockNo: {
      type: 'text',
      label: '瓦片编号',
      value: '',
      diffVal: '',
      disabled: true
    },
    Name: {
      type: 'text',
      label: 'POI名称',
      value: '',
      diffVal: '',
      disabled: true
    },
    KindName: {
      type: 'text',
      label: '类别',
      value: '',
      diffVal: '',
      disabled: true
    },
    address: {
      type: 'text',
      label: '地址?',
      value: '',
      hide: true,
      diffVal: '',
      disabled: true
    },
    LngLat: {
      type: 'text',
      label: '坐标',
      value: '',
      diffVal: '',
      disabled: true
    },
    Rank: {
      type: 'text',
      label: 'POIRank',
      value: '',
      diffVal: '',
      disabled: true
    },
    Type: {
      type: 'text',
      label: '类型',
      value: '',
      diffVal: '',
      disabled: true
    },
    mark_result: {
      type: 'input-textarea',
      label: '评测结果记录',
      value: '',
      diffVal: '',
      placeholder: '评测结果记录',
      disabled: true
    },
  }
  curLevelIndexes: number[] = []
  curPoiIndex: number = -1
  isLoadingPois: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get mapPoiType() {
    return this.baseConfig.map_poi_type
  }
  get query() {
    const query = this.$route.query
    const { job_id, job_name, city_code } = query
    return {
      job_id: +job_id,
      job_name,
      city_code: +city_code
    }
  }
  get curLevelIndex() {
    return this.curLevelIndexes.length ? +this.curLevelIndexes[0] : -1
  }
  get dispLevelItems(): Array<{
    level: number,
    loading: boolean,
    addOrRmLayer?: (add: boolean) => void,
    focusMarker?: (index: number) => void
    pois: PoiI[]
  }> {
    if (!this.curDataRow) {
      return []
    }
    const { DispLevel, marked_json } = this.curDataRow
    if (marked_json) {
      const _: Array<{ level: number, pois: PoiI[] }> = JSON.parse(marked_json)
      return _.map((item) => ({
        ...item,
        loading: false
      }))
    } else {
      return DispLevel.split(',').reverse().map((level) => ({
        level: +level,
        pois: [],
        loading: false
      }))
    }
  }

  @Watch('curLevelIndex')
  async onCurLevelIndexChanged() {
    // 移除对比poi
    this.curPoiIndex = -1
    // 移除所有图层
    this.dispLevelItems.forEach((d) => d.addOrRmLayer && d.addOrRmLayer(false))
    if (this.curLevelIndex < 0) {
      return
    }
    const { level, pois, addOrRmLayer } = this.dispLevelItems[this.curLevelIndex]
    if (addOrRmLayer) {
      addOrRmLayer(true)
    } else {
      const { BlockNo, BlockID, SiweiID, DidiID, Lat, Lng } = this.curDataRow!
      const distance = mapZoomAndRadius[level] * 2
      const layer = L.featureGroup()
      pois.forEach((poi) => {
        const marker = genCircleMarker({ lat: poi.Lat, lng: poi.Lng }, {
          opacity: 1,
          fillColor: '#f50',
          fillOpacity: 1
        })
        bindPopup(marker, Object.keys(poi).map((k) => ({ label: k, value: (poi as any)[k] })))
        bindTooltip(marker, poi.PoiName, { permanent: false })
        layer.addLayer(marker)
      })
      const circle = L.circle({ lng: Lng, lat: Lat }, { radius: distance, fill: false, weight: 2, interactive: false })
      bindTooltip(circle, `当前半径：${distance}m`, { direction: 'top', offset: [0, -distance * 2] })
      layer.addLayer(circle)
      const addOrRmLayer = (add: boolean) => {
        this.addOrRmPoiMarkers && this.addOrRmPoiMarkers(add, level, layer)
      }
      addOrRmLayer(true)
      this.dispLevelItems[this.curLevelIndex] = {
        ...this.dispLevelItems[this.curLevelIndex],
        addOrRmLayer,
        focusMarker: (index: number) => {
          layer.getLayers()[index].openPopup()
          layer.getLayers()[index].openTooltip()
          setTimeout(() => {
            layer.getLayers()[index].closeTooltip()
          }, 1500)
        }
      }
      this.$forceUpdate()
    }
  }
  @Watch('curPoiIndex')
  onCurPoiIndexChanged(index: number) {
    if (index < 0) {
      for (const k in this.formObj) {
        if (this.formObj.hasOwnProperty(k)) {
          this.formObj[k].diffVal = ''
        }
      }
      return
    }
    const { POIRank, PoiName, KindName, Type, Lat, Lng } = this.dispLevelItems[this.curLevelIndex].pois[index]
    this.dispLevelItems[this.curLevelIndex].focusMarker!(index)
    // this.formObj.record_id.diffVal = this.formObj.record_id.value
    this.formObj.BlockNo.diffVal = this.formObj.BlockNo.value
    this.formObj.Name.diffVal = PoiName
    this.formObj.KindName.diffVal = KindName
    this.formObj.LngLat.diffVal = `${Lng.toFixed(3)},${Lat.toFixed(3)}`
    this.formObj.Rank.diffVal = POIRank
    this.formObj.Type.diffVal = Type || '/'
    this.formObj.mark_result.diffVal = this.formObj.mark_result.value
    this.$forceUpdate()
  }
  @Watch('curDataRow', { deep: true })
  async onCurDataRowChanged(val: BaseMapEvaluationCaseListI | null) {
    if (val) {
      const {
        id, poi_diff_record_id, BlockNo, POIRank, Name, KindName, Type, BlockID, SiweiID, DidiID, Lat, Lng
      } = val
      this.curLevelIndexes = []
      this.dispLevelItems.forEach(async (d) => {
        const { level, addOrRmLayer, pois } = d
        addOrRmLayer && addOrRmLayer(false)
        const distance = mapZoomAndRadius[level] * 2
        this.isLoadingPois = true
        const res = pois.length ? { POIs: pois } : await basemapMachine.relativePois({
          CityCode: this.query.city_code,
          BlockNo,
          BlockId: BlockID,
          DidiID,
          SiweiID,
          Distance: distance
        })
        d.pois = res ? res.POIs : []
        this.isLoadingPois = false
        this.$forceUpdate()
      })
      this.formObj.record_id.value = poi_diff_record_id
      this.formObj.BlockNo.value = BlockNo
      this.formObj.Name.value = Name
      this.formObj.KindName.value = KindName
      this.formObj.LngLat.value = `${Lng},${Lat}`
      this.formObj.Rank.value = POIRank
      this.formObj.Type.value = this.mapPoiType[Type] || Type
      const res = await basemapManager.getMarkRecord(id)
      if (res) {
        const { mark_records, verify_records } = res
        this.formObj.mark_result.value = mark_records
      }
    }
  }

  goSubmit: () => boolean = () => false
  onGetSubmit(cb: () => boolean) {
    this.goSubmit = cb
  }

  @Emit('on-submit')
  onEmitSubmit(type: 'submit') {
    return {
      type,
      params: this.dispLevelItems.map((d) => ({
        level: d.level,
        pois: d.pois
      }))
    }
  }
  @Emit('on-pre-or-next')
  onPreOrNext(isNext: boolean) {
    return isNext
  }
  onSubmit(type: 'submit') {
    const levels: { [propName: number]: number[] } = {}
    let hasPois: boolean = false
    this.dispLevelItems.forEach((d) => {
      const { level } = d
      if (!(d as any).disabled) {
        // 去掉不保留的
        d.pois.forEach((p, i) => {
          hasPois = true
          if (p.keep == -1) {
            if (levels[level]) {
              levels[level].push(i)
            } else {
              levels[level] = [i]
            }
          }
        })
      }
    })
    const valid = !Object.keys(levels).length
    if (!valid) {
      // if (!hasPois) {
      //   this.$Message.warning('你还没有标注任何POI, 请点击层级加载pois')
      // }
      Object.keys(levels).forEach((level) => {
        this.$Message.warning(`你在层级: ${level} 下还有${levels[+level].length}个poi未标注`)
      })
      return
    }
    this.onEmitSubmit(type)
  }
  onKeep(val: number, poiIndex: number, levelIndex: number) {
    this.dispLevelItems[levelIndex].pois[poiIndex].keep = val
    this.$forceUpdate()
  }
  onCheckAll(checked: boolean, pois: PoiI[], levelIndex: number) {
    pois.forEach((poi, index) => {
      this.onKeep(checked ? 1 : 0, index, levelIndex)
    })
  }
  getDisabled(levelIndex: number) {
    // 筛选出上层级有poi列表的项
    const upperLevelItems = this.dispLevelItems.slice(0, levelIndex).filter((it) => it.pois.length)
    const upperLevelPois = upperLevelItems.reduce((acc: PoiI[], cur, idx) => [...acc, ...cur.pois], [])
    // 找出当前需要标注的层级的上层级（列表）
    const isDisabled = upperLevelPois.length ? upperLevelItems.some((d) => {
      const { pois } = d
      return pois.every((p) => p.keep === 1) // 如果所有都保留
    }) : false
    this.$set(this.dispLevelItems[levelIndex], 'disabled', isDisabled)
    return isDisabled
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
    .level-content {
      margin-bottom: 20px;
      padding: 0 20px 0 10%;
      .poi-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .radio {
          position: relative;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: keep-all;
        }
        .switch {
          width: 80px;
          text-align: right;
        }
      }
    }
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
