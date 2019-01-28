<template lang="html">
  <div id="ALISEditor">
    <div class="container" id="editor"></div>
  </div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import Heading from '@/plugins/heading'
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials'
import CustomUploadAdapterPlugin from '@/plugins/CustomUploadAdapterPlugin'
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import { isIOS } from '@/utils/device'
import saveData from './Save'

export default {
  props: {
    articleId: {
      type: String
    },
    clientId: {
      type: String
    },
    getUserSession: {
      type: Function
    },
    functions: {
      type: Object
    },
    status: {
      type: String
    }
  },
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    const articleId = this.articleId
    const clientId = this.clientId
    const functions = this.functions
    const status = this.status
    ClassicEditor.create(document.querySelector('#editor'), {
      extraPlugins: [
        CustomUploadAdapterPlugin.bind(null, this.articleId, this.clientId, this.getUserSession)
      ],
      plugins: [
        EssentialsPlugin,
        BoldPlugin,
        ItalicPlugin,
        LinkPlugin,
        Heading,
        HeadingButtonsUI,
        Paragraph,
        BlockQuote,
        Image,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageUpload,
        Autosave
      ],
      toolbar: ['heading1', 'heading2', 'blockQuote', 'bold', 'italic', 'link', 'imageUpload'],
      autosave: {
        save(editor) {
          return saveData(editor.getData(), articleId, clientId, functions, status)
        }
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
        ]
      }
    }).then((editor) => {
      const checkIfShouldBeSticky = editor.ui.view.stickyPanel._checkIfShouldBeSticky.bind(
        editor.ui.view.stickyPanel
      )
      // iOS では IME 表示時に stickyPanel の表示位置がずれるバグがある。
      // 上記理由から iOS でのみ checkIfShouldBeSticky の処理を行わないようにしたいため、
      // 一時的にメソッドの処理を退避させた上で、メソッドの処理を書き換えている。
      editor.ui.view.stickyPanel._checkIfShouldBeSticky = () => {
        if (isIOS()) return
        checkIfShouldBeSticky()
      }

      this.modifyEnterMode(editor)
      this.editor = editor
    })
  },
  methods: {
    /**
     * Enter が押された場合、shiftEnter の処理を実行する。
     * ただし、Enter が２回続けて押された場合は、通常通り Enter の処理を実行する（当処理では何もしない）
     */
    modifyEnterMode(editor) {
      editor.editing.view.document.on(
        'enter',
        (evt, data) => {
          const preOperation =
            editor.model.document.history._operations[editor.model.document.version - 1]
          if (!data.isSoft && !this.isEnterOperation(preOperation)) {
            editor.execute('shiftEnter')
            data.preventDefault()
            evt.stop()
            editor.editing.view.scrollToTheSelection()
          }
        },
        { priority: 'high' }
      )
    },
    /**
     * 改行のオペレーションかどうかを判断
     */
    isEnterOperation(targetOperation) {
      // split タイプの場合は改行と判断
      if (targetOperation.type === 'split') {
        return true
      }
      // insert タイプかつ、softBreak の場合は改行と判断
      if (
        targetOperation.type === 'insert' &&
        targetOperation.nodes._nodes.length === 1 &&
        targetOperation.nodes._nodes[0].name === 'softBreak'
      ) {
        return true
      }
      // 上記以外は 改行でないと判断
      return false
    }
  }
}
</script>

<style lang="scss">
</style>
