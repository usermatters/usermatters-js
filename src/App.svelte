<svelte:options tag={null} />

<script>
  // can't use lang="ts" because the imports get removed somehow by the compiler
  import { onMount } from 'svelte'
  import { emojiMap } from './utils'

  export let user = ''

  export let project = ''

  export let api = 'https://usermatters.co/api/graphql'

  export let open = false

  /** @type {HTMLElement|undefined} */
  export let buttonEl = undefined

  /** @type {any[]} */
  const clsx = (...args) => {
    return args.filter(Boolean).join(' ')
  }

  /** @type {HTMLDivElement|null} */
  let appRef = null
  let content = ''
  let error = ''
  /** @type {null | 'loading' | 'success' | 'error'} */
  let status = null
  let userName = ''
  let userEmail = ''
  let reaction = ''

  $: isSubmitting = status === 'loading'

  /** @type {HTMLTextAreaElement | undefined} */
  let textarea

  export const focusInput = () => {
    textarea && textarea.focus()
  }

  const hide = () => {
    open = false
    status = null
  }

  const reset = () => {
    content = ''
    userEmail = ''
    userName = ''
    reaction = ''
  }

  /** @type {string} */
  const getUser = (user) => {
    user = user.trim()
    if (!user) return { email: userEmail, name: userName }

    const index = user.lastIndexOf(' ')
    const email = user.slice(index + 1).trim()
    const name = user.slice(0, index).trim()
    return { email, name }
  }

  /** @type {any} */
  const handleSubmit = async (e) => {
    e.preventDefault()

    status = 'loading'

    const parsedUser = getUser(user)

    const res = await fetch(api, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation createFeedback($userEmail:String!,$userName:String,$content:String!,$project:String!,$reaction:String!){createFeedback(reaction:$reaction,userEmail:$userEmail,userName:$userName,content:$content,project:$project) {id}}`,
        variables: {
          content,
          project,
          userEmail: parsedUser.email,
          userName: parsedUser.name,
          reaction,
        },
      }),
    })

    if (!res.ok) {
      status = 'error'
      error = `network error: ${res.status}`
      return
    }

    const json = await res.json()
    if (json.error) {
      status = 'error'
      // TODO: specify error
      error = `request error`
      return
    }

    status = 'success'
    reset()

    setTimeout(() => {
      status = null
    }, 3000)
  }

  // Hide when clicked outside
  onMount(() => {
    const handleClick = (e) => {
      if (buttonEl && buttonEl.contains(e.target)) return
      if (appRef && !appRef.contains(e.target)) {
        hide()
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  })

</script>

{#if open}
  <div bind:this={appRef} class="app font-sans w-full bg-white rounded-lg">
    <header class="flex items-start justify-between px-4 pt-4">
      {#if status === 'success'}<span />{:else}<div>
          <h2 class="text-xl font-bold">Send feedback</h2>
          <div class="text-xs text-gray-400">
            Widget by <a
              href="https://usermatters.co"
              target="_blank"
              class="text-gray-400 font-medium">User Matters</a
            >
          </div>
        </div>{/if}
      <button
        class="text-gray-500 w-7 h-7 rounded-lg inline-flex items-center justify-center hover:text-black hover:bg-gray-100"
        on:click={hide}
        ><svg
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          /></svg
        ></button
      >
    </header>
    {#if status === 'success'}
      <div class="text-center pb-6">
        <div class="-mt-5">
          <svg
            id="successAnimation"
            class="mx-auto text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            width="70"
            height="70"
            viewBox="0 0 70 70"
          >
            <path
              id="successAnimationResult"
              fill="currentColor"
              d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z"
            />
            <circle
              id="successAnimationCircle"
              cx="35"
              cy="35"
              r="24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              fill="transparent"
            />
            <polyline
              id="successAnimationCheck"
              stroke="currentColor"
              stroke-width="2"
              points="23 34 34 43 47 27"
              fill="transparent"
            />
          </svg>
        </div>
        <div>Thanks for your feedback!</div>
      </div>
    {:else}
      <form on:submit={handleSubmit}>
        <div class="p-4">
          {#if !user}
            <div class="flex space-x-3 mb-3">
              <input
                class="input"
                type="name"
                placeholder="Name (optional)"
                bind:value={userName}
              />
              <input
                class="input"
                type="email"
                placeholder="Email"
                required
                bind:value={userEmail}
              />
            </div>{/if}
          <textarea
            rows="3"
            required
            bind:this={textarea}
            bind:value={content}
            class="input"
            placeholder="Your feedback.."
          />
          {#if error}<div class="text-red-500 text-sm mt-1">{error}</div>{/if}
        </div>
        <div class="p-4 pt-0 flex items-center justify-between">
          <div class="flex space-x-2">
            {#each Object.keys(emojiMap) as type (type)}
              <button
                type="button"
                title="Choose a reaction"
                class={clsx(
                  `transform transition-transform duration-150 text-xl hover:scale-150 focus:outline-none`,
                  reaction && reaction !== type && 'opacity-50',
                  reaction === type && 'scale-125',
                )}
                on:click={() => (reaction = type)}>{emojiMap[type]}</button
              >
            {/each}
          </div>
          <button
            type="submit"
            class="button border border-transparent bg-blue-600 text-white focus:border-blue-700"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            {:else}
              Send
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
{/if}

<style>
  @tailwind base;
  @tailwind utilities;

  .button {
    @apply focus:outline-none;
    @apply rounded-md px-3 inline-flex h-8 items-center text-sm;
    @apply focus:ring-3;
  }

  .app {
    box-shadow: 0 18px 50px -10px rgb(0 0 0 / 20%);
    width: 340px;
  }

  .input {
    @apply resize-none w-full p-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:border-blue-500;
  }

  @keyframes scaleAnimation {
    0% {
      opacity: 0;
      transform: scale(1.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes drawCircle {
    0% {
      stroke-dashoffset: 151px;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes drawCheck {
    0% {
      stroke-dashoffset: 36px;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  #successAnimationCircle {
    stroke-dasharray: 151px 151px;
  }

  #successAnimationCheck {
    stroke-dasharray: 36px 36px;
  }

  #successAnimationResult {
    opacity: 0;
  }

  #successAnimation {
    animation: 1s ease-out 0s 1 both scaleAnimation;
  }
  #successAnimationCircle {
    animation: 1s cubic-bezier(0.77, 0, 0.175, 1) 0s 1 both drawCircle,
      0.3s linear 0.9s 1 both fadeOut;
  }
  #successAnimationCheck {
    animation: 1s cubic-bezier(0.77, 0, 0.175, 1) 0s 1 both drawCheck,
      0.3s linear 0.9s 1 both fadeOut;
  }
  #successAnimationResult {
    animation: 0.3s linear 0.9s both fadeIn;
  }

</style>
