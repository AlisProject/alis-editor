export default function saveData(body, articleId, clientId, functions) {
  return new Promise(async (resolve) => {
    functions.setIsSaving({ isSaving: true })
    functions.setIsEditedBody({ isEditedBody: true })
    functions.setSaveStatus({ saveStatus: '保存中' })
    try {
      // Update body
      const articleBody = { body }
      functions.updateBody({ body })
      await functions.putArticleBody({ articleBody, articleId })

      // Update Thumbnail
      functions.putThumbnail()

      // Complete save
      functions.setSaveStatus({ saveStatus: '保存済み' })
    } catch (error) {
      functions.sendNotification({
        text: '記事の更新に失敗しました。お手数ですが、しばらく時間を置いて再度お試しください',
        type: 'warning'
      })
    } finally {
      functions.setIsSaving({ isSaving: false })
      functions.setIsEditedBody({ isEditedBody: false })
      resolve()
    }
  })
}
