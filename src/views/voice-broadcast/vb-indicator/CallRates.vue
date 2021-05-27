<template>
  <div class="call-rates" id="indicator">
    <NaviTitle :navi-title="[{ name: ' 准召率'}]" />
    <div class="indicator-chart" id="indicator-chart" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { SelectItem } from '@/types'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import DataeEmbed from '@didi/dps-datae-insert'

@Component({
  components: {
    NaviTitle
  }
})
export default class CallRates extends Vue {
  mounted() {
    const dataeEmbedInstance = new DataeEmbed(
      'indicator-chart', // 嵌入报表模块的父容器，值可为：容器id | HTMLElement
      {
        // height: '862px', // 默认值862px
        // locale: 'zh-CN', // zh-CN,en-US
        env: 'cn-online', // cn-test,cn-online,us-online
        // 工具栏，默认为：['dataInfo', 'blood']，可选 'download' | 'favourite' | 'dataInfo' | 'blood' | 'comment'
        toolbarConfig: ['dataInfo', 'blood', 'comment'],
        reportId: 77254,
        productId: 29000
      }
    )
    dataeEmbedInstance.reload({
      reportId: 77254,
      productId: 29000
    })
  }
}
</script>

<style lang="less" scoped>
.indicator-chart {
  margin-top: 20px;
}
</style>

