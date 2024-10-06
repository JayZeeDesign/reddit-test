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
import { ArrowUpDown, Loader2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

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

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
  
  if (error) return (
    <div className="text-red-500 bg-red-100 border border-red-400 rounded-md p-4 my-4">
      {error}
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-700">
            <TableHead className="text-left font-semibold text-gray-200">Title</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => sortPosts('score')}
                className={cn(
                  "text-gray-200 hover:text-white",
                  sortField === 'score' && "underline"
                )}
              >
                Score <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-left font-semibold text-gray-200">Content</TableHead>
            <TableHead className="text-left font-semibold text-gray-200">URL</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => sortPosts('num_comments')}
                className={cn(
                  "text-gray-200 hover:text-white",
                  sortField === 'num_comments' && "underline"
                )}
              >
                Comments <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-left font-semibold text-gray-200">Created (UTC)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post, index) => (
            <TableRow 
              key={post.url}
              className={cn(
                "hover:bg-gray-700 transition-colors",
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
              )}
            >
              <TableCell className="font-medium text-white">{post.title}</TableCell>
              <TableCell className="text-center">
                <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-sm">
                  {post.score}
                </span>
              </TableCell>
              <TableCell className="text-gray-300">{post.selftext.substring(0, 100)}...</TableCell>
              <TableCell>
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  Link <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </TableCell>
              <TableCell className="text-center">
                <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-sm">
                  {post.num_comments}
                </span>
              </TableCell>
              <TableCell className="text-gray-300">{new Date(post.created_utc * 1000).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}