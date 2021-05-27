<template>
  <div id="bd-panorama" class="panorama" :forceRender="true">
    <template v-if="bdPanorama">
      <div class="empty">无数据 {{ initLoading ? '初始化BMap...' : "" }}</div>
    </template>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { getLayerGpFn, bdPoint2Gcj, gcj2BdPoint, bindTooltip } from '@/utils'
import L from 'leaflet'
interface PovI { pitch: number, heading: number }
interface BdPanoramaI {
  getPosition: () => L.LatLngLiteral
  setPosition: (latlng: L.LatLngLiteral) => void
  getPov: () => PovI
  setPov: (pov: PovI) => void
  show: () => void
  addEventListener: (type: 'position_changed' | 'pov_changed', handle: () => void) => void
}
interface ConvertorI {
  translate: (
    points: any[], // 此处any是BMap.Point类的实例类型 下同
    from: number,
    to: number,
    handler: (data: { status: number, points: any[] }) => void
  ) => void
}

@Component
export default class BdPano extends Vue {
  @Prop({ type: Array, default: () => ([]) }) readonly getMaps!: Array<() => L.Map>
  @Prop({ type: Object, default: () => null }) readonly latlng!: L.LatLngLiteral | null
  bdPanorama: number = -1
  getLayerGps = getLayerGpFn(1)
  initLoading: boolean = false
  getBdPanorama: () => BdPanoramaI | null = () => null
  getConvertor: () => ConvertorI | null = () => null

  @Watch('getMaps')
  onGetMapsChanged() {
    this.getLayerGps = getLayerGpFn(this.getMaps.length)
    this.getMaps.forEach((getMap, index) => {
      const map = getMap()
      const layerGp = this.getLayerGps[index]()
      map.addLayer(layerGp)
    })
  }

  handleOnLoadBdPanorama(payload: L.LatLngLiteral) {
    const bdPanorama = this.getBdPanorama()
    const convertor = this.getConvertor()
    if (!bdPanorama || !convertor) {
      console.info('BMap不存在')
      return
    }
    const layerGp = this.getLayerGps[0]()
    layerGp.clearLayers()
    // @ts-ignore
    const bdPoint = new BMap.Point(payload.lng, payload.lat)
    convertor.translate([bdPoint], 3, 5, (data) => {
      if (data.status === 0) {
        bdPanorama.setPosition(data.points[0])
        bdPanorama.show()
      }
    })
    const marker = this.genMarker(payload, 0)
    // bindTooltip(marker, '可拖拽', {
    //   direction: 'right',
    //   offset: [20, 0]
    // })
    const _tempGp = L.featureGroup()
    _tempGp.addLayer(marker)
    layerGp.addLayer(_tempGp)
    let cachePov: PovI = { heading: 0, pitch: 0 }
    marker.on('dragend', () => {
      const newPosi = marker.getLatLng()
      // @ts-ignore
      const newBdpoint = new BMap.Point(newPosi.lng, newPosi.lat)
      convertor.translate([newBdpoint], 3, 5, (data) => {
      if (data.status === 0) {
          bdPanorama.setPosition(data.points[0])
          bdPanorama.show()
        }
      })
    })
    bdPanorama.addEventListener('position_changed', () => {
      const newBdpos = bdPanorama.getPosition()
      const latlng = bdPoint2Gcj(newBdpos.lat, newBdpos.lng)
      marker.setLatLng(latlng)
      bdPanorama.setPov(cachePov)
    })
    bdPanorama.addEventListener('pov_changed', () => {
      const { heading, pitch } = bdPanorama.getPov()
      cachePov = { heading, pitch }
      const indicatorDom = document.getElementById('bd-street-indicator')
      if (indicatorDom) {
        indicatorDom.style.transform = `rotateZ(${heading}deg)`
      }
    })
  }
  @Watch('latlng', { immediate: true })
  async onLatlngChange() {
    this.$nextTick(() => {
      if (this.latlng) {
        const t = setInterval(() => {
          if (this.getBdPanorama() && this.getConvertor()) {
            clearInterval(t)
            this.handleOnLoadBdPanorama(this.latlng!)
          }
        }, 300)
      }
    })
  }

  genMarker(latlng: L.LatLngLiteral, direction: number) {
    const fsize = 30
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        html: `
          <svg id="bd-street-indicator" style="transform: rotateZ(${direction}deg);transform-origin: center" t="1604567275996" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12507" width="30" height="30">
            <path d="M546.13333333 154.73333333L163.43333333 899.93333333l371.8-185.7L902.33333333 912.83333333l-356.2-758.1z m0 0" p-id="12508" fill="#d4237a"></path>
          </svg>
        `,
        iconSize: [fsize, fsize],
        iconAnchor: [fsize / 2, fsize / 2]
      }),
      draggable: true
    })
    return marker
  }
  initClass() {
    const BMap = (window as any).BMap
    const bdPanorama = BMap ? new BMap.Panorama('bd-panorama') as BdPanoramaI : null
    const convertor = BMap ? new BMap.Convertor() : null
    this.getBdPanorama = () => bdPanorama
    this.getConvertor = () => convertor
  }
  beforeDestroy() {
    this.getLayerGps[0]().clearLayers()
  }

  mounted() {
    if ((window as any).BMap) {
      console.log('BMap已经初始化过了')
      this.initClass()
      return
    }
    const script = document.createElement('script')
    script.setAttribute('src', 'http://api.map.baidu.com/getscript?v=3.0&ak=sXIlmcTkWppcB750ciIX8h64B5alPsK2&services=&t=20200327103013')
    document.head.appendChild(script)
    this.initLoading = true
    script.onload = () => {
      this.initClass()
      this.initLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.panorama {
  width: 100%;
  height: 100%;
  .empty {
    text-align: center;
  }
}
</style>


