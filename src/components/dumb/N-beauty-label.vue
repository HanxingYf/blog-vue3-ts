<template>
  <div class="monospace-label">
    <span v-for="(t, i) in textArray" :key="i">
      {{ t }} {{ i == textArray.length - 1 ? ':' : '' }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class NBeautyLabel extends Vue {
  @Prop({
    type: String,
    default: ''
  }) readonly text!: string

  get textArray() {
    return this.text.split('')
  }
}
</script>

<style lang="less" scoped>
.monospace-label {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
