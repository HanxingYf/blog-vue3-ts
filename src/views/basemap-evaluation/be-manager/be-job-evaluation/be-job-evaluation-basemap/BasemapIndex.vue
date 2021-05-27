<template>
  <div class="task-manager-list">
    <Tabs :value="activeTab" name="level2" @on-click="handleOnTabClick">
      <TabPane label="底图评测" name="normal" tab="level2">
        <BasemapList />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BasemapList from './basemap/BasemapList.vue'
import queryString from 'query-string'

@Component({ components: { BasemapList } })
export default class BasemapIndex extends Vue {
  get activeTab() {
    const query = this.$route.query
    const { tab2 } = query
    return tab2 || 'normal'
  }

  handleOnTabClick(name: string) {
    const { query, path, fullPath } = this.$route
    if (query.hasOwnProperty('tab2')) {
      const newQuery = {
        ...query,
        tab2: name
      }
      this.$router.push(`${path}?${queryString.stringify(newQuery)}`)
    } else {
      const hasQuery = Object.keys(query).length
      this.$router.push(`${fullPath}${hasQuery ? '&' : '?'}tab2=${name}`)
    }
  }
}
</script>
