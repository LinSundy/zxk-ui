<template>
  <div class="audio">
    <div class="view_container">
      <div class="progress" ref="progress" @click="skip">
        <div class="on" :style="{ width: `${progress * 100}%` }">
          <div class="drag-btn" @mousedown="drag" v-if="!isMobile"></div>
          <div
            class="drag-btn"
            @touchstart="drag"
            @touchmove.prevent="move"
            @touchend="up"
            v-else
          ></div>
        </div>
      </div>
      <span class="time">{{
        `${formatTime(currentTime)}/${formatTime(duration)}`
      }}</span>
    </div>
    <div class="operation_container">
      <!--上下audio切换只在多个音频的场景下才生效-->
      <span
        class="iconfont icon-previous prev"
        @click="prev"
        v-if="isMultiple"
      ></span>
      <span
        :class="`play-btn ${status ? 'icon-pause' : 'icon-play'}`"
        @click="toggle"
      ></span>
      <span
        class="iconfont icon-previous next"
        @click="next"
        v-if="isMultiple"
      ></span>
      <div class="volume-container">
        <span
          :class="`iconfont icon-voice volume ${!isMultiple && 'single'}`"
          @click="volumeToggle"
        ></span>
        <div class="volume-progress" ref="volumeProgress">
          <div
            class="on"
            :style="{ width: `${isMute ? '0' : volumeProgress * 100}%` }"
          >
            <span
              class="volume-drag"
              @mousedown="volumeDrag"
              v-if="!isMobile"
            ></span>
            <span
              class="volume-drag"
              @touchstart="volumeDrag"
              @touchmove.prevent="volumeMove"
              @touchend="volumeUp"
              v-else
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Audio",
  created() {
    let reg = /Android|WebOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i;
    this.isMobile = reg.test(navigator.userAgent);
  },
  computed: {
    isMultiple() {
      // 是否是歌曲的list模式
      return this.musics instanceof Array;
    },
  },
  data() {
    const audioEvents = {
      timeupdate: this.timeupdate,
      ended: this.ended,
      durationchange: this.durationchange,
    };
    return {
      audioEvents,
      progress: 0, // 音频播放的进度
      flag: false, // 当为true时，允许拖拽
      progressNodeWidth: 0, // 进度条的宽度
      volumeProgressNodeWidth: 0, // 音频条的宽度
      status: false, // false为暂停
      duration: 0,
      currentTime: 0,
      ap: null,
      isMobile: false, // false为pc端，true为移动端
      volumeProgress: 0.8,
      isMute: false,
      currentAudioIndex: 0, //当前正在播放的音频
    };
  },
  props: {
    musics: Object | Array,
  },
  watch: {
    currentAudioIndex(n, o) {
      // 只有在多个音频下才会响应
      if (!this.isMultiple) return;
      if (this.status) {
        this.ap.src = this.musics[n].url;
        this.ap.play();
      } else {
        this.ap.src = this.musics[n].url;
      }
    },
    musics: {
      handler(newV, oldV) {
        console.log("监听到的新值的变化", newV);
        this.refresh(newV.url);
      },
      deep: true,
    },
  },
  methods: {
    // 当musics为对象时，只修改内部的url，也需要将音频重新初始化。此方法只针对单个音频有效。多个音频的待补充/
    refresh(audioUrl) {
      if (this.isMultiple) return;
      this.ap.src = audioUrl;
      if(!this.allAudioNodes.includes(this)) {
        this.allAudioNodes.push(this)
        
         // 初始化progress的宽度
        this.progressNodeWidth = this.$refs.progress.offsetWidth;
        // 初始化volumeProgress的宽度
        this.volumeProgressNodeWidth = this.$refs.volumeProgress.offsetWidth;
      }
      this.registryAudio()
      console.log(this.allAudioNodes, 'Nodes')
    },

    // 上一首
    prev() {
      if (this.currentAudioIndex === 0) {
      } else {
        this.currentAudioIndex -= 1;
      }
    },

    // 下一首
    next() {
      let l = this.musics.length;
      if (this.currentAudioIndex >= l - 1) {
      } else {
        this.currentAudioIndex += 1;
      }
    },

    // 声音开启与关闭
    volumeToggle() {
      this.isMute = !this.isMute;
      this.isMute
        ? (this.ap.volume = 0)
        : (this.ap.volume = this.volumeProgress);
    },

    /**
     * 时间格式化
     * @param time
     * @returns {string}
     */
    formatTime(time) {
      let m = Math.round(time / 60);
      let s = Math.round(time % 60);
      s = s.toString().length < 2 ? `0${s}` : s;
      m = m.toString().length < 2 ? `0${m}` : m;
      return `${m}:${s}`;
    },

    // 点击进度条跳转
    skip(e) {
      if (e.target.className === `drag-btn`) return;
      this.progress = e.offsetX / this.progressNodeWidth;
      this.changeCurrentTime();
      this.status && this.playAtCurrentTime();
    },

    // 指定进度下的当前时间
    changeCurrentTime() {
      this.currentTime = this.progress * this.duration;
    },

    // 指定进度下播放音乐
    playAtCurrentTime() {
      this.ap.currentTime = this.progress * this.duration;
    },

    // 鼠标抬起之后，切换到歌曲的指定进度
    up() {
      this.flag = false;
      if (!this.isMobile) {
        document.removeEventListener("mouseup", this.up);
        document.removeEventListener("mousemove", this.move);
      }
      this.status && this.playAtCurrentTime();
    },

    // 音乐进度拖拽
    drag() {
      this.flag = true;
      if (!this.isMobile) {
        document.addEventListener("mousemove", this.move);
        document.addEventListener("mouseup", this.up);
      }
    },

    // 进度拖拽过程中，要更新进度条以及当前时间
    move(e) {
      let mouseClient = (e.touches && e.touches[0].clientX) || e.clientX;
      let i =
        (mouseClient - this.$refs.progress.getBoundingClientRect().left) /
        this.progressNodeWidth;
      i = i > 0 ? i : 0;
      i = 1 > i ? i : 1;
      this.progress = i;
      this.changeCurrentTime();
    },

    // 声音进度的拖拽
    volumeDrag() {
      if (!this.isMobile) {
        document.addEventListener("mousemove", this.volumeMove);
        document.addEventListener("mouseup", this.volumeUp);
      }
    },

    // 鼠标抬起
    volumeUp() {
      if (!this.isMobile) {
        document.removeEventListener("mouseup", this.volumeUp);
        document.removeEventListener("mousemove", this.volumeMove);
      }
    },

    // 鼠标滑动或者手指移动，调节音量
    volumeMove(e) {
      let mouseClient = (e.touches && e.touches[0].clientX) || e.clientX;
      let i =
        (mouseClient - this.$refs.volumeProgress.getBoundingClientRect().left) /
        this.volumeProgressNodeWidth;
      i = i > 0 ? i : 0;
      i = 1 > i ? i : 1;
      this.volumeProgress = i;
      this.ap.volume = this.volumeProgress;
    },

    // 初始化audio
    initAudio() {
      if (this.isMultiple) {
        // 多个音频初始化
        this.ap = new Audio();
        if (
          !(
            this.musics &&
            this.musics[this.currentAudioIndex] &&
            this.musics[this.currentAudioIndex].url
          )
        ) {
          return console.warn("音频的url不允许为空");
        }
        this.ap.src = this.musics[this.currentAudioIndex].url;
      } else {
        // 单个音频初始化
        this.ap = new Audio();
        if (!this.musics.url) {
          return console.warn("音频的url不允许为空");
        }
        this.ap.src = this.musics.url;
      }
      if (!this.allAudioNodes.includes(this)) {
        console.log('新加的节点')
        // 将所有的audio都收集起来
        this.allAudioNodes.push(this);

        // audio添加音频事件
        this.registryAudio();

        // 初始化progress的宽度
        this.progressNodeWidth = this.$refs.progress.offsetWidth;
        // 初始化volumeProgress的宽度
        this.volumeProgressNodeWidth = this.$refs.volumeProgress.offsetWidth;
      }
    },

    /*
     * 重要，如此写，只为了销毁audio时，销毁对应的事件。
     */
    // -------- start -------
    durationchange() {
      this.duration = this.ap.duration;
    },
    timeupdate() {
      if (!this.flag) {
        this.currentTime = this.ap.currentTime;
        this.progress = this.currentTime / this.duration;
      }
    },
    ended() {
      this.progress = 0;
      this.currentTime = 0;
      this.status = false;
    },

    // ------ end ------
    // 注册当前audio的所有事件
    registryAudio() {
      for (const key in this.audioEvents) {
        this.ap.addEventListener(key, this[key]);
      }
    },
    // 销毁当前audio的所有事件
    destroyAudio() {
      if (this.status) {
        this.toggle();
      }
      for (const key in this.audioEvents) {
        this.ap.removeEventListener(key, this[key]);
      }
    },

    // 做一些重置的操作，区分当前正在操作的audio以及其他audio
    resetStatus() {
      this.allAudioNodes.map((vNode) => {
        if (vNode === this) {
          // 当前audio的逻辑
          this.status = !this.status;
        } else {
          // 其余audio的逻辑
          // 此刻只重置了播放状态 `status` 为false
          vNode.status = false;
          vNode.ap.pause();
        }
      });
    },

    // 播放以及暂停
    toggle() {
      this.ap.currentTime = parseFloat(this.currentTime);
      this.status ? this.ap.pause() : this.ap.play();
      this.resetStatus();
    },
  },
  mounted() {
    this.initAudio();
  },
  destroyed() {
    this.destroyAudio();
  },
};
</script>

<style lang="less" scoped>
@import url("index");
</style>
