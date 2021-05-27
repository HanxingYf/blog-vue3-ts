<template>
  <div class='sync-map-wrapper' :style="{ 'grid-template-columns': `repeat(${voices.length}, ${100 / voices.length}%)` }">
    <div class="map-container" v-for="(voice, index) in voices" :key="index">
      <div v-if="voice" class="voice" :class="voice.includes('滴滴') ? 'voice-left' : ''">
        <template v-if="voice.includes('#')">
          <p>{{ voice.split('#')[0] }}</p>
          <p>{{ voice.split('#')[1] }}</p>
        </template>
        <template v-else>{{ voice }}</template>
      </div>
      <div v-if="marks[index]" class="mark">{{ marks[index] || '未设置' }}</div>
      <div class="layers-control" v-if="layerControls">
        <div v-for="(item, idx) in layerControls[index]" :key="idx">
          <Checkbox v-model="item.checked" @on-change="item.check">{{ item.name }}</Checkbox>
        </div>
      </div>
      <div class="label-mark">
        <slot name="label-mark"></slot>
      </div>
      <div class="label-diff">
        <slot name="label-diff"></slot>
      </div>
      <NMap @map-ready="onMapReady" @open-pano="onOpenPano">
        <template v-if="allMapReady && needMapTools" slot="navi-map-tools">
          <NMapTools :get-map="maps[index]" @on-open-pano="onOpenPano" />
        </template>
      </NMap>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import NMap from '@/components/dumb/N-map.vue'
import NMapTools from '@/components/dumb/N-map-tools.vue'
import { GetMapT } from './types'
import L, { LatLngLiteral } from 'leaflet'
import 'leaflet.sync'
import { LayerCtlI } from '@/types'

@Component({ components: { NMap, NMapTools } })
export default class SyncMap extends Vue {
  @Prop({ type: Array, default: () => (['', '']) }) readonly voices!: string[]
  @Prop({ type: Array, default: () => (['', '']) }) readonly marks!: string[]
  @Prop({ type: Array, default: () => ([]) }) readonly layerControls!: LayerCtlI[][]
  @Prop({ type: Boolean, default: true }) readonly needMapTools!: boolean
  maps: GetMapT[] = []
  allMapReady: boolean = false

  @Emit('sync-map-ready')
  onSyncMapReady() {
    this.allMapReady = true
    return this.maps
  }
  @Emit('on-open-pano')
  onOpenPano(latlng: LatLngLiteral) {
    return latlng
  }

  onMapReady(getMap: GetMapT) {
    const map = getMap()
    this.maps.forEach((m) => {
      (m() as any).sync(map);
      (map as any).sync(m())
    })
    this.maps = [
      ...this.maps,
      () => map
    ]
    if (this.maps.length === this.voices.length) {
      this.onSyncMapReady()
    }
  }
}
</script>

<style scoped lang='less'>
.sync-map-wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  .map-container {
    width: 100%;
    height: 100%;
    // min-height: 400px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, .1);
    .voice, .mark {
      position: absolute;
      top: 10px;
      color: #ffffff;
      background-color: #ff6600;
      font-size: 16px;
      border-radius: 4px;
      padding: 5px;
      left: 50%;
      z-index: 99999;
      transform: translateX(-50%);
      &.voice-left {
        left: 10px;
        transform: unset;
      }
    }
    .mark {
      left: 10px;
      transform: unset;
    }
    .layers-control, .label-mark, .label-diff {
      position: absolute;
      right: 100px;
      z-index: 99999;
      bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: aliceblue;
      box-shadow: 0 0 13px #00000029;
      border-radius: 3px;
    }
    .label-mark, .label-diff {
      bottom: unset;
      right: unset;
      top: 10px;
      background-color: transparent;
      display: block;
      left: 10px;
      transform: unset;
    }
    .label-diff {
      max-height: 100%;
      left: 0;
      top: 0;
      overflow: scroll;
      box-shadow: unset;
    }
  }
}
</style>
