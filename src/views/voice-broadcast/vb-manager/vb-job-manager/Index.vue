<template>
  <div class="task-manager">
    <template v-if="nc_job">
      <NaviTitle :navi-title="naviTitle" />
      <router-view />
    </template>
    <template v-else>
      <div class="no-permission">无此页面权限</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import { UserInfoI } from '@/models/common';
import { RouterMatch } from '@/utils/routerMatch'

@Component({
  components: {
    NaviTitle
  }
})
export default class Index extends Vue {
  get naviTitle() {
    const path = this.$route.path
    const titles: Array<{ name: string; to?: string }> = [{ name: '评测列表' }]
    switch (true) {
      case RouterMatch(path, 'content-task-detail'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '内容任务已标注列表' })
        break;
      case RouterMatch(path, 'content-task-statistics'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '内容任务评测统计' })
        break;
      case RouterMatch(path, 'codediff-task-detail'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '自身codeDiff任务已标注列表' })
        break;
      case RouterMatch(path, 'codediff-task-statistics'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '自身codeDiff任务评测统计' })
        break;
      case RouterMatch(path, 'tick-task-detail'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '时机任务已标注列表' })
        break;
      case RouterMatch(path, 'tick-task-statistics'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '时机任务评测统计' })
        break;
      case RouterMatch(path, 'content-and-task-detail'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '内容和时机任务评已标注列表' })
        break;
      case RouterMatch(path, 'content-and-tick-task-statistics'):
        titles[0].to = '/voice-broadcast/task-manager/task-list'
        titles.push({ name: '内容和时机任务评测统计' })
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
