<template>
  <div class="showcase" ref="showcase">
    <slot></slot>
  </div>
</template>

<script>
let cancelFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame
let requestFrame = window.requestAnimationFrame
let $container = null
import { Item } from './utils';
export default {
  name: 'Carousel',
  props: {
    uniqueClass: {
      type: String,
      require: true
    },
    num: {
      type: Number,
      require: true
    },
    config: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data() {
    return {
      // 最前方元素索引
      frontIndex: 0,
      options: {
        xOrigin: null,        // null: calculated automatically
        yOrigin: null,
        xRadius: null,
        yRadius: null,
        farScale: 0.5,        // scale of the farthest item
        transforms: true,     // enable CSS transforms
        smooth: true,         // enable smooth animation via requestAnimationFrame()
        fps: 30,              // fixed frames per second (if smooth animation is off)
        speed: 4,             // positive number
        autoPlay: 1,          // [ 0: off | number of items (integer recommended, positive is clockwise) ]
        autoPlayDelay: 4000,
        bringToFront: true
      }
    }
  },
  watch: {
    frontIndex: {
      handler (newVal) {
        let autoPlay = this.config.autoPlay || this.options.autoPlay
        let index = null
        if (autoPlay > 0) { // 顺时针
          index = this.num - (newVal % this.num)
        } else { // 逆时针
          index = newVal % this.num
        }
        if (index === this.num) {
          index = 0
        }
        this.$emit('frontIndex', index)
      },
      immediate: true
    }
  },
  mounted() {
    $container = this.$refs.showcase
    let options = Object.assign(this.options, this.config)
    this.carousel(options)
  },
  beforeDestroy() {
    this.deactivate()
  },
  methods: {
    // 旋转木马
    carousel (options) {
      this.items = []
      this.xOrigin = (options.xOrigin === null) ? $container.offsetWidth  * 0.5 : options.xOrigin
      this.yOrigin = (options.yOrigin === null) ? $container.offsetHeight * 0.1 : options.yOrigin
      this.xRadius = (options.xRadius === null) ? $container.offsetWidth  / 2.3 : options.xRadius
      this.yRadius = (options.yRadius === null) ? $container.offsetHeight / 6   : options.yRadius
      this.farScale = options.farScale
      this.rotation = this.destRotation = Math.PI/2 // start with the first item positioned in front
      this.speed = options.speed
      this.smooth = options.smooth
      this.fps = options.fps
      this.timer = 0
      this.autoPlayAmount = options.autoPlay
      this.autoPlayDelay = options.autoPlayDelay
      this.autoPlayTimer = 0
      this.onLoaded = options.onLoaded
      this.onRendered = options.onRendered
      this.itemOptions = {
        transforms: options.transforms
      }
      this.options = options
      $container.style.cssText = 'position: relative; overflow: hidden;'
      this.cusInterval = setInterval(() => {
        this.init()
      }, 50);
    },
    init () {
      const itemDomArr = document.querySelectorAll(`.${this.uniqueClass}`)
      for (let i = 0; i < itemDomArr.length; i++) {
        const item = itemDomArr[i];
        // 判断图片是否加载完成
        if (!item.offsetWidth || !item.offsetHeight){
          return
        }
        clearInterval(this.cusInterval)
        this.items.push(new Item(item, this.itemOptions))
      }
      if (this.autoPlayAmount !== 0) this.enableAutoPlay();
      this.bindControls();
      this.render();
    },
    rotateItem (itemIndex, rotation) {
      let item = this.items[itemIndex]
      let sin = Math.sin(rotation)
      let farScale = this.farScale
      let scale = farScale + ((1-farScale) * (sin+1) * 0.5)
      item.moveTo(
        this.xOrigin + (scale * ((Math.cos(rotation) * this.xRadius) - (item.fullWidth * 0.5))),
        this.yOrigin + (scale * sin * this.yRadius),
        scale
      )
    },
    render () {
      let count = this.items.length;
      let spacing = 2 * Math.PI / count;
      let radians = this.rotation;
      for( let i = 0; i < count; i++ ) {
        this.rotateItem(i, radians);
        radians += spacing;
      }
    },
    playFrame () {
      let rem = this.destRotation - this.rotation;
      let now = +new Date()
      let dt = (now - this.lastTime) * 0.002;
      this.lastTime = now;

      if( Math.abs(rem) < 0.003 ) {
        this.rotation = this.destRotation;
        this.pause();
      } else {
        // Rotate asymptotically closer to the destination
        this.rotation = this.destRotation - rem / (1 + (this.speed * dt));
        this.scheduleNextFrame();
      }
      this.render();
    },
    pause () {
      this.smooth && cancelFrame ? cancelFrame(this.timer) : clearTimeout(this.timer);
      this.timer = 0;
    },
    scheduleNextFrame () {
      this.lastTime = +new Date()
      this.timer = this.smooth && cancelFrame ?
        requestFrame( this.playFrame ) :
        setTimeout( this.playFrame, 1000 / this.fps );
    },
    itemsRotated () {
      return this.items.length * ((Math.PI/2) - this.rotation) / (2*Math.PI);
    },
    floatIndex () {
      let count = this.items.length;
      let floatIndex = this.itemsRotated() % count;

      // Make sure float-index is positive
      return (floatIndex < 0) ? floatIndex + count : floatIndex;
    },
    nearestIndex () {
      return Math.round(this.floatIndex()) % this.items.length;
    },
    nearestItem () {
      return this.items[this.nearestIndex()];
    },
    play () {
      if(this.timer === 0) this.scheduleNextFrame();
    },
    pause () {
      this.smooth && cancelFrame ? cancelFrame(this.timer) : clearTimeout(this.timer);
      this.timer = 0;
    },
    toGo (count) {
      this.go(count)
      if (this.options.autoPlay < 0) { // 逆时针
        if (count < 0) {
          this.frontIndex += Math.abs(count)
        } else {
          this.frontIndex -= count
        }
      } else { // 顺时针
        if (count < 0) {
          this.frontIndex -= Math.abs(count)
        } else {
          this.frontIndex += count
        }
      }
    },
    go (count) {
      this.destRotation += ((2 * Math.PI) / this.items.length) * count;
      this.play();
    },
    // 移除事件和定时器
    deactivate () {
      this.pause();
      clearInterval(this.autoPlayTimer)
      $container.removeEventListener('click', this.clickCb)
      $container.removeEventListener('mouseover', this.mouseoverCb)
      $container.removeEventListener("mouseout", this.mouseoutCb);
    },
    autoPlay () {
      this.autoPlayTimer = setInterval(() => {
        this.go(this.autoPlayAmount);
        this.frontIndex += Math.abs(this.options.autoPlay)
      }, this.autoPlayDelay)
    },
    mouseoverCb () {
      clearInterval(this.autoPlayTimer)
    },
    mouseoutCb () {
      this.autoPlay()
    },
    clickCb (event) {
      if (event.target) {
        let idx = this.items.indexOf(event.target.item);
        let count = this.items.length;
        let diff = idx - (this.floatIndex() % count);
        // Choose direction based on which way is shortest
        if (2 * Math.abs(diff) > count) diff += diff > 0 ? -count : count;
        this.destRotation = this.rotation;
        this.go(-diff);
        if (this.options.autoPlay > 0) {
          this.frontIndex = this.num - idx
        } else {
          this.frontIndex = idx
        }
      }
    },
    enableAutoPlay () {
      // Stop auto-play on mouse over
      $container.addEventListener('mouseover', this.mouseoverCb)
      $container.addEventListener("mouseout", this.mouseoutCb);
      this.autoPlay();
    },
    bindControls () {
      if (this.options.bringToFront) {
        $container.addEventListener("click", this.clickCb);
      }
    }
  },
}
</script>

<style scoped>
.showcase {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>