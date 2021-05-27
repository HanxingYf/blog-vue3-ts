<template>
  <div class="completed-tasks">
    <template v-if="nc_job_mark">
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="底图评测" name="basemap" tab="level1">
          <BasemapIndex/>
        </TabPane>
      </Tabs>
    </template>
    <template v-else>
      <div class="no-permission">
        无此页面权限
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import queryString from 'query-string'
import BasemapIndex from './be-job-evaluation-basemap/basemap/BasemapList.vue'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    BasemapIndex
  }
})
export default class JobEvaluationTab extends Vue {
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job_mark() {
    return this.flags.some((f) => f.name.includes('nc_job_mark'))
  }
  get activeTab() {
    const query = this.$route.query
    const { tab } = query
    return tab || 'basemap'
  }
  handleOnTabClick(name: string) {
    const { query, path, fullPath } = this.$route
    if (name === query.tab) {
      return
    }
    if (query.hasOwnProperty('tab')) {
      const newQuery = {
        ...query,
        tab: name
      }
      this.$router.push(`${path}?${queryString.stringify(newQuery)}`)
    } else {
      if (Object.keys(query).length) {
        this.$router.push(`${fullPath}&tab=${name}`)
      } else {
        const hasQuery = Object.keys(query).length
        this.$router.push(`${fullPath}${hasQuery ? '&' : '?'}tab=${name}`)
      }
    }
  }
}
</script>