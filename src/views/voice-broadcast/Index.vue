<template>
  <NIndex :menus="menus" />
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { UserInfoI } from '@/presenter/common.pre'
import NIndex from '@/components/dumb/N-index.vue'
import { SubMenuI } from '@/components/dumb/types';

@Component({ components: { NIndex } })
export default class VoiceBroadcastEvaluation extends Vue {
  get menus(): SubMenuI[] {
    return [
      {
        name: 'indicator',
        access: true,
        title: '指标概览',
        subMenuItems: [
          {
            name: 'sub-indicator',
            to: '',
            title: '播报内容',
            subMenuItems: [
              {
                name: 'call-rates',
                to: '/voice-broadcast/call-rates',
                title: '准召率'
              },
              {
                name: 'machine-recall',
                to: '/voice-broadcast/machine-recall',
                title: '竞品一致率'
              }
            ]
          },
          {
            name: 'indicator-panel',
            to: '/voice-broadcast/indicator-panel',
            title: '播报时机'
          }
        ]
      },
      {
        name: 'machine',
        access: !!this.nc_task,
        title: '机器评测',
        subMenuItems: [
          {
            name: 'create-task',
            to: '/voice-broadcast/create-task',
            title: '创建任务'
          },
          {
            name: 'completed-tasks',
            to: '/voice-broadcast/completed-tasks',
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
            name: 'task-manager',
            to: '/voice-broadcast/task-manager',
            title: '评测管理'
          },
          {
            name: 'task-evaluation',
            to: '/voice-broadcast/task-evaluation',
            title: '评测标注'
          }
        ]
      },
      {
        name: 'truth',
        access: !!this.nc_truth,
        title: '真值库',
        subMenuItems: [
          {
            name: 'truth-manage',
            to: '/voice-broadcast/truth-manage',
            title: '真值管理'
          }
        ]
      }
    ]
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get isTest() {
    return this.userInfo.username === 'test'
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task() {
    return this.isTest || this.flags.some((f) => f.name.includes('nc_task'))
  }
  get nc_job() {
    return this.isTest || this.flags.some((f) => f.name.includes('nc_job'))
  }
  get nc_truth() {
    return this.isTest || this.flags.some((f) => f.name.includes('nc_truth'))
  }
}
</script>

