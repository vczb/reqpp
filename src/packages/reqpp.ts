type Headers = {
  'Contet-Type': 'application/json' | 'application/x-www-form-urlencoded'
}

type FetchArgs = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATH'
  mode?: 'no-cors' | 'cors' | 'same-origin'
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached'
  credentials?: 'include' | 'same-origin' | 'omit'
  headers?: Headers
  redirect?: 'manual' | 'follow' | 'error'
  referrerPolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
  body?: string
  signal?: AbortSignal
}

type Fetch = {
  url: string
  args?: FetchArgs
}

type Config = {
  retries?: number
}

const reqpp = () => {
  const controller = new AbortController()

  const { signal } = controller

  function abort() {
    controller.abort()
  }

  async function fetcher(fetchArgs: Fetch, config?: Config) {
    const { url } = fetchArgs
    const retry = config?.retries || 0

    const data: unknown = await fetch(url, { signal, ...fetchArgs.args })
      .then((res) => {
        if (res.ok) {
          return res.json()
        }

        throw new Error(res.statusText)
      })
      .catch(async (error) => {
        if (retry < 1) {
          console.error(error)
          return null
        }

        return await request(fetchArgs, {
          retries: retry - 1
        })
      })

    return data
  }

  async function request(fetchArgs: Fetch, config?: Config) {
    return await fetcher(fetchArgs, config)
  }

  return {
    request,
    abort
  }
}

export default reqpp
