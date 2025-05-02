/**
 * Adapted from https://github.com/ProseMirror/website/blob/master/src/collab/client/comment.js
 */
import crel from "crelt"
import {Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

export class Comment {
  constructor(text: string, id: integer, author: string) {
    this.id = id
    this.text = text
    this.author = author
  }
}

function deco(from: integer, to: integer, comment) {
  return Decoration.inline(from, to, {class: "pm-annotation"}, {comment})
}

export class CommentState {
  constructor(version, decos, unsent) {
    this.version = version
    this.decos = decos
    this.unsent = unsent
  }

  findComment(id) {
    let current = this.decos.find()
    for (let i = 0; i < current.length; i++)
      if (current[i].spec.comment.id == id) return current[i]
  }

  commentsAt(pos) {
    return this.decos.find(pos, pos)
  }

  apply(tr) {
    let action = tr.getMeta(commentPlugin), actionType = action && action.type
    // Do nothing if the transaction doesn't change comments
    if (!action && !tr.docChanged) return this

    // Mutate comment manager state
    let base = this
    // Receive comment
    if (actionType == "receive") base = base.receive(action, tr.doc)

    // Map existing decorations through new changes
    let decos = base.decos, unsent = base.unsent
    decos = decos.map(tr.mapping, tr.doc)
    
    // Update existing comments
    if (actionType == "newComment") {
      decos = decos.add(tr.doc, [deco(action.from, action.to, action.comment)])
      unsent = unsent.concat(action)
    } else if (actionType == "deleteComment") {
      decos = decos.remove([this.findComment(action.comment.id)])
      unsent = unsent.concat(action)
    }

    return new CommentState(base.version, decos, unsent)
  }

  receive({version, events, sent}, doc) {
    let set = this.decos
    for (let i = 0; i < events.length; i++) {
      let event = events[i]
      if (event.type == "delete") {
        let found = this.findComment(event.id)
        if (found) set = set.remove([found])
      } else { // "create"
        if (!this.findComment(event.id))
          set = set.add(doc, [deco(event.from, event.to, new Comment(event.text, event.id, event.author))])
      }
    }
    return new CommentState(version, set, this.unsent.slice(sent))
  }

  unsentEvents() {
    let result = []
    for (let i = 0; i < this.unsent.length; i++) {
      let action = this.unsent[i]
      if (action.type == "newComment") {
        let found = this.findComment(action.comment.id)
        if (found) result.push({type: "create", id: action.comment.id,
                                from: found.from, to: found.to,
                                text: action.comment.text,
                                author: action.comment.author,})
      } else {
        result.push({type: "delete", id: action.comment.id})
      }
    }
    return result
  }

  static init(config) {
    let decos = config.comments?.comments.map(c => deco(c.from, c.to, new Comment(c.text, c.id, c.author)))
    return new CommentState(config.comments?.version || 1, DecorationSet.create(config.doc, decos || []), [])
  }
}

export const commentPlugin = new Plugin({
  key: new PluginKey('comment'),
  state: {
    init: CommentState.init,
    apply(tr, prev) { return prev.apply(tr) }
  },
  props: {
    decorations(state) { return this.getState(state).decos }
  }
})
export const useAnnotationsPlugin = () => {
  return commentPlugin
}

// Comment UI
export const commentUI = function(dispatch) {
  return new Plugin({
    props: {
      decorations(state) {
        return commentTooltip(state, dispatch)
      }
    }
  })
}

function commentTooltip(state, dispatch) {
  let sel = state.selection
  if (!sel.empty) return null
  let comments = commentPlugin.getState(state).commentsAt(sel.from)
  if (!comments.length) return null
  return DecorationSet.create(state.doc, [Decoration.widget(sel.from, renderComments(comments, dispatch, state))])
}

function renderComments(comments, dispatch, state) {
  return crel("div", {class: "tooltip-wrapper"},
              crel("ul", {class: "commentList"},
                   comments.map(c => renderComment(c.spec.comment, dispatch, state))))
}

function renderComment(comment, dispatch, state) {
  let btn = crel("button", {class: "commentDelete", title: "Delete annotation"}, "×")
  btn.addEventListener("click", () =>
    dispatch(state.tr.setMeta(commentPlugin, {type: "deleteComment", comment}))
  )
  return crel("li", {class: "commentText"}, comment.text, btn)
}