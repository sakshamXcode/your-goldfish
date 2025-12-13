// server/utils/ogParser.js
/**
 * Lightweight OG extractor (regex-based)
 * Returns { title, description, image, site, url }
 */
export function extractOG(html = '', url = '') {
  const meta = (name) => {
    const re = new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:|twitter:)?${name}["'][^>]*content=["']([^"']+)["']`, 'i');
    const m = html.match(re);
    return m ? m[1] : null;
  };

  const title = meta('title') || (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [null, null])[1] || null;
  const description = meta('description') || null;
  const image = meta('image') || null;
  const site = meta('site_name') || null;

  return { title, description, image, site, url };
}
