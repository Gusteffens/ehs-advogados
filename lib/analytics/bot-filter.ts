const BOT_UA_PATTERN = new RegExp(
  [
    "bot",
    "crawl",
    "spider",
    "slurp",
    "mediapartners",
    "bingpreview",
    "facebookexternalhit",
    "facebot",
    "telegrambot",
    "twitterbot",
    "linkedinbot",
    "slackbot",
    "discordbot",
    "pinterest",
    "applebot",
    "duckduckbot",
    "baiduspider",
    "yandex",
    "sogou",
    "exabot",
    "ia_archiver",
    "semrush",
    "ahrefs",
    "mj12bot",
    "dotbot",
    "petalbot",
    "bytespider",
    "gptbot",
    "claudebot",
    "anthropic-ai",
    "ccbot",
    "oai-searchbot",
    "perplexitybot",
    "amazonbot",
    "googleother",
    "google-inspectiontool",
    "adsbot-google",
    "lighthouse",
    "pagespeed",
    "gtmetrix",
    "pingdom",
    "uptimerobot",
    "statuscake",
    "headlesschrome",
    "phantomjs",
    "puppeteer",
    "playwright",
    "selenium",
    "webdriver",
    "cypress",
    "curl\\/",
    "wget\\/",
    "python-requests",
    "python-urllib",
    "httpx",
    "aiohttp",
    "axios\\/",
    "node-fetch",
    "undici",
    "go-http-client",
    "java\\/",
    "okhttp",
    "libwww-perl",
    "scrapy",
    "postmanruntime",
    "insomnia",
    "^whatsapp\\/",
    "^mozilla\\/5\\.0$",
  ].join("|"),
  "i"
);

const PREFETCH_VALUE_PATTERN = /prefetch|preview|prerender/i;

/**
 * Returns true if the User-Agent is missing, trivially short, or matches known bots,
 * crawlers, link-previewers, monitoring probes, or headless automation browsers.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) {
    return true;
  }

  const trimmed = userAgent.trim();
  if (trimmed.length < 8) {
    return true;
  }

  return BOT_UA_PATTERN.test(trimmed);
}

/**
 * Returns true if request headers indicate a browser prefetch, prerender, or link preview.
 */
export function isPrefetchRequest(headers: Headers): boolean {
  const nextPrefetch = headers.get("next-router-prefetch");
  if (nextPrefetch && nextPrefetch !== "0" && nextPrefetch !== "false") {
    return true;
  }

  const candidateHeaders = [
    "sec-purpose",
    "purpose",
    "x-purpose",
    "x-moz",
  ] as const;

  for (const name of candidateHeaders) {
    const value = headers.get(name);
    if (value && PREFETCH_VALUE_PATTERN.test(value)) {
      return true;
    }
  }

  return false;
}
