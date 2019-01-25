import axios from 'axios'

export default function saveData(data, articleId, clientId, status) {
  const currentUser = localStorage.getItem(
    `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`
  )
  const token = localStorage.getItem(
    `CognitoIdentityServiceProvider.${clientId}.${currentUser}.idToken`
  )
  const params = {
    body: data
  }
  return new Promise(async (resolve, reject) => {
    if (status === 'draft') {
      try {
        const res = await axios.put(`/api/me/articles/${articleId}/drafts/body`, params, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        })
        setTimeout(() => {
          console.log('Saved', data)
          console.log(res)
          resolve(res)
        }, 1000)
      } catch (error) {
        reject(error)
      }
    }
  })
}
