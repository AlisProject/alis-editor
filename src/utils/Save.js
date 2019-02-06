export default function saveData(body, articleId, clientId, functions) {
  return new Promise(async (resolve, reject) => {
    functions.setIsSaving({ isSaving: true })
    functions.setIsEdited({ isEdited: true })
    functions.setSaveStatus({ saveStatus: '保存中' })
    try {
      // Update body
      const article = { body }
      functions.updateBody({ body })
      await functions.putArticleBody({ article, articleId })

      // Update Thumbnail
      functions.putThumbnail()

      // Complete save
      functions.setSaveStatus({ saveStatus: '保存済み' })
      functions.setIsSaving({ isSaving: false })
      functions.setIsEdited({ isEdited: false })
      resolve()
    } catch (error) {
      functions.sendNotification({ text: '記事の更新に失敗しました', type: 'warning' })
      reject(error)
    }
  })
}
