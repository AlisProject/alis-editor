export default function saveData(body, articleId, clientId, functions) {
  return new Promise(async (resolve, reject) => {
    functions.setIsSaving({ isSaving: true })
    functions.setIsEdited({ isEdited: true })
    functions.setSaveStatus({ saveStatus: '保存中' })
    try {
      // Update body
      console.log('B1')
      const article = { body }
      console.log('B2')
      functions.updateBody({ body })
      console.log('B3')
      console.log(article)
      console.log(articleId)
      console.log(functions)
      await functions.putArticleBody({ article, articleId })
      console.log('B4')

      // Update Thumbnail
      functions.putThumbnail()
      console.log('B5')

      // Complete save
      functions.setSaveStatus({ saveStatus: '保存済み' })
      console.log('B6')
      functions.setIsSaving({ isSaving: false })
      console.log('B7')
      functions.setIsEdited({ isEdited: false })
      console.log('B8')
      resolve()
    } catch (error) {
      functions.sendNotification({ text: '記事の更新に失敗しました', type: 'warning' })
      reject(error)
    }
  })
}
