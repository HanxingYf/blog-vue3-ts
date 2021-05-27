<template>
  <Layout style="height: 100%">
    <Sider width="175" class="navi-sider">
      <Menu
        ref="iview_menu"
        style="width: 175px;height: 100%"
        theme="light"
        :open-names="openNames"
        :active-name="activeName">
        <Submenu v-for="(menu, index) in menus" :key="index" :name="menu.name" v-if="menu.access">
          <template slot="title">{{ menu.title }}</template>
          <template v-for="(sub, idx) in menu.subMenuItems || []">
            <!-- st -->
            <template v-if="sub.subMenuItems">
              <Submenu :name="sub.name">
                <template slot="title">{{ sub.title }}</template>
                <MenuItem v-for="(sub2, i) in sub.subMenuItems || []" :key="i" :name="sub2.name" :to="sub2.to">{{ sub2.title }}</MenuItem>
              </Submenu>
            </template>
            <template v-else>
              <MenuItem :name="sub.name" :to="sub.to">{{ sub.title }}</MenuItem>
            </template>
            <!-- et -->
          </template>
        </Submenu>
      </Menu>
    </Sider>
    <Layout>
      <Content class="navi-content">
        <router-view />
      </Content>
    </Layout>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { SubMenuI } from '@/components/dumb/types'

@Component
export default class NIndex extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly menus!: SubMenuI[]
  openNames: string[] = []
  activeName: string = ''

  @Watch('$route')
  onRouteChange() {
    // this.updateOpenNames()
    this.updateActiveName()
  }

  updateOpenNames() {
    const route: any = this.$route
    const name: string = route.name
    const openNames = name.split(/[/]/)
    openNames.pop()
    this.openNames = openNames
    const iview_menu: any = this.$refs.iview_menu
    iview_menu.$children.forEach((item: any) => {
      item.opened = false
    })
    // ! 时序问题?
    setTimeout(() => {
      iview_menu.updateOpened()
    }, 1000)
  }
  updateActiveName() {
    const route = this.$route
    const name: string | undefined | null = route.name
    if (typeof name === 'string' && name.includes('/')) {
      const names = name.split('/')
      this.activeName = names[1].includes('sub') ? names[2] : names[1]
    } else {
      this.activeName = name || ''
    }
  }
  mounted() {
    this.updateOpenNames()
    // ! 时序问题?
    setTimeout(() => {
      this.updateActiveName()
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.navi-sider {
  overflow-y: auto;
  overflow-x: hidden;
}
.navi-content {
  background-color: #f3f8fd;
  padding: 15px;
}
</style>
