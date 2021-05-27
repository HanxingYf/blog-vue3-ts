<template>
  <LabelWithMap
    @map-ready="onMapReady"
    :voices="voices"
    :latlngForPano="latlng"
    :marks="marks"
    :hasPano="hasPano"
    :hasForm="hasForm"
    :layer-controls="layerControlsForContentAndTick || [layerControls]"
  >
    <template slot="layers-control">
      <slot name="layers-control"></slot>
    </template>
    <template slot="label-form">
      <slot name="label-form" v-bind:label-form="{ addOrRmPoiMarkers }"></slot>
    </template>
    <template slot="label-mark">
      <slot name="label-mark"></slot>
    </template>
    <template slot="label-diff">
      <slot name="label-diff"></slot>
    </template>
  </LabelWithMap>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { GetMapT } from '@/components/dumb/types'
import LabelWithMap from '@/components/smart/LabelWithMap.vue'
import L, { LatLngLiteral, point } from 'leaflet'
import {
  genNaviRoadLine, genCircleMarker, bindPopup, bindTooltip,
  getStreetJumpCb, genNaviTraj, mercator2gcj, getLayerGpFn, genGeojsonLayer
} from '@/utils'
import { ContentAndTickLayerItemsI, ContentAndTickTimeingI, LayerItemsI, OriginalAndNewJsonI } from '@/views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-tick/tick/types'
import { TimingI, CheckTimingI } from '@/models/manager'
import * as basemapMachine from '@/models/machine/basemap'
import { PoiI, PoiConfigI } from '@/models/machine/basemap'
import { LayerCtlI } from '@/types'

@Component({ components: { LabelWithMap } })
export default class LabelModal extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Array, default: () => (['']) }) readonly geojsons!: string[]
  @Prop({ type: Array, default: () => (['']) }) readonly marks!: string[]
  @Prop({ type: Boolean, default: true }) readonly hasPano!: boolean
  @Prop({ type: Boolean, default: true }) readonly hasForm!: boolean
  @Prop({ type: Object, default: () => null }) readonly layerItems!: LayerItemsI | null // 时机任务图层控制
  @Prop({ type: Object, default: () => null }) readonly layerItemsForContentAndTick!: ContentAndTickLayerItemsI | null // 内容和时机任务图层控制
  @Prop({ type: Object, default: () => null }) readonly esiweiMapDir!: { [propName: string]: number } | null // 使用绘制打点link的方式绘制导航code
  @Prop({ type: Object, default: () => null }) readonly poiConfig!: PoiConfigI
  @Prop({ type: Object, default: () => null }) readonly extraPointForLane!: {
    didi_start_point: string
    didi_disappear_point: string
    rival_start_point: string
    rival_disappear_point: string
  } | null
  voices: string[] = Array(this.geojsons.length).fill('')
  maps: GetMapT[] = []
  getLayerGps: Array<() => L.FeatureGroup<any>> = getLayerGpFn(this.geojsons.length)
  latlng: LatLngLiteral | null = null
  layerControls: LayerCtlI[] = []
  layerControlsForContentAndTick: LayerCtlI[][] | null = null
  isRegisteredOnFetchDiffPois: boolean = false
  resize: () => void = () => { }

  get drawCode() {
    return !this.layerItems && !this.extraPointForLane
  }

  @Watch('visible', { immediate: true })
  onVisibleChange(val: boolean) {
    val && this.resize()
  }
  @Watch('geojsons', { deep: true })
  onGeoJsonChanged(geojsons: string[]) {
    this.$nextTick(() => {
      this.layerControls.forEach((lcl) => {
        lcl.checked && lcl.check(true)
      })
    })
    this.latlng = null
    this.getLayerGps.forEach((getLayerGp, index) => {
      const layerGp = getLayerGp()
      layerGp.clearLayers()
      const map = this.maps[index]()
      const { layer, voice, latlng } = genNaviRoadLine(geojsons[index], {
        drawCode: this.drawCode,
        ...(this.esiweiMapDir ? { esiweiMapDir: this.esiweiMapDir } : {})
      })
      if (!this.extraPointForLane) {
        this.$set(this.voices, index, this.layerItems ? `滴滴: ${voice}` : voice)
      }
      if (latlng) {
        this.latlng = latlng
      }
      if (layer) {
        layerGp.addLayer(layer)
        const bounds = layerGp.getBounds()
        bounds.isValid() && map.fitBounds(bounds)
      }
    })
  }
  @Watch('layerItems')
  onLayerItemsChanged() {
    this.layerItems && this.getLayerControls()
  }
  @Watch('layerItemsForContentAndTick')
  onLayerItemsForContentAndTickChange() {
    this.layerItemsForContentAndTick && this.getContentAndTickLayerControls()
  }
  @Watch('poiConfig', { deep: true })
  onPoiConfigChanged() {
    this.poiConfig && this.doWithPoiConfig()
  }
  @Watch('extraPointForLane')
  onExtraPointForLaneChange() {
    this.getLayerGps.forEach((getLayerGpFn, index) => {
      const layerGp = getLayerGpFn()
      if (!this.extraPointForLane) {
        return
      }
      const {
        didi_start_point, didi_disappear_point,
        rival_start_point, rival_disappear_point
      } = this.extraPointForLane
      const didiPointsMaker = this.getPointsMarker([
        didi_start_point, didi_disappear_point
      ], {
        0: '始',
        1: '末'
      }, { fillColor: '#9c27b0' })
      didiPointsMaker.forEach((marker) => {
        marker && layerGp.addLayer(marker)
      })
      this.layerControls = [
        {
          name: '显示竞品',
          checked: this.layerControls[0] ? this.layerControls[0].checked : false,
          check: (() => {
            const rivalPointsMaker = this.getPointsMarker([
              rival_start_point, rival_disappear_point
            ], {
              0: '1',
              1: '2'
            }, { fillColor: '#8BC34A' })
            const layerG = L.featureGroup()
            rivalPointsMaker.forEach((marker) => {
              marker && layerG.addLayer(marker)
            })
            const voices = [this.voices[0]]
            return (checked: boolean) => {
              if (checked) {
                layerGp.addLayer(layerG)
              } else {
                layerGp.removeLayer(layerG)
              }
            }
          })()
        }
      ]
    })
  }

  onMapReady(payload: { maps: GetMapT[], resize: () => void }) {
    const { maps, resize } = payload
    this.maps = maps
    this.resize = resize
    maps.forEach((getMap, index) => {
      getMap().addLayer(this.getLayerGps[index]())
    });
    (window as any).map = maps[0]()
  }
  getLayerControls() {
    const layerGp = this.getLayerGps[0]()
    if (!this.layerItems || !layerGp) {
      return
    }
    const {
      didi_act_start_coor, didi_act_end_coor, didi_code_fix_coor,
      geojson_rival, rival_act_start_coor, rival_act_end_coor, rival_code_coor,
      turning_coor,
      traj_geojson,
      main_assi_end_coor,
      timing,
      check_timing
    } = this.layerItems
    const didiPointsMaker = this.getPointsMarker([didi_act_start_coor, didi_act_end_coor, didi_code_fix_coor, turning_coor], {
      0: '始',
      1: '末',
      2: 'code',
      3: '转'
    }, { color: '#f77' })
    didiPointsMaker.forEach((marker) => {
      marker && layerGp.addLayer(marker)
    })
    this.layerControls = [
      {
        name: '显示竞品',
        checked: this.layerControls[0] ? this.layerControls[0].checked : false,
        check: (() => {
          const { layer, voice } = genNaviRoadLine(geojson_rival, { drawCode: false, style: { color: '#8500B0' } });
          const markers = this.getPointsMarker(
            [rival_act_start_coor, rival_act_end_coor, rival_code_coor],
            { 0: '5', 1: '6', 2: '4' },
            { color: '#D900F9' }
          )
          markers.forEach((marker) => {
            layer && marker && layer.addLayer(marker)
          })
          const voices = [this.voices[0]]
          return (checked: boolean) => {
            if (layer) {
              if (checked) {
                layerGp.addLayer(layer)
                this.voices = [`${voices[0]}#竞品: ${voice}`]
              } else {
                layerGp.removeLayer(layer)
                this.voices = [voices[0]]
              }
            }
          }
        })()
      },
      {
        name: '显示轨迹',
        checked: this.layerControls[1] ? this.layerControls[1].checked : false,
        check: (() => {
          const layer = genNaviTraj(traj_geojson, { color: '#f77' })
          return (checked: boolean) => {
            if (layer) {
              checked ? layerGp.addLayer(layer) : layerGp.removeLayer(layer)
            }
          }
        })()
      },
      {
        name: '主辅结束点',
        checked: this.layerControls[2] ? this.layerControls[2].checked : false,
        check: (() => {
          const markers = this.getPointsMarker(
            [main_assi_end_coor],
            { 0: '主辅结束点' },
            { color: '#362AD32' }
          )
          const layer = L.featureGroup()
          markers.forEach((marker) => {
            marker && layer.addLayer(marker)
          })
          return (checked: boolean) => {
            checked ? layerGp.addLayer(layer) : layerGp.removeLayer(layer)
          }
        })()
      },
      {
        name: 'Timing',
        checked: this.layerControls[3] ? this.layerControls[3].checked : false,
        check: (() => {
          const layer = this.genTimingLayer(timing, { color: 'green' })
          return (checked: boolean) => {
            if (layer) {
              checked ? layerGp.addLayer(layer) : layerGp.removeLayer(layer)
            }
          }
        })()
      },
      {
        name: 'CheckTiming',
        checked: this.layerControls[4] ? this.layerControls[4].checked : false,
        check: (() => {
          const layer = this.genTimingLayer(check_timing, { color: '#17D6E5' })
          return (checked: boolean) => {
            if (layer) {
              checked ? layerGp.addLayer(layer) : layerGp.removeLayer(layer)
            }
          }
        })()
      }
    ]
  }
  getContentAndTickLayerControls() {
    if (!this.layerItemsForContentAndTick) {
      return []
    }
    const { original_json, new_json } = this.layerItemsForContentAndTick
    let original_json_obj
    let new_json_obj
    try {
      original_json_obj = JSON.parse(original_json) as OriginalAndNewJsonI
      new_json_obj = JSON.parse(new_json) as OriginalAndNewJsonI
    } catch (error) {
      console.error('解析original_json 或 new_json失败', error)
    }
    // console.log(original_json_obj,new_json_obj,'--');
    this.layerControlsForContentAndTick = [original_json_obj, new_json_obj].map((json, idx) => {
      if (!json) {
        return []
      }
      const layerGp = this.getLayerGps[idx]()
      const { timing, checktiming } = json
      const timingStyle = {
        color: 'green'
      }
      const checkTimingStyle = {
        color: 'blue'
      }
      const timingLayer = this.genContentAndTickTimingLayer(timing, timingStyle)
      const checkTimingLayer = this.genContentAndTickTimingLayer(checktiming, checkTimingStyle)
      return [
        {
          name: 'Timing',
          checked: false,
          check: (checked: boolean) => {
            if (timingLayer) {
              checked ? layerGp.addLayer(timingLayer) : layerGp.removeLayer(timingLayer)
            }
          }
        },
        {
          name: 'Check Timing',
          checked: false,
          check: (checked: boolean) => {
            if (checkTimingLayer) {
              checked ? layerGp.addLayer(checkTimingLayer) : layerGp.removeLayer(checkTimingLayer)
            }
          }
        }
      ]
    })
  }
genContentAndTickTimingLayer(timing: ContentAndTickTimeingI, style: object) {
    try {
      const { begin, end } = timing
      // console.log(begin, end,'++++');
      const bLatlng = {
        lat: begin.coor[0],
        lng: begin.coor[1]
      }
      const eLatlng = {
        lat: end.coor[0],
        lng: end.coor[1]
      }
      const layer = L.polyline([bLatlng, eLatlng], style)
      const layerGp = L.featureGroup()
      layerGp.addLayer(layer);
      [begin, end].forEach((_) => {
        const { coor, dis } = _
        const point = genCircleMarker({
          lat: coor[0],
          lng: coor[1]
        }, style)
        layerGp.addLayer(point)
      })
      // const layer = L.polyline([bLatlng.lat, bLatlng.lng), mercator2gcj(eLatlng.lat, eLatlng.lng)], style)
      return layerGp
    } catch (error) {
      return null
    }
  }
  doWithPoiConfig() {
    const { Lat, Lng, PoiName, DispLevel } = this.poiConfig!
    this.getLayerGps.forEach((getLayerGp, index) => {
      const layerGp = getLayerGp()
      layerGp.clearLayers()
      const map = this.maps[index]()
      const marker = genCircleMarker({ lat: Lat, lng: Lng }, {
        opacity: 1,
        fillColor: '#8BC34A',
        fillOpacity: 1
      })
      bindPopup(marker, Object.keys(this.poiConfig).map((k) => ({ label: k, value: (this.poiConfig as any)[k] })))
      bindTooltip(marker, PoiName, { permanent: false })
      layerGp.addLayer(marker)
      const bounds = layerGp.getBounds()
      const minZoom = DispLevel[0]
      const maxZoom = DispLevel[DispLevel.length - 1]
      map.setView({ lat: Lat, lng: Lng }, maxZoom)
      // 防止视角发生变化，这个设置置后
      setTimeout(() => {
        map.setMinZoom(minZoom)
        map.setMaxZoom(maxZoom)
      }, 1000)
    })
  }
  genTimingLayer(timing: TimingI | CheckTimingI, style: {} = {}) {
    try {
      const { beginposofroute, endposofroute } = timing
      if (beginposofroute && endposofroute) {
        const bLatlng = {
          lng: beginposofroute.geopoint.lng,
          lat: beginposofroute.geopoint.lat
        }
        const eLatlng = {
          lng: endposofroute.geopoint.lng,
          lat: endposofroute.geopoint.lat
        }
        const layer = L.polyline([mercator2gcj(bLatlng.lat, bLatlng.lng), mercator2gcj(eLatlng.lat, eLatlng.lng)], style)
        return layer
      } else {
        const pos = beginposofroute || endposofroute
        const point = genCircleMarker(mercator2gcj(pos.geopoint.lat, pos.geopoint.lng), style)
        return point
      }
    } catch (error) {
      console.error('绘制timing失败', error)
      return null
    }
  }
  addOrRmPoiMarkers(add: boolean, maxZoom: number, layer: L.FeatureGroup) {
    const layerGp = this.getLayerGps[0]()
    const map = this.maps[0]()
    add ? layerGp.addLayer(layer) : layerGp.removeLayer(layer)
    add && map.setZoom(maxZoom)
  }
  getPointsMarker(coors: string[], mapText: { [propName: number]: string }, style: {} = {}) {
    return coors.map((coor, index) => {
      const latlng = {
        lng: +((coor || '').split(',')[0]),
        lat: +((coor || '').split(',')[1])
      }
      if (!isNaN(latlng.lng) && !isNaN(latlng.lat)) {
        const sin = (index + 1) % 2
        const marker = genCircleMarker(latlng, {
          opacity: 1,
          fillColor: '#8BC34A',
          fillOpacity: 1,
          color: '#000',
          ...style
        })
        bindPopup(marker, [
          {
            label: '经纬度',
            value: `${latlng.lng.toFixed(5)},${latlng.lat.toFixed(5)}`,
            copy: true
          },
          {
            label: '行车记录仪',
            value: '启动',
            cb: () => {
              this.latlng = latlng
            }
          },
          {
            label: '谷歌地图',
            value: '跳转',
            cb: getStreetJumpCb('google', latlng)
          },
          {
            label: '百度地图',
            value: '跳转',
            cb: getStreetJumpCb('baidu', latlng)
          }
        ])
        bindTooltip(marker, mapText[index], { direction: sin ? 'left' : 'right' })
        return marker
      } else {
        return null
      }
    })
  }
  mounted() {
    this.$root.$on('canvas-scale', (scale: boolean) => {
      this.maps.forEach((getMap, index) => {
        getMap().fitBounds(this.getLayerGps[index]().getBounds(), { paddingTopLeft: [scale ? 800 : 0, 0], maxZoom: 17 })
      })
    })
  }
}
</script>

<style lang="less" scoped>
.layer-control {
  padding: 5px;
}
</style>

