<template>
  <Table 
    row-key="id"
    :columns="columns" 
    :data="dataSource" 
    border 
    size="small">
    <template slot-scope="{ row, index }" slot="level">
      {{ row.DispLevel[0] }}
    </template>
    <template slot-scope="{ row, index }" slot="keep">
      {{ row.keep === -1 ? '未标注' : (row.keep ? '保留' : '不保留') }}
    </template>
  </Table>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { PoiI } from '@/models/machine/basemap'
import { ExpandRowColumns } from './columns'

@Component
export default class ExpandRow extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly markedJson!: Array<{ level: number, pois: PoiI[] }>
  columns = ExpandRowColumns
  get dataSource() {
    return this.markedJson.reduce((acc: PoiI[], cur: { level: number, pois: PoiI[] }, index: number) => {
      const { pois, level } = cur
      return [
        ...acc,
        ...pois,
      ]
    }, [])
  }
}
</script>
