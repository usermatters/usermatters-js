import { createPopper, Instance as PopperInstance } from '@popperjs/core'

export { emojiMap, getEmoji } from './utils'

export type Options = {
  project: string
  user?: string | null
  api?: string | null
}

const getPopper = (el: Element, app: any) => {
  return createPopper(el, app, {
    placement: 'bottom',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  })
}

export type Instance = ReturnType<typeof create>

const USERMATTERS = 'usermatters'
const ELEMENT_NAME = USERMATTERS + '-app'

// register the custom element in browser only
if (typeof window !== 'undefined') {
  const App = require('./App.svelte')
  if (!customElements.get(ELEMENT_NAME)) {
    customElements.define(ELEMENT_NAME, App.default || App)
  }
}

export type App = HTMLElement & {
  hide: () => void
  buttonEl: HTMLElement
  project: string
  user: string
  api: string
  open: boolean
  focusInput: () => void
}

export const handleDocumentClick = (e: any) => {
  const apps = document.querySelectorAll('usermatters-app') as NodeListOf<App>
  ;[...apps].forEach((app) => {
    if (!app.contains(e.target)) {
      app.hide()
    }
  })
}

export const create = () => {
  let popper: PopperInstance | undefined
  let app: App | undefined

  const instance = {
    show(buttonEl: HTMLElement, { project, user, api }: Options) {
      if (!app) {
        app = document.createElement(ELEMENT_NAME) as App
        document.body.appendChild(app)
      }

      popper && popper.destroy()
      popper = getPopper(buttonEl, app)

      app.buttonEl = buttonEl
      app.project = project
      app.user = user || ''

      if (api) {
        app.api = api
      }
      app.open = true

      app.focusInput()
    },

    getApp() {
      return app
    },

    destroy() {
      popper && popper.destroy()
      app && app.remove()
      app = popper = undefined
    },
  }

  return instance
}
