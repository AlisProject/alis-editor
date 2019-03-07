import { VALIDATE_URL_REGEXP } from '@/utils/constant'

export default function handleKeydownEnter(editor, getResourceFromIframely) {
  editor.editing.view.document.on(
    'keydown',
    async (evt, data) => {
      const selection = editor.model.document.selection
      // 引用の中では media を埋め込まない
      if (
        selection.anchor.parent &&
        selection.anchor.parent.parent &&
        selection.anchor.parent.parent.name === 'blockQuote'
      ) {
        return
      }
      const targetElement = selection.getFirstPosition().parent
      const targetText =
        targetElement._children._nodes &&
        targetElement._children._nodes[0] &&
        targetElement._children._nodes[0]._data &&
        targetElement._children._nodes[0]._data.trim()
      const enterKeyCode = 13

      if (data.keyCode !== enterKeyCode || !VALIDATE_URL_REGEXP.test(targetText)) return
      try {
        await getResourceFromIframely('iframely', targetText)
      } catch (error) {
        console.error(error)
        return
      }
      evt.stop()
      editor.model.change((writer) => {
        writer.remove(targetElement)
        const mediaElement = writer.createElement('media', { url: targetText })
        const mediaElementInsertPosition = editor.model.document.selection.getLastPosition()
        editor.model.insertContent(mediaElement, mediaElementInsertPosition)
        writer.setSelection(mediaElement, 'on')
        const paragraphInsertPosition = editor.model.document.selection.getLastPosition()
        const paragraph = writer.createElement('paragraph')
        writer.insert(paragraph, paragraphInsertPosition)
        writer.setSelection(paragraph, 'in')
      })
    },
    { priority: 'highest' }
  )
}
