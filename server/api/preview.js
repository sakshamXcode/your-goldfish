// server/api/preview.js
import fetch from "node-fetch";

/**
 * Minimal, robust link preview endpoint.
 * GET /api/preview?url=<encoded-url>
 */
const FALLBACK = {
  title: null,
  description: null,
  image: process.env.LOGO_FALLBACK_PATH || "/mnt/data/A_logo_design_features_a_cheerful_goldfish_charact.png",
  site_name: null,
  url: null,
};

function parseMeta(html, baseUrl) {
  try {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    // simple description meta
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : null;
    const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);
    let image = imgMatch ? imgMatch[1] : null;
    if (image && image.startsWith('//')) image = `https:${image}`;
    // Attempt to normalize relative image URLs
    if (image && image.startsWith('/')) {
      try { image = new URL(image, baseUrl).toString(); } catch(e){}
    }
    return { title, description, image, site_name: null, url: baseUrl };
  } catch (e) {
    return FALLBACK;
  }
}

export default async function handler(req, res) {
  try {
    const urlParam = req.method === 'GET'
      ? (new URL(req.url, `http://${req.headers.host}`).searchParams.get('url'))
      : (req.body && req.body.url);

    if (!urlParam) {
      return res.status(200).json({ ok: true, data: FALLBACK });
    }

    const url = decodeURIComponent(urlParam);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'UsBookPreview/1.0' },
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      return res.status(200).json({ ok: true, data: { ...FALLBACK, url } });
    }
    clearTimeout(timeout);

    if (!response || !response.ok) {
      return res.status(200).json({ ok: true, data: { ...FALLBACK, url } });
    }

    const html = await response.text();
    const meta = parseMeta(html, url);
    if (!meta.image) meta.image = FALLBACK.image;
    return res.status(200).json({ ok: true, data: meta });
  } catch (err) {
    console.error("preview handler error", err);
    return res.status(500).json({ ok: false, error: "preview_failed", detail: String(err) });
  }
}
