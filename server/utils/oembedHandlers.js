// server/utils/oembedHandlers.js
import fetch from "node-fetch";

/**
 * oEmbed providers: YouTube, Instagram (basic)
 * Each function returns { title, author_name, thumbnail_url, html }
 */

export async function youtubeOEmbed(url) {
  try {
    const api = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(api);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      title: json.title,
      author: json.author_name,
      thumbnail: json.thumbnail_url,
      html: json.html
    };
  } catch (e) { return null; }
}

export async function instagramOEmbed(url) {
  try {
    const api = `https://graph.facebook.com/v8.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`;
    const res = await fetch(api);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      title: json.title || null,
      author: json.author_name || null,
      thumbnail: json.thumbnail_url || null,
      html: json.html || null
    };
  } catch (e) { return null; }
}
