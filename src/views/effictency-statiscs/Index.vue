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
        name: 'effictency',
        access: true,
        title: '效率统计',
        subMenuItems: [
          {
            name: 'effictency-works',
            to: '/effictency-statiscs/effictency-works',
            title: '作业量及任务量'
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
