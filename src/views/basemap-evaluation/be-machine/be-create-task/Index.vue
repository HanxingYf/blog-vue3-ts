<template>
  <div class="create-task">
    <template v-if="nc_task_new">
      <NaviTitle :navi-title="[{ name: '创建任务' }]"/>
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="POI底图评测" name="basemap" tab="level1">
          <CreateBasemapTask />
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
import CreateBasemapTask from './CreateBasemapTask.vue'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    NaviTitle,
    CreateBasemapTask
  }
})
export default class Index extends Vue {
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
        this.$router.push(`${fullPath}?tab=${name}`)
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>

