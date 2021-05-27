<template>
  <div class='wrapper'>
    
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'

@Component
export default class MyComponent extends Vue {
  @Prop({ type: String, default: '' }) readonly msg!: string
}
</script>

<style scoped lang='less'>
.wrapper {
  padding: 10px;
}
</style>
