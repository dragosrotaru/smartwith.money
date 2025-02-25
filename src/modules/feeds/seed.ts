import { db } from '@/lib/db'
import { feedSources, type NewFeedSource } from './model'

export async function seedFeeds() {
  console.log('🌱 Seeding feed sources...')

  const sources: NewFeedSource[] = [
    // old not used
    {
      name: 'CRA businesses tax information newsletter',
      url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/bsnsss-eng.xml',
      category: 'finance',
      province: null,
    },
    // old not used
    {
      name: 'CRA individuals tax information newsletter',
      url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/t1gtrdy-eng.xml',
      category: 'finance',
      province: null,
    },
    {
      name: 'CRA charities and giving newsletter',
      url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/chrts-eng.xml',
      category: 'finance',
      province: null,
    },
    {
      name: 'CRA newsroom',
      url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/mdrm-eng.xml',
      category: 'finance',
      province: null,
    },
    {
      name: 'CRA News Centre',
      url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=revenueagency&sort=publishedDate&orderBy=desc&publishedDate%3E=2021-07-23&pick=50&format=atom&atomtitle=Canada%20Revenue%20Agency',
      category: 'finance',
      province: null,
    },
    {
      name: 'excise and hst/gst news',
      url: 'https://www.canada.ca/content/dam/cra-arc/migration/cra-arc/esrvc-srvce/rss/xcsgsthst-eng.xml',
      category: 'finance',
      province: null,
    },
    {
      name: 'Bank of Canada Feed',
      url: 'https://www.bankofcanada.ca/feed/',
      category: 'finance',
      province: null,
    },
    {
      name: 'government of Canada Feed',
      url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentfinance&type=newsreleases&sort=publishedDate&orderBy=desc&publishedDate%3E=2020-08-09&pick=100&format=atom&atomtitle=Canada%20News%20Centre%20-%20Department%20of%20Finance%20Canada%20-%20News%20Releases',
      category: 'finance',
      province: null,
    },
    {
      name: 'cidc',
      url: 'https://www.cdic.ca/cdic-news/feed/',
      category: 'finance',
      province: null,
    },
  ]

  await db.insert(feedSources).values(sources)

  console.log('✅ Feed sources seeded successfully!')
}
