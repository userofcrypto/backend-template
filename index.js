const express = require("express");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const crypto = require("crypto");

function hashContent(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "backend-template" });
});

// Upload
app.post("/upload", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  const hash = hashContent(content);

  const { data, error } = await supabase
    .from("records")
    .insert([{ hash }])
    .select();

  if (error) return res.status(500).json({ error });

  res.json({ success: true, data: data[0] });
});

// Verify
app.post("/verify", async (req, res) => {
  const { content } = req.body;

  const hash = hashContent(content);

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("hash", hash);

  if (error) return res.status(500).json({ error });

  res.json({
    verified: data.length > 0,
    record: data[0] || null
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
