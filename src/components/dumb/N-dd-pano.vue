<template>
  <div class='didi-pano'>
    <div class="mission-list">
      <Spin v-if="loadingMission" fix></Spin>
      <template v-if="missionsList.length">
        <div style="text-align: center; padding-top: 10px">
          <Checkbox v-model="layerCheck" @on-change="onCheckChange">行车记录仪</Checkbox>
        </div>
        <div class="list-item" v-for="(item, index) in missionsList" :key="index" @click="onClickMission(item)">
          <Tooltip transfer placement="top" :content="`更新时间: ${item.update_time }`">
            <Button :type="item.active ? 'primary' : 'default'">任务ID: {{ item.mid }}<Icon type="ios-arrow-forward" /></Button>
          </Tooltip>
          <Spin v-if="item.loading" fix></Spin>
        </div>
      </template>
      <div style="text-align: center; padding-top: 30px" v-else>无任务</div>
    </div>
    <div class="pic-list">
      <Spin v-if="loadingPics" fix></Spin>
      <template v-if="pics[curIndex - 1]">
        <img :src="pics[curIndex - 1]" :title="curIndex">
        <div class="indicator">
          <ButtonGroup shape="circle" size="small">
            <Button :disabled="curIndex === 1" @click="handleOnPreAndNext('prev')" type="primary">
              <Icon type="ios-arrow-back"></Icon>
            </Button>
            <Button type="primary">{{ curIndex }}/{{ pics.length }}</Button>
            <Button :disabled="curIndex === pics.length" @click="handleOnPreAndNext('next')" type="primary">
              <Icon type="ios-arrow-forward"></Icon>
            </Button>
          </ButtonGroup>
        </div>
      </template>
      <div style="text-align: center; padding-top: 30px" v-else>无图片</div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import { pullNearMission, pullNearMissionPics, MissionI } from '@/presenter/common.pre'
import L, { featureGroup, LatLngLiteral } from 'leaflet'
import { getLayerGpFn } from '@/utils'

@Component
export default class NDpano extends Vue {
  @Prop({ type: Array, default: () => ([]) }) readonly getMaps!: Array<() => L.Map>
  @Prop({ type: Object, default: () => null }) readonly latlng!: L.LatLngLiteral | null
  getLayerGps: Array<() => L.FeatureGroup<any>> = []
  missionsList: MissionI[] = []
  loadingMission: boolean = false
  loadingPics: boolean = false
  pics: string[] = []
  curIndex: number = 1
  layerCheck: boolean = true

  @Watch('getMaps')
  onGetMapsChanged() {
    this.getLayerGps = getLayerGpFn(this.getMaps.length)
    this.getMaps.forEach((getMap, index) => {
      const map = getMap()
      const layerGp = this.getLayerGps[index]()
      map.addLayer(layerGp)
    })
  }
  @Watch('latlng')
  async onLatlngChange() {
    if (this.getMaps.some((getMap) => !getMap())) {
      return
    }
    this.missionsList = []
    this.resetState()
    if (this.latlng) {
      this.loadingMission = true
      const missions = await pullNearMission(this.latlng)
      this.missionsList = missions
      this.loadingMission = false
      missions[0] && this.onClickMission(missions[0])
    }
  }
  resetState() {
    this.getLayerGps.forEach((getLayerGp) => getLayerGp().clearLayers())
    this.curIndex = 1
    this.pics = []
    this.missionsList.forEach((m) => {
      (m as any).active = false
    })
  }
  handleOnPreAndNext(type: 'prev' | 'next') {
    if (type === 'prev') {
      this.curIndex = this.curIndex - 1
    } else {
      this.curIndex = this.curIndex + 1
    }
    // 只触发一个点击，因为marker点击会自动同步
    this.getLayerGps[0]().getLayers()[this.curIndex - 1].fire('click')
  }
  async onClickMission(item: MissionI) {
    this.resetState();
    (item as any).active = true
    const { mid } = item;
    (item as any).loading = true
    this.loadingPics = true
    const { pics, geojson } = await pullNearMissionPics(mid);
    (item as any).loading = false
    this.loadingPics = false
    this.$forceUpdate()
    this.pics = pics
    if (geojson) {
      const { features } = geojson
      // 存储各layerGp内的marker数，用于点击marker同步设置高亮
      const markers: { [propName: number]: L.Marker[] } = []
      this.getLayerGps.forEach((getLayerGp, index) => {
        const layerGp = getLayerGp()
        features.forEach((f, i) => {
          const { geometry, properties } = f
          const { coordinates } = geometry
          const { direction } = properties
          const latlng = { lng: coordinates[0], lat: coordinates[1] }
          const marker = this.genMarker(latlng, direction)
          if (markers[index]) {
            markers[index].push(marker)
          } else {
            markers[index] = [marker]
          }
          marker.on('click', () => {
            this.curIndex = i + 1
            this.getLayerGps.forEach((getLayerGp, idx) => {
              getLayerGp().eachLayer((layer) => {
                (layer as any).setOpacity(0.2)
              })
              // 两边地图的marker同时设置高亮
              for (const k in markers) {
                if (markers.hasOwnProperty(k)) {
                  markers[k][i].setOpacity(1)
                }
              }
              const map = this.getMaps[idx]()
              map.setView(latlng, map.getZoom())
            })
          })
          layerGp.addLayer(marker)
        })
        // const map = this.getMaps[index]()
        // const bounds = layerGp.getBounds()
        // bounds.isValid() && map.fitBounds(bounds)
      })
    }
  }
  genMarker(latlng: LatLngLiteral, direction: number) {
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        html: `
          <img src="${require('@/assets/images/arrow.png')}"` +
          ` style="display:inline-block;width:15px;height:15px;border-radius:8px;` +
          ` background: blue;transform: rotateZ(${direction}deg);" />
        `,
        iconSize: [15, 15],
        iconAnchor: [7, 7]
      }),
      opacity: .2
    })
    return marker
  }
  onCheckChange(checked: boolean) {
    this.getMaps.forEach((getMap, index) => {
      const map = getMap()
      const layerGp = this.getLayerGps[index]()
      checked ? map.addLayer(layerGp) : map.removeLayer(layerGp)
    })
  }
}
</script>

<style scoped lang='less'>
.didi-pano {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  .mission-list {
    position: relative;
    height: 100%;
    overflow-y: scroll;
    border: 1px dashed rgba(128, 127, 126, 0.185);
    border-right: unset;
    .list-item {
      position: relative;
      cursor: pointer;
      padding: 5px 10px;
    }
  }
  .pic-list {
    height: 100%;
    flex: 1;
    position: relative;
    border: 1px dashed rgba(128, 127, 126, 0.185);
    .indicator {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
    img {
      width: 100%;
      height: 100%;
    }
    // }
  }
}
</style>
