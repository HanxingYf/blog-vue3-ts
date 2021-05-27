<template>
  <div class="create-task">
    <template v-if="nc_task_new">
      <NaviTitle :navi-title="[{ name: '创建任务' }]"/>
      <Tabs :value="activeTab" name="level1" @on-click="handleOnTabClick">
        <TabPane label="播报内容" name="content" tab="level1">
          <CreateContentOrTickTask task-type="content"/>
        </TabPane>
        <TabPane label="高热Code挖掘" name="intelligence" tab="level1">
          <CreateIntelligenceTask />
        </TabPane>
        <TabPane label="自身CodeDiff" name="codeDiff" tab="level1">
          <CreateCodeDiffTask />
        </TabPane>
        <TabPane label="播报时机" name="tick" tab="level1">
          <CreateContentOrTickTask task-type="tick"/>
        </TabPane>
        <TabPane label="播报内容和时机" name="contentandtick" tab="level1">
          <CreateContentAndTickTask />
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
import CreateContentOrTickTask from './CreateContentOrTickTask.vue'
import CreateIntelligenceTask from './CreateIntelligenceTask.vue'
import CreateCodeDiffTask from './CreateCodeDiffTask.vue'
import CreateContentAndTickTask from './CreateContentAndTickTask.vue'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    NaviTitle,
    CreateContentOrTickTask,
    CreateIntelligenceTask,
    CreateCodeDiffTask,
    CreateContentAndTickTask
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

<style lang="less" scoped>

</style>

