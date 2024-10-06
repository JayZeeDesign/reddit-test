'use client'

import { useState } from 'react'
import { SubredditCard } from './SubredditCard'
import { AddSubredditModal } from './AddSubredditModal'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

interface Subreddit {
  name: string
  url: string
}

export function SubredditList() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([
    { name: 'ollama', url: 'https://www.reddit.com/r/ollama/' },
    { name: 'openai', url: 'https://www.reddit.com/r/openai/' },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const addSubreddit = (newSubreddit: Subreddit) => {
    setSubreddits([...subreddits, newSubreddit])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Subreddits</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subreddit
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard key={subreddit.name} subreddit={subreddit} />
        ))}
      </div>
      <AddSubredditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addSubreddit}
      />
    </div>
  )
}