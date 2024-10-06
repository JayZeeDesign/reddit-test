import { SubredditList } from '@/components/SubredditList'

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Reddit Analytics Platform</h1>
      <SubredditList />
    </main>
  )
}
