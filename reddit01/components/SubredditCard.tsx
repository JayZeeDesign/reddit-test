import Link from 'next/link'
import { Card, CardHeader, CardTitle } from './ui/card'

interface SubredditCardProps {
  subreddit: {
    name: string
    url: string
  }
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${subreddit.name}`}>
      <Card className="hover:bg-accent transition-colors">
        <CardHeader>
          <CardTitle>r/{subreddit.name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  )
}