import axios from 'axios'
import loadImage from 'blueimp-load-image'
import { isMobile } from '@/utils/device'

export default class CustomUploadAdapter {
  constructor(loader, articleId, clientId, functions) {
    this.loader = loader
    this.articleId = articleId
    this.clientId = clientId
    this.getUserSession = functions.getUserSession
  }

  async upload() {
    const file = await this.loader.file
    const imageExtension = file.type.split('image/')[1].toLowerCase()
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif']
    if (!allowedExtensions.includes(imageExtension)) {
      return Promise.reject(
        `画像は以下のフォーマットのみアップロード可能です：${allowedExtensions}`
      )
    }
    await this.getUserSession()
    const currentUser = localStorage.getItem(
      `CognitoIdentityServiceProvider.${this.clientId}.LastAuthUser`
    )
    const token = localStorage.getItem(
      `CognitoIdentityServiceProvider.${this.clientId}.${currentUser}.idToken`
    )
    const MAX_UPLOAD = 10 * 1024 * 1024 // 10 MB
    return new Promise(async (resolve, reject) => {
      if (imageExtension === 'gif' || !isMobile()) {
        try {
          if (file.size > MAX_UPLOAD) {
            throw new Error('画像は7MBまでアップロード可能です')
          }
          const config = this.getConfig(token, file.size, imageExtension)
          const responseData = await this.uploadImage(this.articleId, file, config)
          resolve(responseData)
        } catch (error) {
          reject(error)
        }
      } else {
        loadImage.parseMetaData(file, (data) => {
          const options = {
            canvas: true
          }
          if (data.exif) options.orientation = data.exif.get('Orientation')
          loadImage(
            file,
            async (canvas) => {
              const dataURL = canvas.toDataURL(file.type)
              const uploadFile = this.getFileObjectFromDataURL(dataURL, file.name, file.type)
              const config = this.getConfig(token, uploadFile.size, imageExtension)
              try {
                if (uploadFile.size > MAX_UPLOAD) {
                  throw new Error('画像は7MBまでアップロード可能です')
                }
                const responseData = await this.uploadImage(this.articleId, uploadFile, config)
                resolve(responseData)
              } catch (error) {
                reject(error)
              }
            },
            options
          )
        })
      }
    })
  }

  abort() {}

  getFileObjectFromDataURL(dataURL, fileName, fileType) {
    const blobBin = atob(dataURL.split(',')[1])
    const array = []
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i))
    }
    const blob = new Blob([new Uint8Array(array)], { type: fileType })
    return new File([blob], fileName, { type: fileType })
  }

  async uploadImage(articleId, file, config) {
    try {
      const getResponse = await axios.get(`/api/me/articles/${articleId}/image_upload_url`, config)
      const putResponse = await axios.put(getResponse.data.upload_url, file, {
        headers: { 'Content-Type': config.params.upload_image_extension }
      })
      const responseData = { ...putResponse.config.data }
      responseData.default = getResponse.data.show_url
      return responseData
    } catch (error) {
      return Promise.reject('画像のアップロードに失敗しました')
    }
  }

  getConfig(token, fileSize, imageExtension) {
    return {
      headers: {
        Authorization: token,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      params: {
        upload_image_size: fileSize,
        upload_image_extension: imageExtension
      }
    }
  }
}
