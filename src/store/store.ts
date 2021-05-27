import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { RootStateI } from './types'
import { getDistributeConfig } from '@/presenter/distributeConfig.pre'
import { getUserInfo, getRoadNetVersions } from '@/presenter/common.pre'

Vue.use(Vuex)

const store: StoreOptions<RootStateI> = {
  state: {
    baseConfig: null,
    userInfo: { username: 'test', flags: [] },
    roadNetVersions: []
  },
  getters: {},
  mutations: {
    'setConfig'(state, data) {
      state.baseConfig = data
    },
    'setUserInfo'(state, data) {
      state.userInfo = data
    },
    'setRoadNetVersions'(state, data) {
      state.roadNetVersions = data
    }
  },
  actions: {
    async getBaseConfig({ commit }) {
      const config = await getDistributeConfig()
      commit('setConfig', config)
    },
    async getUserInfo({ commit }) {
      const userInfo = await getUserInfo();
      // 加水印
      (window as any).userInfo = userInfo
      commit('setUserInfo', userInfo)
    },
    async getRoadNetVersions({ commit }) {
      const roadNetVersions = await getRoadNetVersions()
      commit('setRoadNetVersions', roadNetVersions)
    }
  }
}

export default new Vuex.Store<RootStateI>(store)
