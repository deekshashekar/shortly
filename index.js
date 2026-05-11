import express from "express";
const app = express();

app.use(express.json());

const store = new Map();

const generateUrl = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

app.post("/links", (req, res) => {
  const url = req.body.url;
  const code = generateUrl();
  store.set(code, url);
  res.json({ code });
});

app.get("/:code", (req, res) => {
  const url = store.get(req.params.code);
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
