'use client'

import { useState } from 'react'
import { SubredditCard } from './SubredditCard'
import { AddSubredditModal } from './AddSubredditModal'
import { Button } from './ui/button'
import { Plus, Compass } from 'lucide-react'

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
    <div className="space-y-8 bg-gray-900 p-6 rounded-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-extrabold text-white flex items-center">
          <Compass className="mr-2 h-8 w-8 text-blue-400" />
          Explore Subreddits
        </h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Subreddit
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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