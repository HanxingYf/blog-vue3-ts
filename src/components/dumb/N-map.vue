<template>
  <div class='navi__map-container' :id="randomId" ref="lmap">
    <div class="zoom-level-container">
      {{ zoomLevel }}
    </div>
    <slot name="navi-map-tools"></slot>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import L, { LatLngLiteral } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getUid, genCircleMarker, bindTooltip } from '@/utils'
import 'leaflet-contextmenu'
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css'

@Component
export default class NMap extends Vue {
  getMap!: () => L.Map
  mapReady: boolean = false
  zoomLevel: number = 12

  get tileLayers() {
    const options = {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 20,
      minZoom: 1,
      maxNativeZoom: 18,
      attribution: '&copy map-fe'
    }
    const txLayer = new L.TileLayer('http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0', {
      ...options,
      tms: true,
      subdomains: ['0', '1', '2', '3']
    })
    const gaodeLayer = new L.TileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', options)
    const didiBaseMap = new L.TileLayer('http://tile{s}.map.xiaojukeji.com/{z}/{x}/{y}.png', {
      ...options,
      tms: true
    })
    const googleLayer = new L.TileLayer('http://mt0.google.cn/vt/lyrs=m@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga', {
      maxZoom: 20,
      maxNativeZoom: 18,
      minZoom: 1,
      attribution: '&copy map-fe'
    })
    const googleState = new L.TileLayer('http://www.google.cn/maps/vt?lyrs=s@729&gl=cn&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      minZoom: 1,
      maxNativeZoom: 18,
    })
    const gaodeSate = new L.TileLayer('https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      minZoom: 1,
      maxNativeZoom: 18,
    })
    return {
      '滴滴': didiBaseMap,
      '腾讯': txLayer,
      '高德': gaodeLayer,
      '谷歌': googleLayer,
      '谷歌卫星': googleState,
      '高德卫星': gaodeSate
    }
  }
  get randomId() {
    return `navi-map-${getUid()}`
  }

  @Emit('map-ready')
  onMapReady(getMap: () => L.Map) {
    this.mapReady = true
    return getMap
  }
  @Emit('open-pano')
  openPano(e: { latlng: LatLngLiteral }) {
    return e.latlng
  }

  mounted() {
    const layer = this.tileLayers['滴滴']
    const map: L.Map = new L.Map(this.randomId, {
      layers: [layer],
      center: [39.928953, 116.389129],
      attributionControl: false,
      zoomControl: false,
      zoom: this.zoomLevel,
      renderer: L.canvas(),
      // @ts-ignore
      contextmenu: true,
      contextmenuWidth: 140,
      contextmenuItems: [
        {
          text: '查看行车记录仪&百度街景',
          callback: this.openPano
        },
        {
          text: '作为转向点(时机任务)',
          callback: (() => {
            const layerGp = L.featureGroup()
            return (e: any) => {
              this.getMap().addLayer(layerGp)
              layerGp.clearLayers()
              const latlng: LatLngLiteral = e.latlng
              const point = genCircleMarker(latlng, {
                opacity: 1,
                fillColor: 'yellow',
                fillOpacity: 1
              })
              bindTooltip(point, '转')
              point.on('contextmenu', () => {
                layerGp.removeLayer(point)
              })
              layerGp.addLayer(point)
              window.eventBus.$emit('as-turn-coor', latlng)
            }
          })()
        },
        {
          text: '作为问题点(内容任务)',
          callback: (() => {
            const layerGp = L.featureGroup()
            return (e: any) => {
              this.getMap().addLayer(layerGp)
              layerGp.clearLayers()
              const latlng: LatLngLiteral = e.latlng
              const point = genCircleMarker(latlng, {
                opacity: 1,
                fillColor: 'yellow',
                fillOpacity: 1
              })
              bindTooltip(point, '问题点')
              point.on('contextmenu', () => {
                layerGp.removeLayer(point)
              })
              layerGp.addLayer(point)
              window.eventBus.$emit('as-issue-coor', latlng)
            }
          })()
        }
      ]
    })
    map.on('zoom', (e: any) => {
      this.zoomLevel = e.target._zoom
    })
    L.control.scale({ position: 'bottomright', imperial: false}).addTo(map);
    L.control.layers(this.tileLayers, {}, { position: 'bottomright' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    (map as any).NAME = this.randomId
    const getMap = this.getMap = () => map
    this.onMapReady(getMap)
  }
}
</script>

<style scoped lang='less'>
.navi__map-container {
  width: 100%;
  height: 100%;
  position: relative;
  .zoom-level-container {
    width: 30px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    background-color: #ffffff;
    border-radius: 4px;
    border: 1px solid #ccc;
    position: absolute;
    right: 100px;
    bottom: 5px;
    z-index: 999;
  }
}
</style>
