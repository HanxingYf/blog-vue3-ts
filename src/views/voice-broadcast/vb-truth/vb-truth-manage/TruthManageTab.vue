<template>
  <Tabs :value="activeTab" @on-click="handleOnTabClick">
    <TabPane label="真值列表" name="normal-truth-list">
      <TruthList truth-type="normal" />
    </TabPane>
    <TabPane label="待继承真值列表" name="inhreit-truth-list">
      <TruthList truth-type="inhreit" />
    </TabPane>
  </Tabs>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import TruthList from './TruthList.vue'
import queryString from 'query-string'

@Component({
  components: { TruthList }
})
export default class TruthManageTab extends Vue {
  get activeTab() {
    const query = this.$route.query
    const { tab } = query
    return tab || 'normal-truth-list'
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
