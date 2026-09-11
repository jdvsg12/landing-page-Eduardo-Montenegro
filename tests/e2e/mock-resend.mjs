// Servidor falso de la API de Resend: guarda los correos y puede simular fallos.
import http from "node:http"

const port = Number(process.env.RESEND_MOCK_PORT || 3199)
let emails = []
let failNext = false

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(body))
}

http
  .createServer((req, res) => {
    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", () => {
      if (req.url === "/__health") return send(res, 200, { ok: true })
      if (req.url === "/__emails" && req.method === "GET") return send(res, 200, emails)
      if (req.url === "/__reset" && req.method === "POST") {
        emails = []
        failNext = false
        return send(res, 200, { ok: true })
      }
      if (req.url === "/__fail" && req.method === "POST") {
        failNext = true
        return send(res, 200, { ok: true })
      }
      if (req.url === "/emails" && req.method === "POST") {
        if (failNext) {
          return send(res, 500, { name: "application_error", statusCode: 500, message: "Simulated Resend outage" })
        }
        const body = JSON.parse(raw || "{}")
        emails.push({ ...body, authorization: req.headers.authorization })
        return send(res, 200, { id: `mock-${emails.length}` })
      }
      send(res, 404, { error: "not found" })
    })
  })
  .listen(port, "127.0.0.1", () => console.log(`mock resend on ${port}`))
