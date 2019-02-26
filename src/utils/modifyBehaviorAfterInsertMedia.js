export default function modifyBehaviorAfterInsertMedia(editor) {
  editor.model.document.on('change', (event, data) => {
    const isInsertMediaOperation = data.operations.some((operation) => {
      if (operation.constructor.name !== 'InsertOperation') return
      return operation.nodes && operation.nodes._nodes[0].name === 'media'
    })
    if (isInsertMediaOperation) {
      editor.model.change((writer) => {
        const insertPosition = editor.model.document.selection.getLastPosition()
        const paragraph = writer.createElement('paragraph')
        writer.insert(paragraph, insertPosition)
        writer.setSelection(paragraph, 'on')
      })
    }
  })
}
