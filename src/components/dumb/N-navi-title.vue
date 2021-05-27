<template>
  <div class="code-title">
    <Breadcrumb>
      <template v-for="(item, index) in naviTitle">
        <template v-if="item.to">
          <BreadcrumbItem v-bind:key="index" :to="item.to">
            {{ item.name }}
          </BreadcrumbItem>
        </template>
        <template v-else>
          <BreadcrumbItem v-bind:key="index">
            {{ item.name }}
          </BreadcrumbItem>
        </template>
      </template>  
    </Breadcrumb>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
interface TitleItem {
  name: string
  to?: string
}

@Component
export default class NaviTitle extends Vue {
  @Prop({
    type: Array,
    default: (() => ([]))
  }) readonly naviTitle!: TitleItem[]
}
</script>

<style lang="less" scoped>
.code-title {
  font-weight: bold;
  padding: 0 0 10px 0;
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 15px;
  font-size: 16px;
}
</style>
