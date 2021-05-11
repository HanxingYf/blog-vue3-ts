<template>
  <div class="nav">
    <el-row>
      <el-col :span="3" class="a">logo</el-col>
      <el-col :span="16" class="a">
        <el-menu
          mode="horizontal"
          :default-active="activeIndex"
          @select="handleSelect"
          router
        >
          <el-menu-item
            :route="l.path"
            :index="l.index"
            v-for="l in menuList"
            :key="l.index"
          >
            {{ l.name }}
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="5" class="a">杨帆</el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue';
export default {
  setup() {
    const activeIndex = ref('1');

    const menuList = reactive([
      {
        index: '0',
        path: '/',
        icon: "el-icon-s-home",
        name: "首页"
      },
      {
        index: '1',
        path: '/article',
        icon: "el-icon-s-home",
        name: "文章"
      },
      {
        index: '2',
        path: '/item',
        icon: "el-icon-star-on",
        name: "项目"
      },
      {
        index: '3',
        path: '/life',
        icon: "el-icon-cold-drink",
        name: "生活"
      },
      {
        index: '4',
        path: '/message',
        icon: "el-icon-chat-line-round",
        name: "留言"
      }
    ])
    function handleSelect(index: string, indexPath: string) {
      // console.log(index,indexPath);
    }

    return {
      activeIndex,
      handleSelect,
      menuList,
    }
  }
}
</script>

<style lang="less" scoped>
.nav {
  .a {
    background-color: grey;
  }
}
</style>