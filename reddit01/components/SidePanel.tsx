import { ScrollArea } from './ui/scroll-area'

interface Theme {
  name: string
  key: string
  description: string
  posts: any[]
}

interface SidePanelProps {
  theme: Theme | null
}

export function SidePanel({ theme }: SidePanelProps) {
  if (!theme) {
    return <div className="p-4">Select a theme to view posts</div>
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4">{theme.name}</h3>
      <ScrollArea className="h-[600px]">
        {theme.posts.map((post) => (
          <div key={post.url} className="mb-4 p-2 border-b">
            <h4 className="font-semibold">{post.title}</h4>
            <p className="text-sm text-gray-600">{post.selftext.substring(0, 100)}...</p>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Read more
            </a>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}