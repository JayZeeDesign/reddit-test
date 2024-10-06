'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface RedditPost {
  title: string;
  url: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

export function PostsTable({ subredditName }: { subredditName: string }) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof RedditPost>('score')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/reddit/posts?subreddit=${subredditName}`)
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError('Error fetching posts. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [subredditName])

  const sortPosts = (field: keyof RedditPost) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }

    const sortedPosts = [...posts].sort((a, b) => {
      if (a[field] < b[field]) return sortDirection === 'asc' ? -1 : 1
      if (a[field] > b[field]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setPosts(sortedPosts)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => sortPosts('score')}>
              Score <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Content</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => sortPosts('num_comments')}>
              Comments <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Created (UTC)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.url}>
            <TableCell>{post.title}</TableCell>
            <TableCell>{post.score}</TableCell>
            <TableCell>{post.selftext.substring(0, 100)}...</TableCell>
            <TableCell>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Link
              </a>
            </TableCell>
            <TableCell>{post.num_comments}</TableCell>
            <TableCell>{new Date(post.created_utc * 1000).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}