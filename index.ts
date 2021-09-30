const requestMethod = 'get'
const requestPath = '/api/v1/1'

const routes = {
  'get::/api/v1': () => console.log('Method get no /api/v1'),
  'get::/api/v1/:id/posts/:postId': () => console.log('Metodo get no /api/v1/1/posts/2')
}

function createPathRegex(path: string) {
  if (!path.includes(':')) return path
  
  const identifiers = [...path.matchAll(/\/:([\w_\-$]+)/g)].map(match => match[1])

  const pathRegexString = identifiers.reduce((acc, value) => {
    return acc.replace(`:${value}`, `(?<${value}>[\\w_\\-$@])`)
  }, path)

  return new RegExp(pathRegexString)
}

const definedRoutes = Object.entries(routes).map(([routeName, routeHandler]) => {
  if (!routeName.endsWith('/')) {
    routeName += '/'
  }

  if (!routeName.includes('::')) {
    throw new Error('Invalid route definition')
  }
  
  const [method, path] = routeName.split('::')
  
  const pathRegex = createPathRegex(path)

  return {
    method,
    path,
    pathRegex,
    handler: routeHandler
  }
})

function findPathMatch(requestedMethod: string, requestedPath: string) {
  if (!requestedPath.endsWith('/')) {
    requestedPath += '/'
  }
  
  let params: Record<string, string> = {}

  const findedRouteRecord = definedRoutes.find(routeRecord => {
    const methodHasMatched = requestedMethod.toLowerCase() === routeRecord.method
    const match = requestedPath.match(routeRecord.pathRegex)

    if (match) {
      params = match.groups ?? {}
    }

    const pathHasMatched = (
      match?.[0] === routeRecord.path
      && match?.input === routeRecord.path
    )

    return methodHasMatched && pathHasMatched 
  })

  return {
    handler: findedRouteRecord?.handler ?? null,
    path: requestedPath,
    params
  }
}

const result = findPathMatch(requestMethod, requestPath)

console.log('result:', result)
result.handler?.()
