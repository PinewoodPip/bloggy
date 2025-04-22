import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { MarkType, Schema } from 'prosemirror-model'
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
export const useFormattingInputRules = (schema: Schema) => {
  const rules: InputRule[] = []

  // Create rules only for nodes that the schema support
  let node, mark;
  if (mark = schema.marks.strong) {
    // 3 asterisks + character toggles bold
    rules.push(new InputRule(
      new RegExp(/\*\*\*[^\*]$/),
      createMarkToggleRule(mark))
    )
  }
  if (mark = schema.marks.em) {
    // 2 asterisks + character toggles italics
    rules.push(
      new InputRule(
        new RegExp(/\*\*[^\*]$/),
        createMarkToggleRule(mark))
    )
  }
  if (mark = schema.marks.code) {
    // 2 backticks + character toggles inline code
    rules.push(
      new InputRule(new RegExp(/``[^`]$/),
      createMarkToggleRule(mark)),
    )
  }
  if (mark = schema.marks.underline) {
    // 2 underwcores + character toggles underline
    rules.push(
      new InputRule(new RegExp(/__[^_]$/),
      createMarkToggleRule(mark)),
    )
  }
  if (schema.nodes.horizontal_rule) {
    // 3 dashes creates h-rule
    rules.push(
      new InputRule(new RegExp(/^—-$/), // Starts with em-dash because a built-in rule already exists for converting 2 dashes into it
      (state, match, start, end) => {
        const node = schema.nodes['horizontal_rule']
        let tr = state.tr.delete(start, end)
        ProseMirrorUtils.insertBeforeCursor(tr, node.create())
        return tr
      }
    ))
  }

  return inputRules({
    rules: rules,
  })
}