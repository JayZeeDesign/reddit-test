import { NextResponse } from 'next/server'
import Snoowrap from 'snoowrap'
import OpenAI from "openai"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"

const r = new Snoowrap({
  userAgent: 'MyApp/1.0.0',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SubredditCategorization = z.object({
  solution_request: z.boolean().describe("True when people are asking for tools & solutions"),
  pain_anger: z.boolean().describe("True when people are expressing pain points & frustrations"),
  advice_request: z.boolean().describe("True when people are asking for advice & resources"),
  money_talk: z.boolean().describe("True when people are talking about spending money"),
})

async function categorizePost(postContent: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { 
        role: "system", 
        content: "You are an expert at analyzing subreddit posts. Categorize the given post content based on the defined criteria." 
      },
      { role: "user", content: postContent },
    ],
    response_format: zodResponseFormat(SubredditCategorization, "subreddit_categorization"),
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subredditName = searchParams.get('subreddit')

  console.log('Received request for subreddit:', subredditName)

  if (!subredditName) {
    console.error('Subreddit name is missing')
    return NextResponse.json({ error: 'Subreddit name is required' }, { status: 400 })
  }

  try {
    const subreddit = r.getSubreddit(subredditName)
    const posts = await subreddit.getTop({time: 'day', limit: 100})
    console.log(`Fetched ${posts.length} posts from Reddit`)

    const categorizedPosts = await Promise.all(posts.map(async (post: any) => {
      const categories = await categorizePost(`${post.title}\n${post.selftext}`)
      return {
        title: post.title,
        url: post.url,
        selftext: post.selftext,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        categories,
      }
    }))

    console.log(`Categorized ${categorizedPosts.length} posts`)

    const themes = [
      { name: "Solution Requests", key: "solution_request", description: "Posts where users are seeking solutions for problems" },
      { name: "Pain & Anger", key: "pain_anger", description: "Posts where users are expressing pain or frustration" },
      { name: "Advice Requests", key: "advice_request", description: "Posts where users are seeking advice" },
      { name: "Money Talk", key: "money_talk", description: "Posts where users are discussing spending money" },
    ]

    const themesWithPosts = themes.map(theme => ({
      ...theme,
      posts: categorizedPosts.filter(post => post.categories[theme.key] === true)
    }))

    console.log('Sending response with themes:', JSON.stringify(themesWithPosts, null, 2))
    return NextResponse.json(themesWithPosts)
  } catch (error) {
    console.error('Error fetching and categorizing Reddit posts:', error)
    return NextResponse.json({ error: 'Failed to fetch and categorize posts' }, { status: 500 })
  }
}