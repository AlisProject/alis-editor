<template lang="html">
  <div id="ALISEditor">
    <div class="container" id="editor"></div>
    <InsertButton
      :articleId="articleId"
      :editor="editor"
      v-if="insertButton.isVisibleInsertButton"
      :style="{
        left: `calc(50% - 400px)`,
        top: `${insertButton.posY}px`
      }"
    />
  </div>
</template>

<script>
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import Heading from '@/plugins/heading'
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import InsertButton from './components/InsertButton'
import CustomUploadAdapterPlugin from '@/plugins/CustomUploadAdapterPlugin'
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave'
import saveData from '@/utils/Save'

export default {
  props: {
    articleId: {
      type: String
    },
    clientId: {
      type: String
    },
    functions: {
      type: Object
    },
    editorContent: {
      type: String,
      default: null
    }
  },
  components: {
    InsertButton
  },
  data() {
    return {
      editor: null,
      insertButton: {
        isVisibleInsertButton: false,
        posX: 0,
        posY: 0,
        target: null
      }
    }
  },
  mounted() {
    // プラスボタンの挙動制御
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection()
      const target = selection.anchorNode
      if (target === null) {
        this.insertButton.isVisibleInsertButton = false
        return
      }
      if (target.nodeName === 'FIGCAPTION') {
        this.insertButton.isVisibleInsertButton = false
        return
      }
      if (target.childNodes.length !== 0 && target.childNodes[0].className === 'area-title') {
        this.insertButton.isVisibleInsertButton = false
        return
      }
      if (target.textContent === '') {
        const rect = target.getBoundingClientRect()
        this.insertButton.posY = rect.top - 13 + window.pageYOffset
        this.insertButton.isVisibleInsertButton = true
      } else {
        this.insertButton.isVisibleInsertButton = false
      }
    })
    // propsを変数にset
    const { articleId, clientId, functions } = this
    BalloonEditor.create(document.querySelector('#editor'), {
      extraPlugins: [CustomUploadAdapterPlugin.bind(null, articleId, clientId, functions)],
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
      toolbar: ['heading1', 'heading2', 'blockQuote', 'bold', 'italic', 'link'],
      autosave: {
        save(editor) {
          return saveData(editor.getData(), articleId, clientId, functions)
        }
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
        ]
      },
      image: {
        toolbar: [
          'imageTextAlternative',
          '|',
          'imageStyle:alignLeft',
          'imageStyle:full',
          'imageStyle:alignRight'
        ],
        styles: ['full', 'alignLeft', 'alignRight']
      }
    }).then((editor) => {
      this.editor = editor
      if (this.editorContent !== null) {
        editor.setData(this.editorContent)
      }
    })
  }
}
</script>

<style lang="scss"></style>
