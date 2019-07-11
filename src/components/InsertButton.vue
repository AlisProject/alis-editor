<template>
  <div class="insert-button">
    <div
      class="toggle"
      @click="toggleIsOpen"
      :class="{
        'is-open': isOpen
      }"
    >
      <button class="button">
        <span class="plus-button">+</span>
      </button>
    </div>
    <ul class="list" v-if="isOpen">
      <li class="item">
        <button class="button" @click="dispatchUpload">
          <img class="image-upload" src="@/assets/image-upload.png" />
        </button>
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
  display: flex;
  left: -100px;
  margin: 8px;
  position: absolute;
  top: -100px;
  z-index: 100;

  .toggle {
    align-items: center;
    border-radius: 50%;
    border: solid 1px #ddd;
    box-shadow: 0 0 10px 0 hsla(0, 0%, 57%, 0.5);
    color: #ddd;
    cursor: pointer;
    display: flex;
    font-size: 25px;
    font-weight: bold;
    font-weight: normal;
    height: 30px;
    justify-content: center;
    padding-bottom: 1px;
    padding-left: 1px;
    transform: rotate(0deg);
    transition: all 0.05s linear;
    width: 30px;

    .plus-button {
      pointer-events: event;
      user-select: none;
    }

    &.is-open {
      transform: rotate(45deg);
    }
  }

  .list {
    margin: 0;
    padding: 0;
    color: #fff;
    display: flex;
    list-style-type: none;
    font-size: 1.4rem;

    .item {
      align-items: center;
      background: #fff;
      border-radius: 50%;
      border: solid 1px #ddd;
      box-shadow: 0 0 10px 0 hsla(0, 0%, 57%, 0.5);
      color: #ddd;
      display: flex;
      font-size: 25px;
      font-weight: bold;
      font-weight: normal;
      height: 30px;
      justify-content: center;
      margin-left: 8px;
      padding-bottom: 1px;
      padding-left: 1px;
      transform: rotate(0deg);
      transition: all 400ms ease;
      width: 30px;

      + .item {
        border-left: solid 1px #fff;
      }
    }
  }
}

.image-file {
  display: none;
}

.plus-button {
  height: 30px;
}

.image-upload {
  height: 15px;
  cursor: pointer;
}

.button {
  appearance: none;
  background-color: transparent;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 25px;
  font-weight: normal;
  height: 33px;
  outline: none;
  padding: 0;
  width: 33px;
}
</style>
