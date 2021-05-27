<template>
  <div class="truth-database">
    <NaviTitle :navi-title="naviTitle" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NaviTitle from '@/components/dumb/N-navi-title.vue'

@Component({
  components: {
    NaviTitle
  }
})

export default class Index extends Vue {
  get naviTitle() {
    const route = this.$route
    if (route.path.includes('truth-manage')) {
      return [
          {
            name: '真值管理'
          }
        ]
      }
  }
}
</script>