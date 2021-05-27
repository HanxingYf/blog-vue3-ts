<template>
  <div class="completed-tasks">
    <template v-if="nc_task_list">
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="矢量图" name="vector" tab="level1">
          <VectorTaskList/>
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
import VectorTaskList from './TaskList.vue'

@Component({
  components: {
    VectorTaskList
  }
})
export default class IndexTab extends Vue {
  get flags() {
    return this.$store.state.userInfo.flags
  }
  get nc_task_list() {
    return this.flags.some((f: any) => f.name.includes('nc_task_list'))
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