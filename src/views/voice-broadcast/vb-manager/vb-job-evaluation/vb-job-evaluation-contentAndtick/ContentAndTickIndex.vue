<template>
  <div class="task-manager-list">
    <Tabs :value="activeTab" name="level2">
      <TabPane label="常规任务" name="normal" tab="level2">
        <ContentAndTickList />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContentAndTickList from './contentAndtick/ContentAndTickList.vue'

@Component({ components: { ContentAndTickList } })
export default class TickIndex extends Vue {

  get activeTab() {
    const query = this.$route.query
    const { tab2 } = query
    return tab2 || 'normal'
  }
}
</script>
