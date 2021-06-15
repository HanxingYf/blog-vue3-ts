<template>
  <div class="blog">
    <Header v-if="isShowHeader" />
    <div id="layout">
      <el-row>
        <el-col :span="12"><router-view></router-view></el-col>
        <el-col :span="12"><Mine /></el-col>
      </el-row>
      
      
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { Options, Vue } from "vue-class-component";
import Header from "./components/Header.vue"
import Mine from "./components/Mine.vue"


@Options({
  components: {
    Header,
    Mine
  },
  watch: {
    $route: function (val: any, oldVal: any) {
      this.routeChange(val, oldVal);
    },
  },
  data() {
    return {
      isShowHeader: false,
      isShowSlider: false,
    };
  },
  methods: {
    routeChange(val: any, oldVal: any): void {
      // console.log(val.path, oldVal.path, '++++');
      // console.log(this.isShowHeader);
      if (val.path !== '/') {
        this.isShowHeader = true
      }
      if (val.path == '/' && oldVal.path !== '/') {
        this.isShowHeader = false
      }
    },
  },
  setup() {
    const isShowHeader = ref('false')

    return {
      isShowHeader
    }
  }
  
})




export default class Home extends Vue { }
</script>

<style lang="less" scoped>
</style>
