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
  inline?: boolean
  focusInput: () => void
}

export const hideApps = (ignoreApp?: (app: App) => boolean) => {
  const apps = document.querySelectorAll('usermatters-app') as NodeListOf<App>
  ;[...apps].forEach((app) => {
    if (app.inline) return
    if (ignoreApp && ignoreApp(app)) return
    app.hide()
  })
}

export const create = () => {
  let popper: PopperInstance | undefined
  let app: App | undefined
  let buttonElCache: HTMLElement | undefined

  const instance = {
    show(buttonEl: HTMLElement, { project, user, api }: Options) {
      if (!app) {
        app = document.createElement(ELEMENT_NAME) as App
        document.body.appendChild(app)
      }

      buttonElCache = buttonEl
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
      app = popper = buttonElCache = undefined
    },

    handleDocumentClick(e: any) {
      if (!app || !buttonElCache) return

      if (buttonElCache.contains(e.target)) {
        // Close other apps
        hideApps((_app) => _app === app)
      } else if (!app.contains(e.target)) {
        app.hide()
      }
    },
  }

  return instance
}
