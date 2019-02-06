import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import Template from '@ckeditor/ckeditor5-ui/src/template'
import log from '@ckeditor/ckeditor5-utils/src/log'

export default class Emptyness extends Plugin {
  static get pluginName() {
    return 'Emptyness'
  }

  init() {
    const editor = this.editor
    const doc = editor.model.document
    const view = editor.ui.view.editable

    if (!view) {
      log.error(
        'emptyness-view-not-found: expected editable view not found for this editor (expects editor.ui.view.editable to be defined)'
      )
      return
    }

    editor.set('isEmpty', !documentHasContent(doc))

    this.listenTo(doc, 'change:data', () => {
      editor.set('isEmpty', !documentHasContent(doc))
    })

    if (view.isRendered === true) {
      log.warn(
        'emptyness-view-is-rendered: can not extend the editor UI view after its been rendered, class name will be unavailable (see: template-extend-render)'
      )
      return
    }

    const bind = Template.bind(editor, editor)

    view.extendTemplate({
      attributes: {
        class: [bind.if('isEmpty', 'ck-editor__is-empty')]
      }
    })
  }
}

function documentHasContent(doc) {
  return doc.model.hasContent(doc.getRoot())
}
