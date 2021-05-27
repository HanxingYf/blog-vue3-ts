<template>
  <div class="navi_map-tools" @click.stop @dblclick.stop @mousewheel.stop>
    <div class="map-tool" @click="isMarkActive = !isMarkActive" :class="isMarkActive ? 'active' : ''">
      <Tooltip placement="left" content="标注打点" theme="light">
        <Icon type="ios-pin" />
      </Tooltip>
    </div>
    <div class="map-tool" @click="isLinkTopActive = !isLinkTopActive" :class="isLinkTopActive ? 'active' : ''">
      <Tooltip placement="left" content="link置于顶层/底层" theme="light">
        <Icon type="logo-buffer" />
      </Tooltip>
    </div>
    <div class="map-tool" @click="isRangeActive = !isRangeActive" :class="isRangeActive ? 'active' : ''">
      <Tooltip placement="left" content="测距" theme="light">
        <Icon type="ios-remove" />
      </Tooltip>
    </div>
    <Poptip placement="left-start">
      <div class="map-tool">
        <Tooltip placement="left" content="路网版本" theme="light">
          <Icon type="ios-list" />
        </Tooltip>
      </div>
      <div slot="content" class="map-tool-poptip" style="max-height: 200px;overflow-y: scroll">
        <RadioGroup v-model="mapVersion" vertical>
          <Radio v-for="(item, index) in roadNetVersions" :label="item.version" :key="index">
            <span>{{ item.version }}</span>
          </Radio>
        </RadioGroup>
      </div>
    </Poptip>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import L, { FitBoundsOptions, Layer, FeatureGroup, LeafletMouseEvent, LeafletEvent, LatLngLiteral } from 'leaflet'
import { bindPopup, genGeojsonLayer, getStreetJumpCb } from '@/utils/leaflet'
import Measure from './measure'
import { pullNearbyLink, pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { State } from 'vuex-class'

@Component
export default class NMapTools extends Vue {
  @Prop({ type: Function, default: () => null }) readonly getMap!: () => L.Map
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  mapVersion = ''
  isMarkActive: boolean = false
  isRangeActive: boolean = false
  isLinkTopActive: boolean = false
  measure!: Measure
  layerGpForLink = L.featureGroup()

  @Watch('isRangeActive')
  onIsRangeActive(val: boolean) {
    if (val) {
      this.isMarkActive = false
      this.measure.startMeasuring()
    } else {
      this.measure.stopMeasuring()
    }
  }
  @Watch('isLinkTopActive')
  onIsLinkTopActive(val: boolean) {
    if (val) {
      this.layerGpForLink.bringToFront()
    } else {
      this.layerGpForLink.bringToBack()
    }
  }
  @Watch('isMarkActive')
  onIsMarkActiveChange(val: boolean) {
    const map = this.getMap()
    if (!map) {
      return
    }
    if (val) {
      this.isRangeActive = false
      map.getContainer().style.cursor = 'crosshair'
      map.on('click', this.handOnClickMap)
    } else {
      map.getContainer().style.cursor = 'auto'
      map.off('click', this.handOnClickMap)
    }
  }
  @Emit('on-open-pano')
  onOpenPano(latlng: LatLngLiteral) {
    return latlng
  }

  async handOnClickMap(e: LeafletEvent) {
    const map = this.getMap()
    const layerGp = L.featureGroup()
    this.isMarkActive = false
    const latlng = (e as LeafletMouseEvent).latlng
    const marker = this.genMarker(latlng)
    layerGp.addLayer(marker)
    marker.openPopup()
    const link_ids = await pullNearbyLink(latlng, [this.mapVersion])
    if (link_ids.length) {
      marker.bindTooltip('加载link...', { permanent: true, offset: [10, -10], direction: 'right' })
      const geojson = await pullLinkGeojson(link_ids, [this.mapVersion])
      marker.unbindTooltip()
      const layer = geojson && genGeojsonLayer(geojson)
      layer && layerGp.addLayer(layer)
      layer && layer.bringToBack()
    }
    marker.on('contextmenu', () => {
      map.removeLayer(layerGp)
    })
    this.layerGpForLink.addLayer(layerGp)
    map.addLayer(this.layerGpForLink)
  }
  genMarker(latlng: LatLngLiteral) {
    const marker = new L.Marker(latlng, {
      icon: L.icon({
        iconUrl: require('@/assets/images/pointer.svg'),
        iconSize: [20, 20],
        iconAnchor: [10, 20]
      })
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
          this.onOpenPano(latlng)
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
    return marker
  }

  mounted() {
    const map = this.getMap()
    this.measure = new Measure(map);
    (map as any).on('customMeasureStatus', (ev: { status: boolean }) => {
      this.isRangeActive = !!ev.status
    })
    this.$nextTick(() => {
      this.mapVersion = this.roadNetVersions[0] ? this.roadNetVersions[0].version : ''
    })
  }
}
</script>

<style lang='less' scoped>
.navi_map-tools {
  position: absolute;
  z-index: 999;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  .map-tool {
    margin-bottom: 10px;
    text-align: center;
    border-radius: 4px;
    font-size: 18px;
    background-color: #ffffff;
    border: 1px solid rgba(0, 0, 0, .2);
    box-shadow: 0 0 13px rgba(0, 0, 0, .2);
    transition: all .2s ease;
    i {
      font-weight: 500;
      padding: 6px;
    }
    &:hover, &.active {
      border-color: #ff6600;
      color: #ff6600;
    }
  }
}
</style>
