<template>
  <div class="task-manager-list">
    <template v-if="nc_job_manager">
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="内容任务" name="content" tab="level1">
          <ContentJob />
        </TabPane>
        <TabPane label="时机任务" name="tick" tab="level1">
          <TickJob />
        </TabPane>
        <TabPane label="内容和时机任务" name="contentAndtick" tab="level1">
          <ContentAndTickIndex />
        </TabPane>
      </Tabs>
    </template>
    <template v-else>
      <div class="no-permission">无此页面权限</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import queryString from 'query-string'
import ContentJob from './vb-job-manager-content/ContentIndex.vue'
import TickJob from './vb-job-manager-tick/TickIndex.vue'
import ContentAndTickIndex from './vb-job-manager-contentAndtick/ContentAndTickIndex.vue'
import { UserInfoI } from '@/models/common'

@Component({ components: { ContentJob, TickJob, ContentAndTickIndex } })
export default class JobManagerTab extends Vue {
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job_manager() {
    return this.flags.some((f) => f.name.includes('nc_job_manager'))
  }
  get activeTab() {
    const query = this.$route.query
    const { tab1 } = query
    return tab1 || 'content'
  }

  handleOnTabClick(name: string) {
    const { query, path, fullPath } = this.$route
    if (query.hasOwnProperty('tab1')) {
      const newQuery = {
        ...query,
        tab1: name
      }
      this.$router.push(`${path}?${queryString.stringify(newQuery)}`)
    } else {
      const hasQuery = Object.keys(query).length
      this.$router.push(`${fullPath}${hasQuery ? '&' : '?'}tab1=${name}`)
    }
  }
}
</script>
