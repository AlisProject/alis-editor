/* eslint-disable */
<template>
  <div class="insert-button">
    <div
      class="insert-button__toggle"
      @click="toggleIsOpen"
      :class="{
        'is-open': isOpen
      }"
    >
      <span>+</span>
    </div>
    <ul class="insert-button__list" v-if="isOpen">
      <li class="insert-button__listItem" @click="dispatchUpload">●</li>
    </ul>
    <input type="file" @change="handleUpload" />
  </div>
</template>

<script>
export default {
  props: {
    editor: Object,
    articleId: String
  },
  data() {
    return {
      isOpen: false,
      doc: null,
      uploadFile: null
    }
  },
  methods: {
    toggleIsOpen() {
      this.isOpen = !this.isOpen
    },
    dispatchUpload() {
      console.log('hogehoge')
      this.$el.querySelector('[type="file"]').click()
    },
    handleUpload(event) {
      this.isOpen = false
      this.onFileChange(event)
    },
    onFileChange(event) {
      this.uploadFile = event.target.files[0]
      if (this.uploadFile === null) {
        return
      }
      console.log(this.uploadFile)
      this.editor.execute('imageUpload', { file: this.uploadFile })
      this.uploadFile = null
      // this.uploadImageSize = this.uploadFile.size
      // this.uploadImageExtension = this.uploadFile.type
      // const config = {
      //   headers: {
      //     'Authorization': this.token,
      //     'Access-Control-Allow-Origin': '*',
      //     'Content-Type': 'application/json'
      //   },
      //   params: {
      //     'upload_image_size': this.uploadImageSize,
      //     'upload_image_extension': this.uploadImageExtension
      //   }
      // }
      // axios.get(`https://narisada.alis-test.tk/api/me/articles/${this.articleId}/image_upload_url`, config)
      //   .then((res) => {
      //     const json = JSON.parse(JSON.stringify(res.data))
      //     axios.put(json['url'], this.uploadFile, {
      //       headers: {
      //         'Content-Type': this.uploadFile.type
      //       }
      //     }).then((res) => {
      //       InsertImage(this.editor, `https://narisada.alis-test.tk/${json['upload_url_suffix']}`, '', this.doc)
      //     })
      //   })
    }
  }
}
</script>

<style scoped>
.insert-button {
  position: absolute;
  left: -100px;
  top: -100px;
  margin: 8px;
  cursor: pointer;
  z-index: 1000000000000000000;
  display: flex;
}

.insert-button .insert-button__toggle {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #ddd;
  color: #ddd;
  border-radius: 50%;
  font-weight: bold;
  padding-left: 1px;
  padding-bottom: 1px;
  transition: all 0.05s linear;
  transform: rotate(0deg);
  font-size: 25px;
  font-weight: normal;
  font-family: 'Yu Gothic', YuGothic;
  box-shadow: 0 0 10px 0 hsla(0, 0%, 57%, 0.5);
}

.insert-button__toggle span {
  pointer-events: event;
  user-select: none;
}

.insert-button .insert-button__toggle.is-open {
  transform: rotate(45deg);
}

.insert-button .insert-button__list {
  margin: 0;
  padding: 0;
  color: #fff;
  overflow: hidden;
  display: flex;
  list-style-type: none;
  font-size: 1.4rem;
}

.insert-button__list .insert-button__listItem {
  margin-left: 8px;
  background: #fff;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #ddd;
  color: #ddd;
  border-radius: 50%;
  font-weight: bold;
  padding-left: 1px;
  padding-bottom: 1px;
  transition: all 0.05s linear;
  transform: rotate(0deg);
  font-size: 25px;
  font-weight: normal;
  font-family: 'Yu Gothic', YuGothic;
  box-shadow: 0 0 10px 0 hsla(0, 0%, 57%, 0.5);
}

.insert-button__list .insert-button__listItem:hover {
  background: #f9f9f9;
}

.insert-button__list .insert-button__listItem + .insert-button__listItem {
  border-left: solid 1px #fff;
}

input {
  display: none;
}
</style>
