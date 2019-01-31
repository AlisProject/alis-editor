<template lang="html">
  <div id="ALISEditor">
    <div class="container" id="editor"></div>
    <InsertButton
      :articleId="articleId"
      :editor="editor"
      v-if="insertButton.isVisible"
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
import Emptyness from 'ckeditor5-emptyness/src/emptyness'
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed'
import saveData from '@/utils/Save'
import iconHeading2 from '@/assets/icons/heading2.svg'
import iconHeading3 from '@/assets/icons/heading3.svg'

const IFRAME_SRC = '//cdn.iframe.ly/api/iframe'
const API_KEY = 'xx'

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
        isVisible: false,
        posY: 0
      }
    }
  },
  mounted() {
    // プラスボタンの挙動制御
    document.addEventListener('selectionchange', this.controlButton)
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
        Autosave,
        Emptyness,
        MediaEmbed
      ],
      toolbar: ['heading2', 'heading3', 'blockQuote', 'bold', 'italic', 'link'],
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
            title: 'Heading 2',
            class: 'ck-heading_heading2',
            icon: iconHeading2
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
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
            html: match => {
              const url = match['input'];
              const urlArr = url.split('/')
              let isTweet = false
              if (urlArr[2] === 'status') {
                isTweet = true
              }
              const iframeUrl = IFRAME_SRC + '?app=1&api_key=' + API_KEY + '&url=' + encodeURIComponent(url);
              if (isTweet) {
                return (
                  '<div class="iframely-embed">' +
                  '<div class="iframely-responsive">' +
                  `<iframe src="${ iframeUrl }" ` +
                  'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                  '</iframe>' +
                  '</div>' +
                  '</div>'
                )
              }
              const screenName = urlArr[1]
              console.log(screenName)
              return (
                '<div style="position: relative; padding-bottom: 180px;">' +
                `<iframe src="http://localhost:3000/media_embed/twitter_profile/${screenName}" +
                frameborder="0" allow="autoplay; encrypted-media" allowfullscreen +
                style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">` +
                '</iframe>' +
                '</div>'
              )
            }
          },
          {
            name: 'facebook',
            url: /^facebook\.com/,
            html: match => {
              const url = 'https://' + match['input'];
              const iframeUrl = IFRAME_SRC + '?app=1&api_key=' + API_KEY + '&url=' + encodeURIComponent(url);
              return (
                '<div class="iframely-embed">' +
                '<div class="iframely-responsive">' +
                `<iframe src="${ iframeUrl }" ` +
                'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                '</iframe>' +
                '</div>' +
                '</div>'
              )
            }
          },
          {
             name: 'youtube',
             url: [
               /^youtube\.com\/watch\?v=([\w-]+)/,
               /^youtube\.com\/v\/([\w-]+)/,
               /^youtube\.com\/embed\/([\w-]+)/,
               /^youtu\.be\/([\w-]+)/
             ],
             html: match => {
               const id = match[ 1 ];
               return (
                 '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
                 `<iframe src="https://www.youtube.com/embed/${ id }" ` +
                 'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                 'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                 '</iframe>' +
                 '</div>'
               );
             }
          },
          {
            name: 'gist',
            url: /^gist\.github\.com/,
            html: match => {
              const url = 'https://' + match['input'];
              const iframeUrl = IFRAME_SRC + '?app=1&api_key=' + API_KEY + '&url=' + encodeURIComponent(url);
              return (
                '<div class="iframely-embed">' +
                '<div class="iframely-responsive">' +
                `<iframe src="${ iframeUrl }" ` +
                'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                '</iframe>' +
                '</div>' +
                '</div>'
              );
            }
          },
          {
            name: 'instagram',
            url: /^www\.instagram\.com\/p\/(\w+)/,
            html: match => {
              const url = 'https://' + match['input'];
              const iframeUrl = IFRAME_SRC + '?app=1&api_key=' + API_KEY + '&url=' + encodeURIComponent(url);
              return (
                '<div class="iframely-embed">' +
                '<div class="iframely-responsive">' +
                `<iframe src="${ iframeUrl }" ` +
                'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                '</iframe>' +
                '</div>' +
                '</div>'
              );
            }
          },
          {
            name: 'any',
            url: /.+/,
            html: match => {
              const url = match[0];
              console.log(match)
              console.log(encodeURIComponent(url))
              // const iframeUrl = IFRAME_SRC + '?app=1&api_key=' + API_KEY + '&url=' + encodeURIComponent(url);
              const data = axios.get(
                `https://iframe.ly/api/iframely?api_key=${API_KEY}&url=${encodeURIComponent(url)}&omit_script=1&omit_css=1`
              ).then(res => {
                this.meta = res.data.meta
                this.links = res.data.links
              })
              console.log(data)
              if (this.meta !== null) {
                return (
                  '<a href="${url}" target="_blank" class="iframely-embed-card">' +
                    `<div class="title">${this.meta.title || ''}</div>` +
                    `<div class="description">${this.meta.description || ''}</div>` +
                    `<img class="thumbnail" src="${(this.links.thumbnail && this.links.thumbnail[0].href) || (this.links.icon && this.links.icon[0].href)}">` +
                    `<div class="site">あああ</div>` +
                  '</a>'
                );
              }
              return '<div>hoge</div>'
            }
          }
        ]
      }
    }).then((editor) => {
      this.editor = editor
      if (this.editorContent !== null) {
        editor.setData(this.editorContent)
      }
    })
  },
  methods: {
    controlButton() {
      const selection = window.getSelection()
      const target = selection.anchorNode
      if (target === null) {
        this.insertButton.isVisible = false
        return
      }
      if (target.nodeName !== 'P') {
        this.insertButton.isVisible = false
        return
      }
      if (target.textContent === '') {
        const rect = target.getBoundingClientRect()
        this.insertButton.posY = rect.top - 13 + window.pageYOffset
        this.insertButton.isVisible = true
      } else {
        this.insertButton.isVisible = false
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('selectionchange', this.controlButton)
  }
}
</script>

<style lang="scss"></style>
