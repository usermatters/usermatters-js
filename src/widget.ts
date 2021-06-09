import { create } from './index'

const ATTR_PREFIX = `data-usermatters-`
const PROJECT_ATTR = `${ATTR_PREFIX}project`
const USER_ATTR = `${ATTR_PREFIX}user`
const API_ATTR = `${ATTR_PREFIX}api`

const instance = create()

const handleClick = (e: MouseEvent) => {
  // @ts-expect-error
  const el = e.target.closest(
    'button[data-usermatters-project]',
  ) as HTMLButtonElement

  if (!el) return

  const project = el.getAttribute(PROJECT_ATTR)!
  const user = el.getAttribute(USER_ATTR)
  const api = el.getAttribute(API_ATTR)

  instance.show(el, { project, user, api })
}

document.addEventListener('click', handleClick)
