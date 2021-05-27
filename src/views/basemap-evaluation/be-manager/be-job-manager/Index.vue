<template>
  <div class="task-manager">
    <template v-if="nc_job">
      <NaviTitle :navi-title="naviTitle"/>
      <router-view />
    </template>
    <template v-else>
      <div class="no-permission">
        无此页面权限
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    NaviTitle
  }
})
export default class JobManagerIndex extends Vue {
  get naviTitle() {
    const path = this.$route.path
    const titles: Array<{ name: string; to?: string }> = [{ name: '评测列表' }]
    const to1 = '/basemap-evaluation/task-manager/task-list'
    switch (true) {
      case path.includes('basemap-task-detail'):
        titles[0].to = to1
        titles.push({ name: '底图评测已标注列表' })
        break;
      case path.includes('basemap-task-statistics'):
        titles[0].to = to1
        titles.push({ name: '底图评测统计' })
        break;
      default:
        break;
    }
    return titles
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job() {
    return this.flags.some((f) => f.name.includes('nc_job'))
  }
}
</script>
