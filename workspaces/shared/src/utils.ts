export function createCurlCommand(url: string, init: RequestInit) {
  const method = init.method || 'GET'
  const headers = init.headers
    ? Object.entries(init.headers)
        .map(([key, value]) => `-H "${key}: ${value}"`)
        .join(' ')
    : ''
  const body = init.body ? `--data '${init.body}'` : ''
  return `curl -X ${method} ${headers} ${body} "${url}"`
}
