'use client'

import { useState, useEffect } from 'react'
import { CategoryCards } from './CategoryCards'
import { SidePanel } from './SidePanel'

interface Theme {
  name: string
  key: string
  description: string
  posts: RedditPost[]
}

interface RedditPost {
  title: string
  url: string
  selftext: string
  score: number
  num_comments: number
  created_utc: number
  categories: {
    solution_request: boolean
    pain_anger: boolean
    advice_request: boolean
    money_talk: boolean
  }
}

export function ThemesAnalysis({ subredditName }: { subredditName: string }) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const fetchThemes = async () => {
      console.log('Fetching themes for:', subredditName)
      try {
        const response = await fetch(`/api/reddit/themes?subreddit=${subredditName}`)
        if (!response.ok) {
          throw new Error('Failed to fetch themes')
        }
        const data = await response.json()
        console.log('Fetched themes:', data)
        setThemes(data)
      } catch (err) {
        console.error('Error fetching themes:', err)
        setError('Error fetching themes. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [subredditName])

  console.log('Rendering ThemesAnalysis', { isLoading, error, themes })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="flex">
      <div className="w-2/3 pr-4">
        <CategoryCards themes={themes} onSelectTheme={setSelectedTheme} />
      </div>
      <div className="w-1/3">
        <SidePanel theme={selectedTheme} />
      </div>
    </div>
  )
}