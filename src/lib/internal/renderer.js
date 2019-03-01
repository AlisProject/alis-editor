import isText from '@ckeditor/ckeditor5-utils/src/dom/istext'
import { isBlockFiller } from '@ckeditor/ckeditor5-engine/src/view/filler'
import remove from '@ckeditor/ckeditor5-utils/src/dom/remove'

export function sameNodes(blockFiller, actualDomChild, expectedDomChild) {
  // Elements.
  if (actualDomChild === expectedDomChild) {
    return true
  }
  // Texts.
  else if (isText(actualDomChild) && isText(expectedDomChild)) {
    if (actualDomChild.data === expectedDomChild.data) {
      return true
    }
    // actualDomChild.data と expectedDomChild.data で参照しているテキストは内部処理で
    // 半角スペースが u00a0 に書き換えられているため、iOS では処理が落ちるケースがある。
    // そのため、比較前に u00a0 を半角スペースに戻した上で比較処理を行っている。
    return actualDomChild.data.replace(/\u00a0/g, ' ') === expectedDomChild.data
  }
  // Block fillers.
  else if (
    isBlockFiller(actualDomChild, blockFiller) &&
    isBlockFiller(expectedDomChild, blockFiller)
  ) {
    return true
  }

  // Not matching types.
  return false
}

export function updateChildrenMappings(viewElement) {
  const domElement = this.domConverter.mapViewToDom(viewElement)

  if (!domElement) {
    // If there is no `domElement` it means that it was already removed from DOM and there is no need to process it.
    return
  }

  const actualDomChildren = this.domConverter.mapViewToDom(viewElement).childNodes
  const expectedDomChildren = Array.from(
    this.domConverter.viewChildrenToDom(viewElement, domElement.ownerDocument, {
      withChildren: false
    })
  )

  // リンクの右側にテキストがある状態で、リンクの末尾で文字を入力した場合、
  // actualDomChildren と expectedDomChildren の構造が以下のように異なってしまう。
  // （入力文字を「あ」とする）
  // - actualDomChildren： { a: 'リンク', #text: 'あ', #text: 'テキスト' }
  // - expectedDomChildren { a: 'リンク', #text: 'あテキスト' }
  // actualDomChildren と expectedDomChildren は同じ構造であることが前提となっているため、
  // 異なるとエラーが発生してしまう。
  // そのため以下のロジックで actualDomChildren の構造が expectedDomChildren と等しくなるように
  // 書き換えている。
  for (let i = 0; i < actualDomChildren.length; i++) {
    if (actualDomChildren[i].nodeName === 'A') {
      if (
        actualDomChildren[i + 1] &&
        actualDomChildren[i + 1].nodeName === '#text' &&
        actualDomChildren[i + 1].length === 1 &&
        actualDomChildren[i + 2] &&
        actualDomChildren[i + 2].nodeName === '#text'
      ) {
        actualDomChildren[i + 1].data =
          actualDomChildren[i + 1].data + actualDomChildren[i + 2].data
        actualDomChildren[i + 2].remove()
        break
      }
    }
  }

  const diff = this._diffNodeLists(actualDomChildren, expectedDomChildren)
  const actions = this._findReplaceActions(diff, actualDomChildren, expectedDomChildren)

  if (actions.indexOf('replace') !== -1) {
    const counter = { equal: 0, insert: 0, delete: 0 }

    for (const action of actions) {
      if (action === 'replace') {
        const insertIndex = counter.equal + counter.insert
        const deleteIndex = counter.equal + counter.delete
        const viewChild = viewElement.getChild(insertIndex)

        // The 'uiElement' is a special one and its children are not stored in a view (#799),
        // so we cannot use it with replacing flow (since it uses view children during rendering
        // which will always result in rendering empty element).
        if (viewChild && !viewChild.is('uiElement')) {
          this._updateElementMappings(viewChild, actualDomChildren[deleteIndex])
        }

        remove(expectedDomChildren[insertIndex])
        counter.equal++
      } else {
        counter[action]++
      }
    }
  }
}
