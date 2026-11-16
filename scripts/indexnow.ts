// Tells Bing (and through it ChatGPT search, Copilot, Yandex…) about new or changed pages right away
// instead of waiting for a crawl. Google does not use IndexNow — keep requesting indexing in Search Console.
//
//   npx tsx scripts/indexnow.ts /guides/twerk-vs-heels-dance-which-class /classes/twerk   # specific pages
//   npx tsx scripts/indexnow.ts --recent 8                                  # sitemap pages changed in the last 8 days
//   npx tsx scripts/indexnow.ts --all                                       # every page in the sitemap
//
// The key is public by design: Bing checks it at https://bounce-lab.com/<key>.txt
const HOST = 'bounce-lab.com'
const KEY = '29666887a0420f6979e5c259525bbdf9'

async function sitemapUrls(recentDays?: number): Promise<string[]> {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
  const cutoff = recentDays ? Date.now() - recentDays * 86_400_000 : 0
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)]
    .filter(([, , lastmod]) => !cutoff || (lastmod && Date.parse(lastmod) >= cutoff))
    .map(([, loc]) => loc)
}

async function main() {
  const args = process.argv.slice(2)
  const recentAt = args.indexOf('--recent')
  const recentDays = recentAt >= 0 ? Number(args[recentAt + 1]) || 7 : undefined
  // Explicit pages can be combined with --recent / --all
  const paths = args.filter((a, i) => !a.startsWith('--') && !(recentAt >= 0 && i === recentAt + 1))
  const fromSitemap = args.includes('--all') ? await sitemapUrls() : recentDays ? await sitemapUrls(recentDays) : []
  const explicit = paths.map((p) => (p.startsWith('http') ? p : `https://${HOST}${p.startsWith('/') ? p : '/' + p}`))
  const urls = [...new Set([...fromSitemap, ...explicit])]

  if (urls.length === 0) {
    console.log('IndexNow: nothing to submit')
    return
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
  })
  // 200 = accepted, 202 = accepted, key check pending
  console.log(`IndexNow: ${res.status} for ${urls.length} URL(s)`)
  if (res.status >= 300) {
    console.error(await res.text())
    process.exit(1)
  }
}

main()
