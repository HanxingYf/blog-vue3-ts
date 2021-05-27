<template>
  <div class="wrapper">
    <NSyncMap
      :voices="voices"
      @sync-map-ready="onSyncMapReady"
      :layerControls="layerControlsForContentAndTick"
    >
      <template slot="label-mark">
        <slot name="label-mark"></slot>
      </template>
      <template slot="label-diff">
        <slot name="label-diff"></slot>
      </template>
    </NSyncMap>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import NSyncMap from '@/components/dumb/N-sync-map.vue'
import { GetMapT } from '@/components/dumb/types'
import { genNaviRoadLine, getLayerGpFn, genCircleMarker, bindPopup, bindTooltip } from '@/utils'
import { ContentAndTickLayerItemsI, ContentAndTickTimeingI, OriginalAndNewJsonI } from '@/views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-tick/tick/types'
import { LayerCtlI } from '@/types'
import L from 'leaflet'

@Component({ components: { NSyncMap } })
export default class PreviewWithMap extends Vue {
  @Prop({ type: Array, default: () => (['']) }) readonly geojsons!: string[]
  @Prop({ type: Boolean, default: false }) readonly drawCode!: boolean
  @Prop({ type: Object, default: () => null }) readonly extraPointForLane!: {
    didi_start_point: string
    didi_disappear_point: string
    rival_start_point: string
    rival_disappear_point: string
  } | null
  @Prop({ type: Object, default: () => null }) readonly esiweiMapDir!: { [propName: string]: number } | null // 使用绘制打点link的方式绘制导航code
  voices: string[] = Array(this.geojsons.length).fill('')
  getMaps: GetMapT[] = []
  getLayerGps: Array<() => L.FeatureGroup<any>> = getLayerGpFn(this.geojsons.length)
  @Prop({ type: Array, default: () => (['']) }) readonly tts!: string[] // 播报
  @Prop({ type: Object, default: () => null }) readonly layerItemsForContentAndTick!: ContentAndTickLayerItemsI | null // 内容和时机任务图层控制

  layerControls: LayerCtlI[] = []
  layerControlsForContentAndTick: LayerCtlI[][] | null = null

  @Watch('geojsons')
  onGeojsonsChanged(geojsons: string[]) {
    this.getLayerGps.forEach((getLayerGpFn, index) => {
      const layerGp = getLayerGpFn()
      layerGp.clearLayers()
      const geojson = geojsons[index]
      if (!geojson) {
        this.$set(this.voices, index, '')
        return
      }
      const res = genNaviRoadLine(geojson, {
        ...(this.esiweiMapDir ? { esiweiMapDir: this.esiweiMapDir } : {}),
        drawCode: this.drawCode
      })
      const { layer, voice } = res
      if (voice !== '无') {
        this.$set(this.voices, index, voice)
      } else {
        this.$set(this.voices, index, this.tts[index])
      }
      if (layer) {
        layerGp.addLayer(layer)
        const bounds = layerGp.getBounds()
        bounds.isValid() && this.getMaps[index]().fitBounds(bounds)
      }
    })
  }
  @Watch('extraPointForLane')
  onExtraPointForLaneChange() {
    this.getLayerGps.forEach((getLayerGpFn, index) => {
      const layerGp = getLayerGpFn()
      // layerGp.clearLayers()
      if (!this.extraPointForLane) {
        return
      }
      const {
        didi_start_point, didi_disappear_point,
        rival_start_point, rival_disappear_point
      } = this.extraPointForLane
      const didiPointsMaker = this.getPointsMarker([
        didi_start_point, rival_start_point,
        didi_disappear_point, rival_disappear_point
      ], {
        0: '始',
        1: '1',
        2: '末',
        3: '2'
      })
      didiPointsMaker.forEach((marker) => {
        marker && layerGp.addLayer(marker)
      })
    })
  }

  @Watch('layerItemsForContentAndTick')
  onLayerItemsForContentAndTickChange() {
    this.layerItemsForContentAndTick && this.getContentAndTickLayerControls()
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
    // console.log(this.layerControlsForContentAndTick,'++++-=');
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
          fillColor: sin ? '#9c27b0' : '#8BC34A',
          fillOpacity: 1,
          color: '#000',
          ...style
        })
        bindTooltip(marker, mapText[index], { direction: sin ? 'left' : 'right' })
        return marker
      } else {
        return null
      }
    })
  }

  onSyncMapReady(getMaps: GetMapT[]) {
    this.getMaps = getMaps
    getMaps.forEach((getMap, index) => {
      getMap().addLayer(this.getLayerGps[index]())
    })
  }
}
</script>

<style scoped lang='less'>
.wrapper {
  width: 100%;
  min-height: 500px;
}
</style>
