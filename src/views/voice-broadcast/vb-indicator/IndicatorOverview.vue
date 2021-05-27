<template>
  <div class="indicator-overview">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class IndicatorOverview extends Vue {
}
</script>
