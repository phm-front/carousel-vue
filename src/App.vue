<template>
  <div id="app">
    <Carousel
      ref="carousel"
      uniqueClass="cloud9-item"
      :num="6"
      :config="config"
      @frontIndex="frontIndex">
      <img class="cloud9-item" src="@/images/browsers/firefox.png">
      <img class="cloud9-item" src="@/images/browsers/wyzo.png">
      <img class="cloud9-item" src="@/images/browsers/opera.png">
      <img class="cloud9-item" src="@/images/browsers/chrome.png">
      <img class="cloud9-item" src="@/images/browsers/iexplore.png">
      <img class="cloud9-item" src="@/images/browsers/safari.png">
    </Carousel>
    <button @click="goLeft">向左2步</button>
    <button @click="goRight">向右2步</button>
  </div>
</template>

<script>
// import { ShowText } from 'phm-ui';
import Carousel from './carousel/Carousel.vue';
export default {
  name: 'App',
  components: {
    Carousel
  },
  data() {
    return {
      curIndex: null,
      config: {
        farScale: 0.5,        // scale of the farthest item
        transforms: true,     // enable CSS transforms
        smooth: true,         // enable smooth animation via requestAnimationFrame()
        fps: 30,              // fixed frames per second (if smooth animation is off)
        speed: 4,             // positive number
        autoPlay: 1,          // [ 0: off | number of items (integer recommended, positive is clockwise) ]
        autoPlayDelay: 2000,
        bringToFront: true
      }
    }
  },
  methods: {
    frontIndex (index) {
      this.curIndex = index
    },
    goRight () {
      this.$refs.carousel.toGo(-2)
    },
    goLeft () {
      this.$refs.carousel.toGo(2)
    }
  },
}
</script>

<style lang="less">
#app {
  width: 980px;
  height: 660px;
}
</style>
