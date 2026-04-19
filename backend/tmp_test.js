const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.use(express.json());

// Custom middleware
app.use((req, res, next) => {
  const q = req.query;
  mongoSanitize.sanitize(q);
  console.log("Sanitized q:", q);
  console.log("req.query:", req.query);
  next();
});

app.get('/', (req, res) => {
    res.json({ ok: true, query: req.query });
});

app.use((err, req, res, next) => {
    console.error("Express Error:", err.message);
    res.status(500).send(err.message);
});

app.listen(9090, async () => {
    console.log("Server listening");
    try {
        const res = await fetch('http://localhost:9090/?$abc=1');
        const data = await res.text();
        console.log("Response:", data);
    } catch(err) {
        console.error("Client Error", err);
    }
    process.exit();
});
