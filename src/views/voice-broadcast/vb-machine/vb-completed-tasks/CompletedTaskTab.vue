<template>
  <div class="completed-tasks">
    <template v-if="nc_task_list">
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="播报内容和高热code挖掘" name="content" tab="level1">
          <ContentTaskList/>
        </TabPane>
        <TabPane label="自身CodeDiff" name="codeDiff" tab="level1">
          <CodeDiffTaskList/>
        </TabPane>
        <TabPane label="播报时机" name="tick" tab="level1">
          <TickTaskList/>
        </TabPane>
        <TabPane label="播报内容和时机" name="contentAndTick" tab="level1">
          <ContentAndTickTaskList/>
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
import ContentTaskList from './completed-content-tasks/ContentTaskList.vue'
import TickTaskList from './completed-tick-tasks/TickTaskList.vue'
import CodeDiffTaskList from './completed-codediff-tasks/CodeDiffTaskList.vue'
import ContentAndTickTaskList from './completed-contentAndtick-tasks/ContentAndTikTaskList.vue'

@Component({
  components: {
    ContentTaskList,
    TickTaskList,
    CodeDiffTaskList,
    ContentAndTickTaskList
  }
})
export default class CompletedTaskTab extends Vue {
  get flags() {
    return this.$store.state.userInfo.flags
  }
  get nc_task_list() {
    return this.flags.some((f: any) => f.name.includes('nc_task_list'))
  }
  get activeTab() {
    const query = this.$route.query
    const { tab } = query
    return tab || 'content'
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