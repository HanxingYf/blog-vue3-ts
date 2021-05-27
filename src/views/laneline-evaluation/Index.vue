<template>
  <NIndex :menus="menus" />
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { UserInfoI } from '@/presenter/common.pre'
import NIndex from '@/components/dumb/N-index.vue'
import { SubMenuI } from '@/components/dumb/types';

@Component({ components: { NIndex } })
export default class Index extends Vue {
  get menus(): SubMenuI[] {
    return [
      {
        name: 'machine',
        access: !!this.nc_task,
        title: '机器评测',
        subMenuItems: [
          {
            name: 'laneline-create-task',
            to: '/laneline-evaluation/create-task',
            title: '创建任务'
          },
          {
            name: 'laneline-completed-tasks',
            to: '/laneline-evaluation/completed-tasks',
            title: '已完成任务'
          }
        ]
      },
      {
        name: 'manager',
        access: !!this.nc_job,
        title: '我的任务',
        subMenuItems: [
          {
            name: 'laneline-task-manager',
            to: '/laneline-evaluation/task-manager',
            title: '评测管理'
          },
          {
            name: 'laneline-task-evaluation',
            to: '/laneline-evaluation/task-evaluation',
            title: '评测标注'
          }
        ]
      }
    ]
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task() {
    return this.flags.some((f) => f.name.includes('nc_task'))
  }
  get nc_job() {
    return this.flags.some((f) => f.name.includes('nc_job'))
  }
}
</script>
