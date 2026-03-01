// server/api/upload.js
import { supabaseServer } from "../lib/supabase.js"; // server-side client using SERVICE_ROLE_KEY
import formidable from "formidable";
import fs from "fs";

export const config = {
  // Vercel: disable body parser, we use formidable
  api: { bodyParser: false },
};

function readFile(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { files } = await readFile(req);
    const file = files?.file || files?.image; // accept either 'file' or 'image'
    if (!file) return res.status(400).json({ ok: false, error: "missing_file" });

    // Read file data (formidable gives path)
    const buffer = fs.readFileSync(file.filepath || file.path);

    // Determine filename and folder
    const ext = (file.originalFilename || file.name || "upload").split(".").pop();
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

    // Upload to Supabase storage (bucket must exist)
    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "public-uploads";
    const { data: uploadData, error: uploadErr } = await supabaseServer.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.mimetype || "application/octet-stream", upsert: false });

    if (uploadErr) {
      console.error("supabase upload error:", uploadErr);
      return res.status(500).json({ ok: false, error: "upload_failed", detail: String(uploadErr) });
    }

    // Make public URL (if bucket is public)
    // For private bucket we'd create a signed URL (expires) using createSignedUrl
    const { publicURL } = supabaseServer.storage.from(bucket).getPublicUrl(filename);

    if (!publicURL) {
      return res.status(500).json({ ok: false, error: "no_public_url" });
    }

    return res.status(200).json({ ok: true, file: { path: filename, url: publicURL } });
  } catch (err) {
    console.error("upload exception", err);
    return res.status(500).json({ ok: false, error: "exception", detail: String(err) });
  }
}
