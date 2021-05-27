<template>
  <div class="completed-tasks">
    <template v-if="nc_task_list">
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
          name: '已完成任务列表',
          to: '/vector-evaluation/completed-tasks'
        },
        {
          name: '详情'
        }
      ]
    } else {
      return [
        {
          name: '已完成任务列表'
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
  get nc_task_list() {
    return this.flags.some((f) => f.name.includes('nc_task_list'))
  }
}
</script>

<style lang="less" scoped>
.completed-tasks {
  font-size: 14px;
}
</style>
