import isText from '@ckeditor/ckeditor5-utils/src/dom/istext'
import { isBlockFiller } from '@ckeditor/ckeditor5-engine/src/view/filler'

export default function sameNodes(blockFiller, actualDomChild, expectedDomChild) {
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
