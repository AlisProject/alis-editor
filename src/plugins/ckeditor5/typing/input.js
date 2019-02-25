/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/input
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import InputCommand from './inputcommand'

import injectUnsafeKeystrokesHandling from '@ckeditor/ckeditor5-typing/src/utils/injectunsafekeystrokeshandling'
import injectTypingMutationsHandling from '@ckeditor/ckeditor5-typing/src/utils/injecttypingmutationshandling'

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Input extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Input'
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor

    // TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
    const inputCommand = new InputCommand(editor, editor.config.get('typing.undoStep') || 20)

    editor.commands.add('input', inputCommand)

    injectUnsafeKeystrokesHandling(editor)
    injectTypingMutationsHandling(editor)
  }
}
