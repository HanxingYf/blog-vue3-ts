<template>
  <div class="create-task">
    <template v-if="nc_task_new">
      <NaviTitle :navi-title="[{ name: '创建任务' }]"/>
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="矢量图" name="vector" tab="level1">
          <CreateVectorTask />
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
import { Component, Vue } from 'vue-property-decorator'
import queryString from 'query-string'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import CreateVectorTask from './CreateVectorTask.vue'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    NaviTitle,
    CreateVectorTask
  }
})
export default class IndexTab extends Vue {
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_new() {
    return this.flags.some((f) => f.name.includes('nc_task_new'))
  }
  get activeTab() {
    const query = this.$route.query
    const { tab } = query
    return tab || 'vector'
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
        this.$router.push(`${fullPath}?tab=${name}`)
      }
    }
  }
}
</script>

