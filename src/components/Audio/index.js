import Audio from './src/index.vue'

export default {
  install(Vue, options) {
    Vue.component(Audio.name, Audio)
    Vue.prototype.allAudioNodes = []
  }
}