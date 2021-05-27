<template>
  <div class="task-manager-list">
    <Tabs :value="activeTab" name="level2">
      <TabPane label="常规任务" name="normal" tab="level2">
        <ContentAndTickNormal />
      </TabPane>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContentAndTickNormal from './contentAndTick/ContentAndTaskNormal.vue'

@Component({ components: { ContentAndTickNormal } })
export default class ContentAndTickIndex extends Vue {
  get activeTab() {
    const query = this.$route.query
    const { tab2 } = query
    return 'normal'
  }
}
</script>
