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

// register the custom element in browser only
if (typeof window !== 'undefined') {
  require('./App.svelte')
}

export const create = () => {
  let popper: PopperInstance | undefined
  let app: any

  return {
    show(buttonEl: Element, { project, user, api }: Options) {
      if (!app) {
        app = document.createElement('usermatters-app')
        document.body.appendChild(app)
      }

      popper = getPopper(buttonEl, app)

      app.project = project
      app.user = user || ''

      if (api) {
        app.api = api
      }
      app.open = true

      app.focusInput()
      ;[...document.querySelectorAll('usermatters-app')].forEach((el: any) => {
        if (el === app) {
          el.style.zIndex = '9999'
        } else {
          el.style.zIndex = '9998'
        }
      })
    },

    destroy() {
      app && app.remove()
      popper && popper.destroy()
      app = popper = undefined
    },
  }
}
