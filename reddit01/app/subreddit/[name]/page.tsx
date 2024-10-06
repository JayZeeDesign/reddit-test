import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsTable } from "@/components/PostsTable"

export default function SubredditPage({ params }: { params: { name: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">r/{params.name}</h1>
      <Tabs defaultValue="top-posts">
        <TabsList>
          <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>
        <TabsContent value="top-posts">
          <PostsTable subredditName={params.name} />
        </TabsContent>
        <TabsContent value="themes">
          <p>Themes analysis will be implemented here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}