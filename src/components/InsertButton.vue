<template>
  <div class="insert-button">
    <div
      class="insert-button__toggle"
      @click="toggleIsOpen"
      :class="{
        'is-open': isOpen
      }"
    >
      <span class="plus-button">+</span>
    </div>
    <ul class="insert-button__list" v-if="isOpen">
      <li class="insert-button__listItem" @click="dispatchUpload">
        <img class="image-camera" src="@/assets/camera.png" />
      </li>
    </ul>
    <input type="file" class="image-file" accept="image/*" @change="handleUpload" />
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
      uploadFile: null
    }
  },
  methods: {
    toggleIsOpen() {
      this.isOpen = !this.isOpen
    },
    dispatchUpload() {
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
      this.editor.execute('imageUpload', { file: this.uploadFile })
      this.uploadFile = null
    }
  }
}
</script>

<style lang="scss" scoped>
.insert-button {
  position: absolute;
  left: -100px;
  top: -100px;
  margin: 8px;
  cursor: pointer;
  z-index: 100;
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

.insert-button__toggle .plus-button {
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

.image-file {
  display: none;
}

.plus-button {
  height: 30px;
}

.image-camera {
  width: 15px;
  height: 15px;
}
</style>
