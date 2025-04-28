/**
 * Composables for common editor configurations.
 */
import type { EditorState } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
import * as Editor from '~/src/editor/Editor'
import * as Toolbar from "~/src/editor/Toolbar"
import * as HistoryActions from '~/src/editor/actions/History'
import * as FormattingActions from '~/src/editor/actions/Formatting'
import * as SectioningActions from '~/src/editor/actions/Sectioning'
import * as ClipboardActions from '~/src/editor/actions/Clipboard'
import * as ListActions from '~/src/editor/actions/Lists'
import * as WidgetActions from '~/src/editor/actions/Widgets'
import * as MediaActions from '~/src/editor/actions/Media'
import * as MiscActions from '~/src/editor/actions/Misc'
import type { EditorView } from 'prosemirror-view';
import { useMutation, useQuery } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { Markdown } from '~/src/editor/markdown/Parser'
import * as cheerio from 'cheerio';
import { injectLocal, provideLocal } from '@vueuse/core'
import { schema as ArticleEditorSchema } from '~/src/editor/Schema';

/** Max amount of characters to use for auto-generated summaries. */
const MAX_SUMMARY_LENGTH = 250

/** Creates an article editor model. */
export const useArticleEditor = (pmViewGetter: () => EditorView) => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor(ArticleEditorSchema, pmViewGetter)
  const toolbar = editor.getToolbar()
  const schema = editor.schema

  // Add default actions and groups

  // History actions
  editor.registerAction(new HistoryActions.Undo())
  editor.registerAction(new HistoryActions.Redo())
  toolbar.registerToolbarGroup(HistoryActions.actionGroup)

  // Formatting actions
  editor.registerAction(new FormattingActions.ToggleMark('ToggleBold', schema.marks.strong, 'ctrl_b'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleItalic', schema.marks.em, 'ctrl_i'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleUnderline', schema.marks.underline, 'ctrl_u'))
  editor.registerAction(new FormattingActions.ToggleMark('ToggleInlineCode', schema.marks.code))
  editor.registerAction(new FormattingActions.ToggleWordMark('ToggleLink', schema.marks.link))
  for (const action of FormattingActions.alignmentActions) {
    editor.registerAction(action)
  }
  toolbar.registerToolbarGroup(FormattingActions.actionGroup)

  // Sectioning actions
  for (const action of SectioningActions.headingActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new SectioningActions.InsertHorizontalRule())
  editor.registerAction(new SectioningActions.MakeQuote())
  toolbar.registerToolbarGroup(SectioningActions.actionGroup)

  // Clipboard actions
  toolbar.registerToolbarGroup(ClipboardActions.actionGroup)

  // Media actions
  editor.registerAction(new MediaActions.InsertImage())
  editor.registerAction(new MediaActions.InsertEmbed())
  toolbar.registerToolbarGroup(MediaActions.actionGroup)

  // List actions
  editor.registerAction(new ListActions.ToggleBulletList())
  editor.registerAction(new ListActions.ToggleNumberedList())
  toolbar.registerToolbarGroup(ListActions.actionGroup)

  // Widget actions
  editor.registerAction(new WidgetActions.InsertCodeBlock())
  for (const action of WidgetActions.alertActions) {
    editor.registerAction(action)
  }
  editor.registerAction(new WidgetActions.InsertFootnote())
  toolbar.registerToolbarGroup(WidgetActions.actionGroup)

  // Misc actions
  editor.registerAction(new MiscActions.InsertText())
  editor.registerAction(new MiscActions.DeleteSelection())

  // Set default keybinds
  for (const action of Object.values(editor.actions)) {
    const actionID = action.id
    const defaultKeybind = editor.getAction(actionID).getDefaultKeyCombo()
    editor.setItemKeybind(actionID, defaultKeybind)
  }

  return editor
}

/** Auxiliary composable to import editor injects. */
export const useEditorInjects = () => {
  const editor = injectLocal<Ref<Editor.Editor>>('editor')!
  // Use computed to make contexts that use it reactive even if they don't use the editor itself
  const toolbar = computed(() => {
    return editor.value!.getToolbar()
  })
  const editorState = injectLocal<Ref<EditorState>>('editorState')!
  const editorView = injectLocal<Ref<EditorView>>('editorView')!
  const itemUsedCallbacks = injectLocal<Ref<Toolbar.ItemUsedCallback[]>>('itemUsedCallbacks')!
  const schema = injectLocal<Schema>('documentSchema')!
  return { editor, toolbar, editorState, editorView, itemUsedCallbacks, schema }
}

/** Composable for the editor document's ProseMirror schema. */
export const useEditorSchema = () => {
  const { editor } = useEditorInjects()
  return editor.value.schema // Immutable; no reactivity necessary
}

/** Queries and mutations for fetching and editing the article editor's current article. */
export const useArticleEditorQueries = () => {
  const articleService = useArticleService()
  const responseToast = useResponseToast()
  const { editor, editorState } = useEditorInjects()
  const router = useRouter()
  const route = useRoute()

  /** Query for fetching article metadata and initial content */
  const articleQuery = useQuery({
    queryKey: ['articleContent'],
    queryFn: async () => {
      if (route.query['article']) {
        const article = await articleService.getArticle(route.query['article'] as string)
        return article
      } else {
        return null
      }
    },
    retry: (count, err) => {
      if ((err as AxiosError).status === 404) {
        // Redirect back to admin panel if the article URL is invalid
        responseToast.showError('Article not found')
        router.push('/admin/content') 
      } else if (count == 1) { // Show error on first failed fetch
        responseToast.showError('Failed to load article content', err)
      }
      return true
    }
  })

  /** Mutation for saving the article */
  const articleMutation = useMutation({
    mutationFn: (patchData: ArticleUpdateRequest) => {
      return articleService.updateArticle((articleQuery.data.value as Article).path, patchData)
    },
    onSuccess: (article) => {
      responseToast.showSuccess('Article saved')
      articleQuery.refetch()
    },
    onError: (err) => {
      responseToast.showError('Failed to save article', err)
    }
  })

  /** 
   * Validates article metadata values and resets them if they're not valid.
   */
  function validateMetadata(article: ArticleUpdateRequest) {
    // Reset the title field to the original fetched data if the user attempts to clear it.
    if (article.title === '') {
      article.title = article!.title
    }
  }

  /** Serializes the editor document and requests to patch the article. */
  function saveDocument(articleData: ArticleUpdateRequest) {
    // Ensure fields are set to valid values first
    validateMetadata(articleData)

    // Serialize the document and PATCH the article
    const state = toRaw(editorState!)
    const markdownStr = editor.value.serializeDocument(state.value)

    // Extract text without markdown markers
    const $ = cheerio.load(Markdown.render(markdownStr))
    const text = DOMUtils.extractText($)
    
    // Generate "summary"
    const summary = text.substring(0, MAX_SUMMARY_LENGTH)

    console.log('Serialized document')
    console.log(markdownStr)
    articleMutation.mutate({
      ...articleData,
      content: markdownStr.length > 0 ? markdownStr : ' ', // Backend requires the string to be non-empty.
      text: text,
      summary: summary,
    })
  }

  return {
    saveDocument: saveDocument,
    articleQuery: articleQuery,
    articleMutation: articleMutation,
    validateMetadata: validateMetadata,
  }
}
