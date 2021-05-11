<template>
  <div class="home">
    <!-- <canvas id="canvas" style="position:absolute;top:0px;left:0px;z-index:1;"></canvas> -->
    <div class="container">
      <div class="ct-head">
        <router-link to="/">
          <img
            src="https://sf3-ttcdn-tos.pstatp.com/img/user-avatar/c14a19d241220a025e642bc41a2d6aae~300x300.image"
            alt=""
          />
        </router-link>
      </div>
      <div class="ct-body">
        <div class="list">
          <router-link to="/article" class="link"> 博客首页 </router-link>
          <a href="https://github.com/HanxingYf" class="link"> github </a>
          <a href="https://juejin.cn/user/1987552097864750" class="link">
            掘金
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  components: {

  },
})
export default class Home extends Vue { }
</script>

<style lang='less' scoped>
* {
  margin: 0;
  padding: 0;
}
.home {
  .container {
    .ct-head {
      padding-top: 100px;
      margin: 0 auto;
      width: 200px;
      height: 200px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      img:hover {
        transition-duration: 2s;
        -moz-transition-duration: 2s;
        -webkit-transition-duration: 1s;
        -moz-transform: rotate(360deg) scale(1.5);
        -webkit-transform: rotate(360deg) scale(1.2);
      }
    }
    .ct-body {
      text-align: center;
      .list {
        display: flex;
        width: 60%;
        margin: 0 auto;
        // background-color: red;
        padding-top: 60px;
        .link {
          text-decoration: none;
          color: blue;
          font-weight: 800;
          font-size: 30px;
          display: inline-block;
          flex: 1;
        }
      }
    }
  }
}
</style>
