<template>
  <div class="task-evaluation">
    <template v-if="nc_job_mark">
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
export default class TaskEvaluation extends Vue {
  get naviTitle() {
    const path = this.$route.path
    if (RouterMatch(path, 'content-task-detail')) {
      return [
        {
          name: '评测列表',
          to: '/voice-broadcast/task-evaluation/task-list'
        },
        {
          name: '内容任务详情列表'
        }
      ]
    } else if (RouterMatch(path, 'tick-task-detail')) {
      return [
        {
          name: '评测列表',
          to: '/voice-broadcast/task-evaluation/task-list'
        },
        {
          name: '时机任务详情列表'
        }
      ]
    } else if (RouterMatch(path, 'codediff-task-detail')) {
      return [
        {
          name: '评测列表',
          to: '/voice-broadcast/task-evaluation/task-list'
        },
        {
          name: '自身codeDiff任务详情列表'
        }
      ]
    } else if (RouterMatch(path, 'content-and-tick-task-detail')) {
      return [
        {
          name: '评测列表',
          to: '/voice-broadcast/task-evaluation/task-list'
        },
        {
          name: '内容和时机任务详情列表'
        }
      ]
    } else {
      return [
        {
          name: '评测列表'
        }
      ]
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job_mark() {
    return this.flags.some((f) => f.name.includes('nc_job_mark'))
  }
}
</script>
