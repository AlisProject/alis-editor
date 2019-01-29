export default function saveData(body, articleId, clientId, functions) {
  return new Promise(async (resolve, reject) => {
    functions.setIsSaving({ isSaving: true })
    functions.setIsEdited({ isEdited: true })
    functions.setSaveStatus({ saveStatus: '保存中' })
    try {
      const article = { body }
      functions.updateBody({ body })
      functions.putArticleBody({ article, articleId })
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
