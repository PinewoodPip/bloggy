import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { schema } from '~/src/editor/Schema'
import { MarkType } from 'prosemirror-model'
import { InputRule, inputRules, textblockTypeInputRule } from 'prosemirror-inputrules'
import { ProseMirrorUtils } from '~/utils/ProseMirror'

/** Creates an input rule that toggles storing a mark. */
function createMarkToggleRule(markType: MarkType): (state: EditorState, match: any, start: integer, end: integer) => Transaction | null {
  return (state: EditorState, match: any, start: integer, end: integer) => {
    let $start = state.doc.resolve(start)
    if (!$start.node().type.allowsMarkType(markType)) return null // Do nothing if within a node that doesn't accept the mark

    // Delete the matched text and toggle the mark
    let tr = state.tr.delete(start, end)
    const hadMark = ProseMirrorUtils.hasMark($start, markType)
    if (hadMark) {
      tr = tr.removeStoredMark(markType)
      // Also add a space for convenience when exiting the mark
      tr = tr.insertText(' ')
    } else {
      tr = tr.addStoredMark(markType.create())
    }
    return tr
  }
}

/** Creates a plugin with input rules to toggle CommonMark formatting marks. */
export const useFormattingInputRules = () => {
  const rules = [
    // 3 asterisks + character toggles bold
    new InputRule(new RegExp(/\*\*\*[^\*]$/), createMarkToggleRule(schema.marks.strong)),
    // 2 asterisks + character toggles italics
    new InputRule(new RegExp(/\*\*[^\*]$/), createMarkToggleRule(schema.marks.em)),
    // 2 backticks + character toggles inline code
    new InputRule(new RegExp(/``[^`]$/), createMarkToggleRule(schema.marks.code)),
    // 2 underwcores + character toggles underline
    new InputRule(new RegExp(/__[^_]$/), createMarkToggleRule(schema.marks.underline)),
    // 3 dashes creates h-rule
    new InputRule(new RegExp(/^—-$/), (state, match, start, end) => {
      const node = schema.nodes['horizontal_rule']
      let tr = state.tr.delete(start, end)
      ProseMirrorUtils.insertBeforeCursor(tr, node.create())
      return tr
    }),
  ]
  return inputRules({
    rules: rules,
  })
}