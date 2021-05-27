<template>
  <Modal 
    :value="visible" 
    :width="70"
    class-name="vertical-center-modal"
    :mask-closable="false"
    :closable="false"
    @on-ok="handleOnCancel"
    @on-cancel="handleOnCancel">
    <p slot="header" style="text-align:center">
      <span>子块选择(点击矩形进行选择，当前处于{{ radio ? '单选' : '多选' }}模式)</span>
    </p>
    <div class="map-container" v-if="visible">
      <NMap @map-ready="onMapReady"/>
    </div>
  </Modal>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import NMap from '@/components/dumb/N-map.vue'
import { GetMapT } from '@/components/dumb/types'
import L, { Circle, Rectangle } from 'leaflet'
import { getLayerGpFn, bindTooltip } from '@/utils'
import * as basemapMachine from '@/models/machine/basemap'
import { BlockI } from '@/models/machine/basemap'

@Component({ components: { NMap } })
export default class TileNoSelect extends Vue {
  @Prop({ type: Boolean, default: false }) readonly visible!: boolean
  @Prop({ type: Boolean, default: false }) readonly radio!: boolean // 单选
  @Prop({ type: Number, default: 0 }) readonly cityCode!: number
  @Prop({ type: Array, default: () => [] }) readonly renderBlocks!: BlockI[] // 应该被绘制的可供选择的大块小块
  @Prop({ type: Array, default: () => [] }) readonly renderHighlightBlocks!: BlockI[] // 应该被绘制的高亮小块
  getMap!: GetMapT
  getLayerGp: Array<() => L.FeatureGroup> = getLayerGpFn(1)
  hasLayer: boolean = false
  selectedBlocks: BlockI[] = []

  @Emit('on-cancel')
  handleOnCancel() {
    return true
  }
  @Watch('cityCode')
  onCityCodeChanged() {
    this.hasLayer = false
    this.getLayerGp[0]().clearLayers()
    this.selectedBlocks = []
    this.onReturnSelectBlocks()
  }
  @Emit('onGetSelectedBlocks')
  onReturnSelectBlocks() {
    return this.selectedBlocks.filter((item) => item.block_ids.length)
  }

  async onMapReady(getMap: GetMapT) {
    this.getMap = getMap
    const map = getMap()
    const layerGp = this.getLayerGp[0]()
    layerGp.clearLayers()
    const highlightLayerGp = L.featureGroup()
    const res = await basemapMachine.loadTiles(this.cityCode)
    if (!res) {
      this.$Message.error('拉取瓦片数据失败！')
      return
    }
    const { Tiles } = res
    const { renderBlocks, renderHighlightBlocks } = this
    const renderBlockNos = renderBlocks.map((bl) => bl.block_no)
    // 先筛选出大块，再筛选出满足要求的小块
    const renderTiles = renderBlockNos.length ? Tiles.filter((t) => {
      return renderBlockNos.includes(t.BlockNo)
    }).map((r) => {
      const filterBlockIds = r.SubBlock.filter((sub) => {
        return renderBlocks.find((bl) => {
          return bl.block_no === r.BlockNo && bl.block_ids.includes(sub.BlockId)
        })
      })
      return {
        ...r,
        SubBlock: filterBlockIds
      }
    }) : Tiles

    renderTiles.forEach((tile, index: number) => {
      const { LeftTopLat, LeftTopLon, RightBottomLat, RightBottomLon, POINum, BlockNo, SubBlock } = tile
      const recContainer = L.rectangle(
        [
          [+LeftTopLat, +LeftTopLon],
          [+RightBottomLat, +RightBottomLon]
        ],
        {
          color: '#3388ff',
          fillOpacity: 0.2,
          fillColor: '#3388ff',
          weight: 1,
          interactive: false,
          attribution: `瓦片编号: ${BlockNo} POI数量: ${POINum}`
        }
      )
      const subRecStyle = {
        color: '#d55',
        fillOpacity: 0.2,
        fillColor: '#d55',
        weight: 1
      }
      SubBlock.forEach((sub) => {
        const { BlockId, DiffPOINum } = sub
        const highlightStyle = renderHighlightBlocks.find((bl) => {
          return bl.block_no === BlockNo && bl.block_ids.includes(BlockId)
        }) ? { fillColor: 'green', fillOpacity: 1 } : null
        const subRec = L.rectangle(
          [
            [+sub.LeftTopLat, +sub.LeftTopLon],
            [+sub.RightBottomLat, +sub.RightBottomLon]
          ],
          { ...subRecStyle, ...(highlightStyle || {}) }
        ).on('click', () => {
          // 是否已经被选择了
          const findItem = this.selectedBlocks.find((item) => item.block_no === BlockNo && item.block_ids.includes(BlockId))
          if (findItem) {
            subRec.setStyle(subRecStyle)
            const itemIndex = this.selectedBlocks.indexOf(findItem)
            const blockIdIndex = findItem.block_ids.indexOf(BlockId)
            this.$set(this.selectedBlocks, itemIndex, {
              ...findItem,
              block_ids: [
                ...findItem.block_ids.slice(0, blockIdIndex),
                ...findItem.block_ids.slice(blockIdIndex + 1)
              ]
            })
          } else {
            // 单选
            if (this.radio) {
              layerGp.eachLayer((layer) => {
                (layer as any).isSub && (layer as Rectangle).setStyle(subRecStyle)
              })
              this.selectedBlocks.forEach((item, index) => {
                this.selectedBlocks[index].block_ids = []
              })
            }
            if (!this.radio) {
              const limited25 = this.selectedBlocks.reduce((acc, cur) => [...acc, ...cur.block_ids], [] as string[]).length >= 25
              if (limited25) {
                this.$Message.warning('子块数量不得超过25个')
                return
              }
            }
            subRec.setStyle({ ...subRecStyle, fillColor: 'green', fillOpacity: 1 })
            const exsistItem = this.selectedBlocks.find((item) => item.block_no === BlockNo)
            if (exsistItem) {
              const exsistItemIndex = this.selectedBlocks.indexOf(exsistItem)
              this.$set(this.selectedBlocks, exsistItemIndex, {
                ...exsistItem,
                block_ids: [
                  ...exsistItem.block_ids,
                  BlockId
                ]
              })
            } else {
              this.selectedBlocks = [
                ...this.selectedBlocks,
                {
                  block_no: BlockNo,
                  block_ids: [BlockId]
                }
              ]
            }
          }
          this.onReturnSelectBlocks()
        });
        (subRec as any).isSub = true
        if (highlightStyle) {
          highlightLayerGp.addLayer(subRec)
        }
        bindTooltip(subRec, `瓦片ID: ${sub.BlockId}<br />DiffPOI数量: ${DiffPOINum}`, { permanent: false })
        layerGp.addLayer(subRec)
      })
      layerGp.addLayer(recContainer)
    })
    map.addLayer(layerGp)
    const HighBounds = highlightLayerGp.getBounds()
    if (HighBounds.isValid()) {
      map.fitBounds(HighBounds)
      return
    }
    const bounds = layerGp.getBounds()
    bounds.isValid() && map.fitBounds(bounds)
  }
}
</script>

<style scoped lang='less'>
.map-container {
  width: 100%;
  height: 70vh;
  min-height: 50vh;
}
</style>
