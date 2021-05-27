<template>
  <div class="create-intelligence-task">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnImportHotCodeTask" 
      :loading="loading" 
      submit-text="导入任务"
      :has-cancel="false"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { SelectItem, ValueConfig } from '@/types'
import { importHotCodeTask, getRoadNetMapVersions } from '@/presenter/machine.pre.ts'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI, RoadVersionI } from '@/models/common';

@Component({
  components: {
    NFilter
  }
})
export default class CreateIntelligenceTask extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    city_code: {
      type: 'select-multi',
      label: '城市',
      value: [],
      options: this.city_list,
      placeholder: '选择城市',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.city_code.value.length ? '' : '请选择城市'
      }
    },
    map_version: {
      type: 'select',
      label: '路网版本',
      value: '',
      options: [],
      placeholder: '路网版本',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.map_version.value ? '' : '请选择路网版本'
      }
    },
    task_name: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.task_name.value ? '' : '请填写任务名称'
      }
    }
  }
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get flags() {
    return this.userInfo.flags
  }

  // methods
  async handleOnImportHotCodeTask() {
    const { city_code, task_name, map_version } = this.filterOptions
    this.loading = true
    const { imported, msg } = await importHotCodeTask({
      city_code: city_code.value,
      map_version: map_version.value,
      task_tag: task_name.value
    })
    this.loading = false
    if (imported) {
      this.$Message.success(`导入成功, ${msg}`)
      this.filterOptions.city_code.value = []
      this.filterOptions.task_name.value = ''
    } else {
      this.$Message.error(`导入失败, ${msg}`)
    }
  }

  async mounted() {
    const versions = await getRoadNetMapVersions()
    this.filterOptions.map_version.options = versions.map((r: any) => ({ label: r, value: r }))
  }
}
</script>

<style lang="less" scoped>
.create-intelligence-task {
  height: 500px;
}
</style>

