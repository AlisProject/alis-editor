import Vue from 'vue'
import AlisEditorPc from './AlisEditorPc.vue'
import AlisEditorSp from './AlisEditorSp.vue'

const renderComponent = window.innerWidth <= 640 ? AlisEditorSp : AlisEditorPc

new Vue({
  render: (h) => h(renderComponent)
}).$mount('#alis-editor')
