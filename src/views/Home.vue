<template>
  <div class="home">
    <h1>欢迎来到滴滴罗盘</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Home extends Vue {}
</script>

<style lang="less" scoped>
.home {
  text-align: center;
  padding-top: 100px;
}
</style>
