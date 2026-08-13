import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { isIP } from 'node:net'
import { extname, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
}

function isValidHostname(host) {
  if (host.length > 253 || /^[\d.]+$/.test(host)) return false
  const normalized = host.endsWith('.') ? host.slice(0, -1) : host
  return normalized.split('.').every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))
}

export function parseServeOptions(argv = process.argv, cwd = process.cwd()) {
  const root = resolve(cwd, argv[2] ?? '.')
  const rawPort = argv[3] ?? '5173'
  if (typeof rawPort !== 'string' || !/^\d+$/.test(rawPort)) {
    throw new TypeError(`Invalid port: ${String(rawPort)}`)
  }
  const port = Number(rawPort)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError(`Invalid port: ${rawPort}`)

  const host = argv[4] ?? '127.0.0.1'
  if (typeof host !== 'string' || host.length === 0 || host.trim() !== host || (!isIP(host) && !isValidHostname(host))) {
    throw new TypeError(`Invalid host: ${String(host)}`)
  }

  return { root, port, host }
}

export function formatBindUrl(host, port) {
  return `http://${isIP(host) === 6 ? `[${host}]` : host}:${port}`
}

export function startServer({ root, port, host } = parseServeOptions(), write = (message) => process.stdout.write(message)) {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)
    const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    let target = resolve(root, requested)
    if (target !== root && !target.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end('Forbidden')
      return
    }
    if (!existsSync(target) || !statSync(target).isFile()) target = resolve(root, 'index.html')
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(target)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    createReadStream(target).pipe(response)
  })

  server.listen(port, host, () => {
    const address = server.address()
    const boundPort = typeof address === 'object' && address ? address.port : port
    write(`Makler Prüfungswerkstatt: ${formatBindUrl(host, boundPort)}\n`)
  })
  return server
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) startServer()
