const next = require("next");
const { createServer } = require("http");

const app = next({ dev: false });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handler(req, res);
  }).listen(3000, () => {
    console.log("Next.js server running on http://localhost:3000");
  });
});
