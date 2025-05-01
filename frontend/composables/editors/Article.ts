import * as Tools from '~/src/editor/ToolManager'

/** Composable for items to show in the main editor menu bar. */
export const useArticleEditorMainMenu = () => {
  const itemGroup: Tools.MenuTool = {
    id: 'Document',
    def: {
      name: 'Document',
      icon: 'i-heroicons-document-text',
    },
    type: 'menu',
    subitems: [
      // File menu
      {
        type: 'menu',
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
      } as Tools.MenuTool,
      // View menu
      {
        type: 'menu',
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
      } as Tools.MenuTool,
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