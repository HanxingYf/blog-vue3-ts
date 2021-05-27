<template>
  <div class='label-with-map-wrapper'>
    <Split v-model="split1" @on-moving="onResize">
      <div slot="left" class="map-wrapper">
        <Split v-model="split2" mode="vertical" @on-moving="onResize">
          <div slot="top" class="map-area">
            <NSyncMap 
              @sync-map-ready="onSyncMapReady" 
              :voices="voices"
              :marks="marks"
              :need-map-tools="true" 
              :layerControls="layerControls"
              @on-open-pano="onOpenPano" >
              <template slot="layers-control">
                <slot name="layers-control"></slot>
              </template>
              <template slot="label-mark">
                <slot name="label-mark"></slot>
              </template>
              <template slot="label-diff">
                <slot name="label-diff"></slot>
              </template>
            </NSyncMap>
          </div>
          <div slot="bottom" class="street-area" v-if="hasPano">
            <Split v-model="split3">
              <div class="bd-pano" slot="left">
                <NBDpano :latlng="latlng" :getMaps="maps"/>
              </div>
              <div class="dd-pano" slot="right">
                <NDDpano :latlng="latlng" :getMaps="maps"/>
              </div>
            </Split>
          </div>
        </Split>
      </div>
      <div slot="right" class="label-wrapper" v-if="hasForm">
        <slot name="label-form"></slot>
      </div>
    </Split>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import NSyncMap from '@/components/dumb/N-sync-map.vue'
import NDDpano from '@/components/dumb/N-dd-pano.vue'
import NBDpano from '@/components/dumb/N-bd-pano.vue'
import { GetMapT } from '@/components/dumb/types'
import { LatLngLiteral } from 'leaflet'
import { LayerCtlI } from '@/types'

@Component({
  components: { NSyncMap, NDDpano, NBDpano }
})
export default class LabelWithMap extends Vue {
  @Prop({ type: Array, default: () => (['', '']) }) readonly voices!: string[]
  @Prop({ type: Array, default: () => (['', '']) }) readonly marks!: string[]
  @Prop({ type: Array, default: () => ([]) }) readonly layerControls!: LayerCtlI[][]
  @Prop({ type: Boolean, default: true }) readonly hasPano!: boolean
  @Prop({ type: Boolean, default: true }) readonly hasForm!: boolean
  @Prop({ type: Object, default: () => null }) readonly latlngForPano!: LatLngLiteral | null
  split1: number = 0.76
  split2: number = 0.7
  split3: number = 0.4
  maps: GetMapT[] = []
  latlng: LatLngLiteral | null = null

  @Watch('latlngForPano')
  onLatlngForPanoChanged() {
    if (this.latlngForPano) {
      this.latlng = this.latlngForPano
    }
  }

  @Emit('map-ready')
  onSyncMapReady(maps: GetMapT[]) {
    this.maps = maps
    return { maps, resize: this.onResize }
  }
  onOpenPano(latlng: LatLngLiteral) {
    this.latlng = latlng
  }
  onResize() {
    this.maps.forEach((getMap) => getMap().invalidateSize())
  }
  mounted() {
    if (!this.hasPano) {
      this.split2 = 0.99
    }
    if (!this.hasForm) {
      this.split1 = 0.99
    }
  }
}
</script>

<style scoped lang='less'>
.label-with-map-wrapper {
  position: relative;
  width: 100%;
  height: 95vh;
  .map-wrapper {
    width: 100%;
    height: 100%;
    .map-area, .street-area {
      position: relative;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(143, 141, 141, 0.24);
      .voice {
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
      }
    }
    .street-area {
      height: 100%;
      .bd-pano {
        height: 100%;
      }
      .dd-pano {
        height: 100%;
      }
    }
  }
  .label-wrapper {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(143, 141, 141, 0.24);
    overflow: hidden;
  }
}
</style>
