import { Card, CardHeader, CardTitle, CardContent } from './ui/card'

interface Theme {
  name: string
  key: string
  description: string
  posts: any[]
}

interface CategoryCardsProps {
  themes: Theme[]
  onSelectTheme: (theme: Theme) => void
}

export function CategoryCards({ themes, onSelectTheme }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {themes.map((theme) => (
        <Card 
          key={theme.key} 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => onSelectTheme(theme)}
        >
          <CardHeader>
            <CardTitle>{theme.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{theme.description}</p>
            <p className="mt-2 font-bold">Posts: {theme.posts.length}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}