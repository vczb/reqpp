const reqpp = () => {
  const controller = new AbortController()

  const { signal } = controller

  function abort() {
    controller.abort()
  }

  async function fetcher(url: string, retries = 1) {
    const data: unknown = await fetch(url, { signal })
      .then((res) => {
        if (res.ok) {
          return res.json()
        }

        throw new Error(res.statusText)
      })
      .catch(async (error) => {
        if (retries === 0) {
          console.error(error)
          return null
        }

        return await request(url, retries - 1)
      })

    return data
  }

  async function request(url: string, retries: number) {
    return await fetcher(url, retries)
  }

  return {
    request,
    abort
  }
}

export default reqpp
