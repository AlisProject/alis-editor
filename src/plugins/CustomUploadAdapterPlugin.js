import CustomUploadAdapter from '@/adapters/CustomUploadAdapter'

export default function CustomUploadAdapterPlugin(articleId, clientId, getUserSession, editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader, articleId, clientId, getUserSession)
  }
}
