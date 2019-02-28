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
import Heading from '@/plugins/ckeditor5/heading/heading'
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import EssentialsPlugin from '@/plugins/ckeditor5/essentials/essentials'
import CustomUploadAdapterPlugin from '@/plugins/image/CustomUploadAdapterPlugin'
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import Emptyness from 'ckeditor5-emptyness/src/emptyness'
import { isIOS } from '@/utils/device'
import saveData from '@/utils/saveData'
import iconHeading2 from '@/assets/icons/heading2.svg'
import iconHeading3 from '@/assets/icons/heading3.svg'
import MediaEmbed from '@/plugins/ckeditor5/media-embed/mediaembed'
import sameNodes from '@/utils/sameNodes'
import diff from '@ckeditor/ckeditor5-utils/src/diff'
import { IFRAMELY_API_ENDPOINT, VALIDATE_URL_REGEXP } from '@/utils/constant'
import handleKeydownEnter from '@/utils/handleKeydownEnter'

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
    },
    iframelyApiKey: {
      type: String
    },
    domain: {
      type: String
    }
  },
  data() {
    return {
      editor: null,
      beforeIsComposing: false,
      changeToolbarButtonStateInterval: null,
      toolbar: ['heading2', 'heading3', 'blockQuote', 'bold', 'italic', 'link', 'imageUpload']
    }
  },
  mounted() {
    const { articleId, clientId, functions } = this
    ClassicEditor.create(document.querySelector('#editor'), {
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
        Autosave,
        Emptyness,
        MediaEmbed
      ],
      toolbar: this.toolbar,
      autosave: {
        save(editor) {
          return saveData(editor.getData(), articleId, clientId, functions)
        }
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 1',
            class: 'ck-heading_heading2',
            icon: iconHeading2
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 2',
            class: 'ck-heading_heading3',
            icon: iconHeading3
          }
        ]
      },
      image: {
        toolbar: ['imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight'],
        styles: [
          'full',
          { name: 'alignLeft', title: '左寄せ画像' },
          { name: 'alignRight', title: '右寄せ画像' }
        ]
      },
      mediaEmbed: {
        previewsInData: false,
        providers: [
          {
            name: 'twitter',
            url: /^twitter\.com/,
            html: (match) => {
              const path = match['input']
              const isTweet = path.split('/')[2] === 'status'
              const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${
                this.iframelyApiKey
              }&url=${encodeURIComponent(path)}`
              if (isTweet) {
                return `<div class="iframely-embed">
                     <div class="iframely-responsive">
                       <iframe src="${iframeUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                       </iframe>
                     </div>
                   </div>`
              }
              const userName = path.split('/')[1]
              return `<div class="iframe-twitter">
                   <iframe src="https://${this.domain}/media_embed/twitter_profile/${userName}"
                   frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="twitter-content-area">
                   </iframe>
                 </div>`
            }
          },
          {
            name: 'facebook',
            url: [
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/(permalink|story)\.php\?[^/]+(\d{10,})/i,
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/photo\.php\?fbid=(\d{10,})/i,
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/([a-zA-Z0-9.-]+)\/(posts|activity)\/(\d{10,})/i,
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/([a-zA-Z0-9.-]+)\/photos\/[^/]+\/(\d{10,})/i,
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/notes\/([a-zA-Z0-9.-]+)\/[^/]+\/(\d{10,})/i,
              /^https?:\/\/(?:www|m|business)\.facebook\.com\/media\/set\/\?set=[^/]+(\d{10,})/i
            ],
            html: (match) => {
              const path = match['input']
              const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${
                this.iframelyApiKey
              }&url=${encodeURIComponent(path)}`
              return `<div class="iframely-embed">
                   <div class="iframely-responsive">
                     <iframe src="${iframeUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                     </iframe>
                   </div>
                 </div>`
            }
          },
          {
            name: 'youtube',
            url: [
              /^https?:\/\/(?:www\.)?youtube\.com\/(?:tv#\/)?watch\/?\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/youtu.be\/([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/m\.youtube\.com\/#\/watch\?(?:[^&]+&)*v=([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/www\.youtube\.com\/user\/[a-zA-Z0-9_-]+\/?\?v=([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/www\.youtube-nocookie\.com\/(?:v|embed)\/([a-zA-Z0-9_-]+)/i
            ],
            html: (match) => {
              const id = match[1]
              return `<div class="iframe-youtube">
                   <iframe src="https://www.youtube.com/embed/${id}" class="youtube-content-area"
                   frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                   </iframe>
                 </div>`
            }
          },
          {
            name: 'gist',
            url: /^gist\.github\.com/,
            html: (match) => {
              const path = 'https://' + match['input']
              const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${
                this.iframelyApiKey
              }&url=${encodeURIComponent(path)}`
              return `<div class="iframely-embed">
                   <div class="iframely-responsive">
                     <iframe src="${iframeUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                     </iframe>
                   </div>
                 </div>`
            }
          },
          {
            name: 'instagram',
            url: [
              /^https?:\/\/(?:www.)?instagram\.com\/(?:[a-zA-Z0-9_-]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)\/?/i,
              /^https?:\/\/instagr\.am\/(?:[a-zA-Z0-9_-]+\/)?p\/([a-zA-Z0-9_-]+)/i,
              /^https?:\/\/instagram\.com\/(?:[a-zA-Z0-9_-]+\/)?(?:p|tv)\/([a-zA-Z0-9_-]+)$/i
            ],
            html: (match) => {
              const path = match['input']
              const iframeUrl = `${IFRAMELY_API_ENDPOINT}?app=1&api_key=${
                this.iframelyApiKey
              }&url=${encodeURIComponent(path)}`
              return `<div class="iframely-embed">
                   <div class="iframely-responsive">
                     <iframe src="${iframeUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                     </iframe>
                   </div>
                 </div>`
            }
          },
          {
            name: 'any',
            url: VALIDATE_URL_REGEXP,
            html: (match) => {
              const path = match[0]
              return `<div class="iframe-any">
                   <iframe src="https://${this.domain}/media_embed/any?url=${encodeURIComponent(
                path
              )}"
                   frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="any-content-area">
                   </iframe>
                 </div>`
            }
          }
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
      // iOS ではリンクの先頭・末尾で半角スペースを入力後に文字を入力するとエラーが発生してしまう。
      // これは _diffNodeLists メソッドで利用している sameNodes 関数内の比較処理に問題があることが原因である。
      // そのため、_diffNodeLists を書き換え、バグを修正した sameNodes 関数を呼び出している。
      editor.editing.view._renderer._diffNodeLists = (actualDomChildren, expectedDomChildren) => {
        return diff(
          actualDomChildren,
          expectedDomChildren,
          sameNodes.bind(null, editor.editing.view._renderer.domConverter.blockFiller)
        )
      }
      if (isIOS()) {
        this.modifyBackspaceMode(editor)
        this.changeToolbarButtonStateInterval = setInterval(() => {
          const isComposing = editor.editing.view.document.isComposing
          if (this.beforeIsComposing === isComposing) return
          if (!isComposing) {
            this.changeToolbarButtonState(editor, this.toolbar, true)
          }
          this.beforeIsComposing = isComposing
        }, 300)
        this.handleChangeToolbarButtonState(editor, this.toolbar)
        this.modifyBehaviorAfterInsertImage(editor)
      }
      this.editor = editor
      if (this.editorContent !== null) {
        editor.setData(this.editorContent)
      }
      this.changeToolbarButtonState(editor, this.toolbar, false)
      this.handleEditorFocus(editor)
      handleKeydownEnter(editor, VALIDATE_URL_REGEXP, this.functions.getResourceFromIframely)
      this.$emit('editor-mounted')
    })
  },
  beforeDestroy() {
    if (isIOS()) {
      clearInterval(this.changeToolbarButtonStateInterval)
    }
  },
  methods: {
    modifyBackspaceMode(editor) {
      editor.editing.view.document.on(
        'keydown',
        (evt, data) => {
          // iOS では IME での入力中（isComposing が true の状態）に Backspace を押すと
          // エラーになるため、イベントを止めている。
          if (data.keyCode == 8 && editor.editing.view.document.isComposing) {
            evt.stop()
          }
        },
        { priority: 'high' }
      )
    },
    handleEditorFocus(editor) {
      editor.editing.view.document.on('focus', () => {
        this.changeToolbarButtonState(editor, this.toolbar, true)
      })
    },
    handleChangeToolbarButtonState(editor, toolbar) {
      editor.model.document.on('change', () => {
        const isComposing = editor.editing.view.document.isComposing
        this.changeToolbarButtonState(editor, toolbar, !isComposing)
      })
    },
    changeToolbarButtonState(editor, toolbar, isEnabled) {
      toolbar.forEach((buttonItem) => {
        if (buttonItem.startsWith('heading')) buttonItem = 'heading'
        this.editor.commands.get(buttonItem).isEnabled = isEnabled
      })
    },
    modifyBehaviorAfterInsertImage(editor) {
      editor.model.document.on('change:data', (event, data) => {
        const isInsertImageOperation = data.operations.some((operation) => {
          if (operation.constructor.name !== 'InsertOperation') return
          return operation.nodes && operation.nodes._nodes[0].name === 'image'
        })
        if (isInsertImageOperation) {
          editor.model.change((writer) => {
            const insertPosition = editor.model.document.selection.getLastPosition()
            const paragraph = writer.createElement('paragraph')
            writer.insert(paragraph, insertPosition)
            writer.setSelection(paragraph, 'in')
            document.activeElement.blur()
          })
        }
      })
    },
    focusEditor() {
      // selection をタイトルからエディタに移動し selection の位置を初期化
      this.editor.model.change((writer) => {
        this.editor.editing.view.focus()
        writer.setSelection(null)
      })
    }
  }
}
</script>

<style lang="scss">
.iframe-twitter {
  position: relative;
  padding-bottom: 140px;

  .twitter-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
.iframe-any {
  position: relative;
  padding-bottom: 140px;

  .any-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}

.iframe-youtube {
  position: relative;
  padding-bottom: 100%;
  height: 0;
  padding-bottom: 56.2493%;

  .youtube-content-area {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
</style>
