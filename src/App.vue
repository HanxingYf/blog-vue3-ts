<template>
  <div id="app">
    <template v-if="userInfo && baseConfig">
      <Layout style="height: 100%; display: flex;overflow: hidden">
        <Header class="navi-header">
          <div class="navi-logo">
            <img src="./assets/logo.png" alt="logo">
            <span class="navi-main-title">
              <router-link to="/">滴滴罗盘</router-link>
            </span>
          </div>
          <div class="navi-dynamic-title">
            <Menu
              mode="horizontal"
              :active-name="activeName"
              theme="dark"
              style="height: 50px;line-height: 50px;background: transparent"
            >
              <MenuItem name="voice-broadcast" to="/voice-broadcast">语音播报</MenuItem>
              <MenuItem name="vector-evaluation" to="/vector-evaluation">图形诱导</MenuItem>
              <MenuItem name="basemap-evaluation" to="/basemap-evaluation">底图评测</MenuItem>
              <MenuItem name="laneline-evaluation" to="/laneline-evaluation">车信评测</MenuItem>
              <MenuItem name="effictency-statiscs" to="/effictency-statiscs">效率统计</MenuItem>
              <MenuItem name="roadtest-manager" to="/roadtest-manager">路测管理</MenuItem>
              <MenuItem name="navi-force">
                <a href="http://navifg.intra.xiaojukeji.com/#/code/nav-lib" target="__blank">强制诱导</a>
              </MenuItem>
            </Menu>
          </div>
          <div class="navi-user">
            {{ userInfo.username }}&nbsp;|&nbsp;
            <a href="/sso/logout">登出</a>
          </div>
        </Header>
        <Layout style="flex: 1;overflow-y: auto">
          <router-view></router-view>
        </Layout>
      </Layout>
    </template>
    <template v-else>
      {{ tips }}
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import { UserInfoI, RoadVersionI } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'

@Component
export default class App extends Vue {
  @State('userInfo') userInfo!: UserInfoI | null
  @State('baseConfig') baseConfig!: BaseConfigI | null
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  @Action('getBaseConfig') getBaseConfig!: () => void
  @Action('getUserInfo') getUserInfo!: () => void
  @Action('getRoadNetVersions') getRoadNetVersions!: () => void
  tips: string = '正在获取配置及用户信息...'
  get activeName() {
    const name = this.$route.path.split(/[/]/)[1]
    return name
  }

  async created() {
    (this.$Loading as any).start()
    await this.getBaseConfig()
    await this.getUserInfo()
    if (this.userInfo || this.baseConfig) {
      (this.$Loading as any).finish()
    } else {
      this.tips = '服务错误，无法获取配置及用户信息！';
      (this.$Loading as any).error()
    }
    this.getRoadNetVersions()
  }
}
</script>

<style lang="less">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  .navi-header {
    background-color: #1c2d48;
    color: #ffffff;
    height: 50px;
    line-height: 50px;
    display: flex;
    align-items: center;
    text-align: center;
    padding: 0 0;
    justify-content: space-between;
    .navi-logo {
      font-size: 18px;
      .navi-main-title {
        display: inline;
        padding-left: 10px;
        border-left: 1px solid #fff;
      }
    }
    .navi-logo {
      width: 180px;
      img {
        width: 25px;
        height: 20px;
        margin-right: 10px;
        display: inline-block;
        vertical-align: sub;
      }
    }
    .navi-user {
      font-size: 14px;
      padding: 0 20px;
    }
    .navi-dynamic-title {
      flex: 1;
    }
  }
}
</style>
