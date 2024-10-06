import { NextResponse } from 'next/server'
import Snoowrap from 'snoowrap'

const r = new Snoowrap({
  userAgent: 'MyApp/1.0.0',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subredditName = searchParams.get('subreddit')

  if (!subredditName) {
    return NextResponse.json({ error: 'Subreddit name is required' }, { status: 400 })
  }

  try {
    const subreddit = r.getSubreddit(subredditName)
    const currentTime = Math.floor(Date.now() / 1000)
    const oneDayAgo = currentTime - 24 * 60 * 60

    const posts = await subreddit.getTop({time: 'day', limit: 100})
    const recentPosts = posts.filter((post: any) => post.created_utc > oneDayAgo)

    const formattedPosts = recentPosts.map((post: any) => ({
      title: post.title,
      url: post.url,
      selftext: post.selftext,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: post.created_utc
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}