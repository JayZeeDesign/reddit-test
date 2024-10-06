import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ArrowRight, Users } from 'lucide-react'

interface SubredditCardProps {
  subreddit: {
    name: string
    url: string
  }
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  return (
    <Link href={`/subreddit/${subreddit.name}`} className="block">
      <Card className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
            r/{subreddit.name}
            <ArrowRight className="h-5 w-5 text-blue-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-gray-400">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">Explore community</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}