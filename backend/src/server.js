import 'dotenv/config'

import http from 'http'
import app from './app.js'
import { initSocket } from './sockets/messageSocket.js'

const PORT = Number(process.env.PORT) || 3000
const HOST = '0.0.0.0'

// Surface crash reasons in Railway logs so we don't silently die during boot.
process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err)
})
process.on('unhandledRejection', (err) => {
  console.error('[server] unhandledRejection:', err)
})

const server = http.createServer(app)

try {
  initSocket(server)
} catch (err) {
  // Don't let socket setup take down the whole API.
  console.error('[server] Socket init failed, continuing without realtime:', err.message)
}

server.listen(PORT, HOST, () => {
  console.log(`F.R.E.S.H backend listening on http://${HOST}:${PORT}`)
})
