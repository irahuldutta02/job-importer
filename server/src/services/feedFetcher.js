const axios = require('axios');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

async function fetchFeed(feedUrl) {
  const res = await axios.get(feedUrl, { timeout: 20000 });
  const xml = res.data;
  const parsed = await parser.parseStringPromise(xml);

  let items = [];
  try {
    if (parsed.rss && parsed.rss.channel) {
      const channel = parsed.rss.channel;
      const rawItems = channel.item;
      items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);
    } else if (parsed.feed && parsed.feed.entry) {
      const rawItems = parsed.feed.entry;
      items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);
    } else {
      const anyItems = parsed.item || parsed.job || parsed.jobs;
      if (anyItems) {
        items = Array.isArray(anyItems) ? anyItems : [anyItems];
      } else {
        items = [];
      }
    }
  } catch (err) {
    items = [];
  }

  const normalized = items.map((it) => {
    const externalId = it.guid || it.id || it.link || (it.title && it.title._) || it.title || JSON.stringify(it).slice(0, 50);
    return {
      externalId: externalId && String(externalId),
      title: it.title && (typeof it.title === 'object' ? it.title._ || it.title : it.title),
      company: it['company'] || it['author'] || it['dc:creator'] || null,
      location: it['location'] || it['job_location'] || null,
      description: it.description || it.content || it.summary || null,
      url: it.link && (typeof it.link === 'object' ? (it.link.href || it.link._) : it.link),
      raw: it,
    };
  });

  return normalized;
}

module.exports = { fetchFeed };
