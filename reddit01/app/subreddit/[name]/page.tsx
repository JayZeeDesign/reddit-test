import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostsTable } from "@/components/PostsTable"
import { ThemesAnalysis } from "@/components/ThemesAnalysis"
import { ArrowLeft, BarChart2, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function SubredditPage({ params }: { params: { name: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Subreddits
        </Link>
        <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          r/{params.name}
        </h1>
        <Tabs defaultValue="top-posts" className="space-y-8">
          <TabsList className="bg-gray-800 p-1 rounded-lg inline-flex">
            <TabsTrigger 
              value="top-posts" 
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <MessageSquare className="inline-block mr-2 h-4 w-4" />
              Top Posts
            </TabsTrigger>
            <TabsTrigger 
              value="themes" 
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BarChart2 className="inline-block mr-2 h-4 w-4" />
              Themes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts" className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <PostsTable subredditName={params.name} />
          </TabsContent>
          <TabsContent value="themes" className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <ThemesAnalysis subredditName={params.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}