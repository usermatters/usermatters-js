import { create, Instance, hideApps, App } from './index'

const ATTR_PREFIX = `data-usermatters-`
const PROJECT_ATTR = `${ATTR_PREFIX}project`
const USER_ATTR = `${ATTR_PREFIX}user`
const API_ATTR = `${ATTR_PREFIX}api`

const handleClick = (e: MouseEvent) => {
  hideApps(e)

  // @ts-expect-error
  const el = e.target.closest(
    'button[data-usermatters-project]',
  ) as HTMLButtonElement & { usermatters?: Instance }

  if (!el) return

  const project = el.getAttribute(PROJECT_ATTR)!
  const user = el.getAttribute(USER_ATTR)
  const api = el.getAttribute(API_ATTR)

  let instance = el.usermatters
  if (!instance) {
    instance = el.usermatters = create()
  }

  instance.show(el, { project, user, api })
}

document.addEventListener('click', handleClick)
