<template>
  <div class="job-manager">
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
import { Component, Vue } from 'vue-property-decorator'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import { UserInfoI } from '@/presenter/common.pre'
@Component({
  components: {
    NaviTitle
  }
})
export default class Index extends Vue {
  get naviTitle() {
    const name: string = this.$route.name || ''
    const type = name.split('/')[2]
    if (type.includes('task-detail')) {
      return [
        {
          name: '评测管理列表',
          to: '/laneline-evaluation/task-manager'
        },
        {
          name: '评测任务已标注case列表'
        }
      ]
    } else if (type.includes('task-statistics')) {
      return [
        {
          name: '评测管理列表',
          to: '/laneline-evaluation/task-manager'
        },
        {
          name: '车信评测任务统计'
        }
      ]
    } else {
      return [
        {
          name: '评测管理列表'
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
  get nc_job() {
    return this.flags.some((f) => f.name.includes('nc_job'))
  }
}
</script>

<style lang="less" scoped>
.completed-tasks {
  font-size: 14px;
}
</style>
