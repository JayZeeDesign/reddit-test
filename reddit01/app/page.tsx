import { SubredditList } from '@/components/SubredditList'
import { BookOpen, Rocket, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Reddit Analytics Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover insights and trends across your favorite subreddits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-blue-500" />}
            title="Top Posts"
            description="View the most popular content from the last 24 hours"
          />
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-green-500" />}
            title="Theme Analysis"
            description="Categorize posts based on specific themes and topics"
          />
          <FeatureCard
            icon={<Rocket className="h-8 w-8 text-purple-500" />}
            title="Add Subreddits"
            description="Easily add and track new subreddits of interest"
          />
        </div>

        <SubredditList />
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform hover:scale-105">
      <div className="flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}