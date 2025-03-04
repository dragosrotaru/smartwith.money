import { db } from '@/lib/db'
import { blogAuthors, blogCategories, blogPosts, blogTags, blogPostTags } from './model'

export async function seedBlog() {
  console.log('🌱 Seeding blog data...')

  // Create categories
  const [realEstate, personalFinance] = await db
    .insert(blogCategories)
    .values([
      {
        name: 'Real Estate',
        slug: 'real-estate',
        description: 'Tips and analysis of the Canadian housing market',
      },
      {
        name: 'Personal Finance',
        slug: 'personal-finance',
        description: 'Budgeting, saving, and financial planning advice',
      },
      {
        name: 'Investing',
        slug: 'investing',
        description: 'Investment strategies and market analysis',
      },
    ])
    .returning()

  // Create author
  const [author] = await db
    .insert(blogAuthors)
    .values({
      name: 'AI',
      email: 'ai@example.com',
      bio: 'AI generated content',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    })
    .returning()

  // Create tags
  const tags = await db
    .insert(blogTags)
    .values([
      { name: 'Housing Market', slug: 'housing-market' },
      { name: 'First Time Buyer', slug: 'first-time-buyer' },
      { name: 'Investment', slug: 'investment' },
      { name: 'Market Analysis', slug: 'market-analysis' },
      { name: 'Mortgage', slug: 'mortgage' },
      { name: 'TFSA', slug: 'tfsa' },
      { name: 'RRSP', slug: 'rrsp' },
      { name: 'Budgeting', slug: 'budgeting' },
    ])
    .returning()

  const tagMap = tags.reduce((acc, tag) => ({ ...acc, [tag.slug]: tag }), {} as Record<string, (typeof tags)[0]>)

  // Create posts
  const posts = await db
    .insert(blogPosts)
    .values([
      {
        title: 'Understanding the 2024 Canadian Housing Market',
        slug: 'understanding-2024-canadian-housing-market',
        excerpt:
          'A comprehensive analysis of current trends, challenges, and opportunities in the Canadian real estate market.',
        content: `
# Understanding the 2024 Canadian Housing Market

The Canadian housing market continues to evolve in 2024, presenting both challenges and opportunities for potential homebuyers and investors. Let's dive into the key factors shaping the market this year.

## Current Market Conditions

The housing market in 2024 is characterized by several important trends:

- Interest rates stabilizing after previous increases
- Regional variations in housing prices
- Growing demand in suburban areas
- Increased focus on sustainable housing

## Key Considerations for Buyers

When entering the market in 2024, consider:

1. **Location Strategy**
   - Urban vs. suburban trade-offs
   - Proximity to amenities and transit
   - Future development plans

2. **Financial Planning**
   - Down payment requirements
   - Mortgage stress test implications
   - Monthly carrying costs

3. **Market Timing**
   - Seasonal variations
   - Regional market cycles
   - Economic indicators

## Investment Opportunities

Despite challenges, several investment opportunities exist:

- Multi-family properties in growing communities
- Renovation projects in established neighborhoods
- Income properties near universities and colleges

## Looking Ahead

The remainder of 2024 is expected to bring:

- Continued focus on housing affordability
- New government policies and initiatives
- Evolution of remote work impact on housing preferences

Remember to consult with financial and real estate professionals before making any major decisions in today's market.
        `,
        status: 'published',
        categoryId: realEstate.id,
        authorId: author.id,
        publishedAt: new Date('2024-02-25'),
      },
      {
        title: 'Maximizing Your TFSA: A Complete Guide',
        slug: 'maximizing-tfsa-complete-guide',
        excerpt: 'Everything you need to know about Tax-Free Savings Accounts and how to optimize your returns.',
        content: `
# Maximizing Your TFSA: A Complete Guide

Tax-Free Savings Accounts (TFSAs) are powerful tools for building wealth in Canada. This guide will help you understand how to make the most of your TFSA.

## Understanding TFSA Basics

TFSAs offer unique advantages:

- Tax-free investment growth
- Flexible withdrawal options
- No age restrictions
- Contribution room carries forward

## Investment Strategies

Optimize your TFSA with these strategies:

1. **Long-term Growth**
   - Dividend-paying stocks
   - Index ETFs
   - Growth stocks

2. **Income Generation**
   - REITs
   - Preferred shares
   - Corporate bonds

3. **Risk Management**
   - Diversification
   - Regular rebalancing
   - Investment timeline alignment

## Common Mistakes to Avoid

Be careful to avoid these pitfalls:

- Over-contributing
- Frequent trading
- Holding US dividend stocks
- Inappropriate investment choices

## Advanced TFSA Techniques

Consider these advanced strategies:

- Asset location optimization
- Contribution timing
- Strategic withdrawals
- Beneficiary designation

## Planning for the Future

Make your TFSA work harder by:

- Setting clear financial goals
- Regular contribution scheduling
- Annual strategy review
- Integration with other accounts (RRSP, non-registered)

Remember to consult with a financial advisor to create a strategy that aligns with your goals.
        `,
        status: 'published',
        categoryId: personalFinance.id,
        authorId: author.id,
        publishedAt: new Date('2024-02-15'),
      },
      {
        title: 'Smart Investment Strategies for First-Time Home Buyers',
        slug: 'investment-strategies-first-time-buyers',
        excerpt:
          'Learn how to make informed decisions and build long-term wealth through strategic property investments.',
        content: `
# Smart Investment Strategies for First-Time Home Buyers

Making your first property investment is a significant milestone. Here's how to approach it strategically and build long-term wealth.

## Preparation Essentials

Before making your first purchase:

1. **Financial Readiness**
   - Credit score optimization
   - Down payment savings
   - Emergency fund establishment

2. **Market Research**
   - Neighborhood analysis
   - Price trends
   - Future development plans

## Investment Approaches

Consider these investment strategies:

### House Hacking
- Renting out rooms
- Basement suites
- Duplex living

### Value-Add Opportunities
- Minor renovations
- Property improvements
- Energy efficiency upgrades

### Location Strategy
- Up-and-coming neighborhoods
- Transit-oriented development
- Employment hubs

## Financial Considerations

Important financial aspects:

- Mortgage options
- Tax implications
- Insurance requirements
- Maintenance costs

## Long-term Planning

Think about:

- Future property appreciation
- Rental income potential
- Exit strategies
- Portfolio expansion

Remember that your first property is often a stepping stone to building a larger real estate portfolio.
        `,
        status: 'published',
        categoryId: realEstate.id,
        authorId: author.id,
        publishedAt: new Date('2024-02-20'),
      },
    ])
    .returning()

  // Create post-tag relationships
  await db.insert(blogPostTags).values([
    // Housing Market Analysis post tags
    { postId: posts[0].id, tagId: tagMap['housing-market'].id },
    { postId: posts[0].id, tagId: tagMap['market-analysis'].id },
    { postId: posts[0].id, tagId: tagMap['investment'].id },

    // TFSA Guide post tags
    { postId: posts[1].id, tagId: tagMap['tfsa'].id },
    { postId: posts[1].id, tagId: tagMap['investment'].id },

    // First-Time Buyers post tags
    { postId: posts[2].id, tagId: tagMap['first-time-buyer'].id },
    { postId: posts[2].id, tagId: tagMap['mortgage'].id },
    { postId: posts[2].id, tagId: tagMap['investment'].id },
  ])

  console.log('✅ Blog data seeded successfully!')
}
