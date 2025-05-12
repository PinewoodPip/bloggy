import type { EditorState } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';
import * as Editor from '~/src/editor/Editor'
import * as Tools from "~/src/editor/ToolManager"
import * as MediaActions from '~/src/editor/actions/Media'
import * as MiscActions from '~/src/editor/actions/Misc'
import * as WidgetActions from '~/src/editor/actions/Widgets'
import type { EditorView } from 'prosemirror-view';
import { schema as ArticleEditorSchema } from '~/src/editor/schemas/Article';
import * as FormattingTools from '~/src/editor/tools/Formatting';
import * as HistoryTools from '~/src/editor/tools/History';
import * as SectioningTools from '~/src/editor/tools/Sectioning';
import * as ClipboardTools from '~/src/editor/tools/Clipboard';
import * as MediaTools from '~/src/editor/tools/Media';
import * as ListTools from '~/src/editor/tools/Lists';
import * as WidgetTools from '~/src/editor/tools/Widgets';
import { useMutation, useQuery } from '@tanstack/vue-query';
import type { AxiosError } from 'axios';
import { Markdown } from '~/src/editor/markdown/Parser'
import * as cheerio from 'cheerio';


/** Max amount of characters to use for auto-generated summaries. */
const MAX_SUMMARY_LENGTH = 250

/** Creates an editor model for articles, with a rich-text schema and corresponding tools. */
export const useArticleEditor = (pmViewGetter: () => EditorView) => {
  // Create editor
  const editor: Editor.Editor = new Editor.Editor(ArticleEditorSchema, pmViewGetter)
  const toolManager = editor.getToolManager()
  const schema = editor.schema

  // History actions
  const { undoTool: undo, redoTool: redo } = HistoryTools.RegisterHistoryActions(editor)

  // Formatting actions
  const bold = FormattingTools.RegisterFormatBold(editor, schema.marks.strong)
  const italic = FormattingTools.RegisterFormatItalics(editor, schema.marks.em)
  const underline = FormattingTools.RegisterFormatUnderline(editor, schema.marks.underline)
  const inlineCode = FormattingTools.RegisterFormatInlineCode(editor, schema.marks.code)
  const link = FormattingTools.RegisterFormatLink(editor, schema.marks.link)
  const alignmentMenu = FormattingTools.RegisterAlignmentMenu(editor)

  // Sectioning actions
  const headingTools = SectioningTools.RegisterHeadingTools(editor)
  const horizontalRule = SectioningTools.RegisterHorizontalRuleTool(editor)
  const quote = SectioningTools.RegisterQuoteTool(editor)

  // Clipboard tools
  const clipboardTools = ClipboardTools.RegisterClipboardTools(editor)

  // Media tools
  const imageTools = MediaTools.RegisterArticleImageTools(editor)
  const embed = MediaTools.RegisterEmbedTool(editor)
  const emojiPicker = MediaTools.RegisterEmojiPickerTool(editor)

  // List tools
  const { menu: listMenu, toggleBulletListTool, toggleNumberedListTool } = ListTools.RegisterListTools(editor)

  // Widget actions
  const { menu: noteMenu } = WidgetTools.RegisterNoteTools(editor)
  const codeBlock = WidgetTools.RegisterCodeBlockTool(editor)
  const footnote = WidgetTools.RegisterFootnoteTool(editor)
  const annotation = WidgetTools.RegisterAnnotationTool(editor)

  // Define toolbar
  toolManager.registerToolPalette({
    id: 'toolbar',
    toolGroups: [
      // History
      {
        name: 'History',
        tools: [
          undo.id,
          redo.id, 
        ],
      },
      // Clipboard
      {
        name: 'Clipboard',
        tools: [
          clipboardTools.cutTool.id,
          clipboardTools.copyTool.id,
          clipboardTools.pasteTool.id,
        ],
      },
      // Formatting
      {
        name: 'Formatting',
        tools: [
          bold.id,
          italic.id,
          underline.id,
          inlineCode.id,
          link.id,
          alignmentMenu.id,
        ],
      },
      // Sectioning
      {
        name: 'Sectioning',
        tools: [
          headingTools.id,
          horizontalRule.id,
          quote.id,
        ],
      },
      // Media
      {
        name: 'Media',
        tools: [
          imageTools.menu.id,
          embed.id,
          emojiPicker.id,
        ],
      },
      // Lists
      {
        name: 'Lists',
        tools: [
          toggleBulletListTool.id,
          toggleNumberedListTool.id,
        ],
      },
      // Widgets
      {
        name: 'Widgets',
        tools: [
          codeBlock.id,
          noteMenu.id,
          footnote.id,
          annotation.id,
        ],
      },
    ]
  })

  // Define context menu
  toolManager.registerToolPalette({
    id: 'context-menu',
    toolGroups: [
      // Clipboard
      {
        name: 'Clipboard',
        tools: [
          clipboardTools.cutTool.id,
          clipboardTools.copyTool.id,
          clipboardTools.pasteTool.id,
        ],
      },
      // Formatting
      {
        name: 'Formatting',
        tools: [
          link.id,
        ],
      },
      // Media
      {
        name: 'Media',
        tools: [
          imageTools.editTool.id,
          emojiPicker.id,
          annotation.id,
        ],
      },
    ]
  })

  // Misc actions
  editor.registerAction('InsertImage', new MediaActions.InsertImage())
  editor.registerAction('InsertEmbed', new MediaActions.InsertEmbed())
  editor.registerAction('InsertText', new MiscActions.InsertText())
  editor.registerAction('DeleteSelection', new MiscActions.DeleteSelection())
  editor.registerAction('SetAnnotation', new WidgetActions.SetAnnotation())
  editor.registerAction('DeleteAnnotation', new WidgetActions.DeleteAnnotation())

  return editor
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
        const article = await articleService.getArticle(route.query['article'] as string, true)
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

    // Extract annotations
    const annotationsPlugin = ProseMirrorUtils.getPlugin(state.value, 'comment$')
    const annotationsState = annotationsPlugin.getState(state.value) as CommentState
    // @ts-ignore
    const annotations = annotationsState.decos.find(0, state.value.doc.nodeSize)
    const parsedAnnotations: ArticleAnnotationInput[] = []
    for (const decoration of annotations) {
      const annotation = decoration.type.spec
      const to = decoration.to
      const from = decoration.from
      const attrs = annotation.comment
      parsedAnnotations.push({
        author: attrs.author,
        id: attrs.id,
        comment: attrs.text,
        start: from,
        end: to,
      })
    }

    // Mutate the article
    console.log('Serialized document')
    console.log(markdownStr)
    articleMutation.mutate({
      ...articleData,
      content: markdownStr.length > 0 ? markdownStr : ' ', // Backend requires the string to be non-empty.
      text: text,
      summary: summary,
      annotations: parsedAnnotations,
    })
  }

  return {
    saveDocument: saveDocument,
    articleQuery: articleQuery,
    articleMutation: articleMutation,
    validateMetadata: validateMetadata,
  }
}

/** Composable for items to show in the main editor menu bar. */
export const useArticleEditorMainMenu = () => {
  const itemGroup: Tools.MultiTool = {
    id: 'Document',
    def: {
      name: 'Document',
      icon: 'i-heroicons-document-text',
    },
    type: 'multitool',
    subitems: [
      // File menu
      {
        type: 'multitool',
        id: 'Document.File',
        def: {
          name: 'File',
          icon: 'i-heroicons-document-text',
        },
        subitems: [
          {
            type: 'callback',
            id: 'Document.File.Save',
            def: {
              name: 'Save & publish',
              icon: 'i-heroicons-book-open-16-solid',
            },
          },
          {
            type: 'callback',
            id: 'Document.File.SaveDraft',
            def: {
              name: 'Save as draft',
              icon: 'i-heroicons-pencil-square',
            },
          },
          {
            type: 'callback',
            id: 'Document.Properties',
            def: {
              name: 'Article properties',
              icon: 'i-heroicons-document-text',
            },
          }
        ],
      } as Tools.MultiTool,
      // View menu
      {
        type: 'multitool',
        id: 'Document.View',
        def: {
          name: 'View',
          icon: 'i-heroicons-settings-16-solid',
        },
        subitems: [
          {
            type: 'callback',
            id: 'Document.View.Markdown',
            def: {
              name: 'Markdown mode',
              icon: 'i-material-symbols-markdown-outline',
            },
          },
          {
            type: 'callback',
            id: 'Document.View.TableOfContents',
            def: {
              name: 'Table of contents',
              icon: 'i-material-symbols-data-table-outline',
            },
          },
        ],
      } as Tools.MultiTool,
      // Settings
      {
        type: 'callback',
        id: 'Document.Settings',
        def: {
          name: 'Settings',
          icon: 'i-heroicons-cog-6-tooth-solid',
        },
      },
    ]
  }

  return { itemGroup }
}