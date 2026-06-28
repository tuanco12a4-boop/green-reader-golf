"use strict";

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || [
  "https://tuanco12a4-boop.github.io",
  "http://localhost:4174",
  "http://127.0.0.1:4174",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
].join(",")).split(",").map((value) => value.trim()).filter(Boolean);

exports.geometryAi = onRequest({
  region: "asia-southeast1",
  cors: false,
  secrets: [geminiApiKey],
  timeoutSeconds: 120,
  memory: "512MiB"
}, async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const user = await verifyFirebaseUser(req);
    enforceAllowedEmail(user.email);

    const { system, user: userPrompt, schema, maxOutputTokens } = req.body || {};
    if (!system || !userPrompt || !schema?.schema) {
      res.status(400).json({ error: "Missing AI request payload." });
      return;
    }

    const text = await callGemini({
      system,
      userPrompt,
      schema: schema.schema,
      maxOutputTokens: Number(maxOutputTokens) || 3000
    });
    res.json({ text });
  } catch (error) {
    const status = error.status || 500;
    console.error(error);
    res.status(status).json({ error: error.message || "AI backend error." });
  }
});

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Max-Age", "3600");
}

async function verifyFirebaseUser(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    const error = new Error("Bạn cần đăng nhập để dùng AI thật.");
    error.status = 401;
    throw error;
  }
  try {
    return await admin.auth().verifyIdToken(match[1]);
  } catch {
    const error = new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
    error.status = 401;
    throw error;
  }
}

function enforceAllowedEmail(email) {
  const raw = process.env.ALLOWED_EMAILS || "";
  const allowed = raw.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) return;
  if (!email || !allowed.includes(email.toLowerCase())) {
    const error = new Error("Email này chưa được cấp quyền dùng AI.");
    error.status = 403;
    throw error;
  }
}

async function callGemini({ system, userPrompt, schema, maxOutputTokens }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${geminiApiKey.value()}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: Math.max(512, Math.min(maxOutputTokens, 8192)),
        responseMimeType: "application/json",
        responseSchema: schema
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini API returned ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const text = (payload.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  if (!text) throw new Error("Gemini không trả về nội dung.");
  return text;
}
