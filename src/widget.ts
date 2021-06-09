import { create, Instance } from './index'

const ATTR_PREFIX = `data-usermatters-`
const PROJECT_ATTR = `${ATTR_PREFIX}project`
const USER_ATTR = `${ATTR_PREFIX}user`
const API_ATTR = `${ATTR_PREFIX}api`

const handleClick = (e: MouseEvent) => {
  // @ts-expect-error
  const el = e.target.closest(
    'button[data-usermatters-project]',
  ) as HTMLButtonElement

  if (!el) return

  const project = el.getAttribute(PROJECT_ATTR)!
  const user = el.getAttribute(USER_ATTR)
  const api = el.getAttribute(API_ATTR)

  // @ts-expect-error
  let instance: Instance = el.usermatters
  if (!instance) {
    instance = create(el)
    // @ts-expect-error
    el.usermatters = instance
  }
  instance.show({ project, user, api })
}

document.addEventListener('click', handleClick)
