export default function handleKeydownEnter(editor, urlRegexp, getResourceFromIframely) {
  editor.editing.view.document.on(
    'keydown',
    async (evt, data) => {
      const targetElement = editor.model.document.selection.getFirstPosition().parent
      const targetText =
        targetElement._children._nodes &&
        targetElement._children._nodes[0] &&
        targetElement._children._nodes[0]._data
      const enterKeyCode = 13

      if (data.keyCode !== enterKeyCode || !urlRegexp.test(targetText)) return
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
        const insertPosition = editor.model.document.selection.getLastPosition()
        const paragraph = writer.createElement('paragraph')
        writer.insert(paragraph, insertPosition)
        editor.model.insertContent(mediaElement, insertPosition)
        writer.setSelection(paragraph, 'on')
      })
    },
    { priority: 'highest' }
  )
}
