import axios from 'axios'
export default function saveData(data, articleId, clientId, functions, status) {
  const params = {
    body: data
  }
  return new Promise(async (resolve, reject) => {
    await functions.getUserSession()
    functions.setIsSaving({ isSaving: true })
    functions.setIsEdited({ isEdited: true })
    functions.setSaveStatus({ saveStatus: '保存中' })
    const currentUser = localStorage.getItem(
      `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
    )
    const token = localStorage.getItem(
      `CognitoIdentityServiceProvider.${clientId}.${currentUser}.idToken`
    )
    try {
      functions.updateBody({ body: data })
      const res = await axios.put(`api/me/articles/${articleId}/${status}/body`, params, {
        headers: {
          Authorization: token,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
      functions.setSaveStatus({ saveStatus: '保存済み' })
      functions.setIsSaving({ isSaving: false })
      functions.setIsEdited({ isEdited: false })
      resolve(res)
    } catch (error) {
      functions.sendNotification({ text: '記事の更新に失敗しました', type: 'warning' })
      reject(error)
    }
  })
}
