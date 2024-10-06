# Reddit Analytics Platform - Project Requirements Document (PRD)

## Project Overview

You are building a **Reddit Analytics Platform** using **Next.js 14**, **shadcn/ui**, **Tailwind CSS**, and **Lucide Icons**. The platform allows users to:

- Get analytics of different subreddits.
- View top content from subreddits.
- Categorize posts based on specific themes.

The application leverages the **snoowrap** library to interact with Reddit's API and **OpenAI's GPT-4** model for categorizing posts.

---

## Core Functionalities

### 1. Subreddit Management

#### a. View Available Subreddits

- Users can see a list of available subreddits displayed as cards on the homepage.
- Predefined subreddits like "ollama" and "openai" are included by default.

#### b. Add New Subreddits

- Users can add new subreddits by clicking on an "Add Reddit" button.
- Clicking the button opens a modal where users can paste the Reddit URL of the subreddit they wish to add.
- After adding, a new subreddit card is added to the list.

### 2. Subreddit Page

#### a. Navigation

- Clicking on a subreddit card navigates the user to that subreddit's page.

#### b. Tabs

- The subreddit page contains two tabs:
  - **Top Posts**: Displays the top posts from the past 24 hours.
  - **Themes**: Analyzes and categorizes posts based on specific themes.

### 3. Fetch Reddit Posts Data - "Top Posts" Tab

#### a. Data Retrieval

- Under the "Top Posts" tab, the platform fetches Reddit posts from the past 24 hours using the **snoowrap** library.

#### b. Post Details

- Each post includes:
  - **Title**
  - **Score**
  - **Content**
  - **URL**
  - **Created Time (UTC)**
  - **Number of Comments**

#### c. Display

- Posts are displayed in a table component.
- The table is sortable based on the number of upvotes (**score**).

### 4. Analyze Reddit Posts Data - "Themes" Tab

#### a. Categorization

- Each post is sent to **OpenAI** using structured output to categorize them into the following themes:
  - **Solution Requests**: Posts where users are seeking solutions for problems.
  - **Pain & Anger**: Posts where users are expressing pain or frustration.
  - **Advice Requests**: Posts where users are seeking advice.
  - **Money Talk**: Posts where users are discussing spending money.

#### b. Implementation Rules

- **Zod Package**: Use the **zod** package for defining data structures.
- **Model**: Use the `'gpt-4o'` model instead of other models.
- **Prompt Structure**:
  - Move category descriptions into the zod model descriptions.
  - Make the prompt generic, not tied to specific categories.
  - Do not specify the JSON output structure in the prompt.
- **Reference Code**: Follow the code examples provided in the documentation section.

#### c. Concurrency

- The categorization process runs concurrently for multiple posts to enhance performance.

#### d. Display

- On the "Themes" page:
  - Each category is displayed as a card with:
    - **Title**
    - **Description**
    - **Number of Posts (Counts)**
  - Clicking on a category card opens a side panel displaying all posts under that category.

---

## File Structure

```
reddit01
├── README.md
├── app
│   ├── favicon.ico
│   ├── fonts
│   ├── globals.css
│   ├── layout.tsx              // Main layout file
│   ├── page.tsx                // Home page
│   └── subreddit
│       └── [name]
│           └── page.tsx        // Subreddit page with tabs
├── components
│   ├── SubredditList.tsx       // Component to list subreddits
│   ├── SubredditCard.tsx       // Card component for each subreddit
│   ├── AddSubredditModal.tsx   // Modal to add a new subreddit
│   ├── PostsTable.tsx          // Table to display top posts
│   ├── CategoryCards.tsx       // Cards for each category
│   ├── SidePanel.tsx           // Side panel to display posts under a category
│   └── ui                      // Reusable UI components (from shadcn/ui)
├── lib
│   ├── reddit.ts               // Functions to interact with Reddit API
│   ├── openai.ts               // Functions to interact with OpenAI API
│   └── utils.ts                // Utility functions
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── yarn.lock
```

**Notes:**

- **Components**: All new components are placed in the `/components` directory at the root.
- **Pages**: All new pages are placed in the `/app` directory.
- **Next.js 14 App Router**: The project uses the Next.js 14 app router.
- **Data Fetching**: All data fetching is done in server components and data is passed down as props.
- **Client Components**: Components that use state or hooks include `'use client'` at the top of the file.

---

## Documentation and Code Examples

### Fetching Recent Reddit Posts Using Snoowrap

**Purpose**: Retrieve recent posts from a subreddit within the last 24 hours.

#### Code Example

```javascript
import Snoowrap from 'snoowrap';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Snoowrap client with username and password
const r = new Snoowrap({
  userAgent: 'MyApp/1.0.0',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

interface RedditPost {
  title: string;
  url: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

async function fetchSubredditPosts(subredditName: string): Promise<RedditPost[]> {
  const subreddit = r.getSubreddit(subredditName);
  const currentTime = Math.floor(Date.now() / 1000);
  const oneDayAgo = currentTime - 24 * 60 * 60;

  const posts = await subreddit.getNew({ limit: 100 });
  
  const recentPosts = posts.filter((post: any) => post.created_utc > oneDayAgo);

  return recentPosts.map((post: any) => ({
    title: post.title,
    url: post.url,
    selftext: post.selftext,
    score: post.score,
    num_comments: post.num_comments,
    created_utc: post.created_utc
  }));
}

// Usage
const subredditName = 'AskReddit'; // Replace with your desired subreddit

fetchSubredditPosts(subredditName)
  .then(posts => {
    console.log(`Fetched ${posts.length} posts from r/${subredditName} in the last 24 hours:`);
    posts.forEach(post => {
      console.log(`
        Title: ${post.title}
        URL: ${post.url}
        Content: ${post.selftext.substring(0, 100)}...
        Score: ${post.score}
        Comments: ${post.num_comments}
        Created: ${new Date(post.created_utc * 1000).toLocaleString()}
      `);
    });
  })
  .catch(error => {
    console.error('Error fetching posts:', error);
  });
```

---

### Using OpenAI Structured Output to Categorize Posts

**Purpose**: Categorize Reddit posts into predefined themes using OpenAI's GPT-4 model with structured outputs.

#### Code Example

```javascript
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SubredditCategorization = z.object({
  solution_request: z.boolean().describe("True when people are asking for tools & solutions"),
  pain_anger: z.boolean().describe("True when people are expressing pain points & frustrations"),
  advice_request: z.boolean().describe("True when people are asking for advice & resources"),
  money_talk: z.boolean().describe("True when people are talking about spending money"),
});

async function categorizeSubredditPost(postContent: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { 
        role: "system", 
        content: "You are an expert at analyzing subreddit posts. Categorize the given post content based on the defined criteria." 
      },
      { role: "user", content: postContent },
    ],
    response_format: zodResponseFormat(SubredditCategorization, "subreddit_categorization"),
  });

  return completion.choices[0].message.content;
}

// Example usage
async function main() {
  const examplePost = `Title: Taking on The Terrible Ticks 
        URL: https://i.redd.it/iss16quwjvsd1.jpeg
        Content: These ticks resemble clusters of grapes, clinging to the back of my rescued guard dog (mongrel). My dog seemed to enjoy the attention as I removed them, but I quickly grew weary of the task with so many to pluck one by one. I wear gloves during the process and incinerate them immediately with a lighter. Should I be concerned about their potential as vectors of disease? Please help identify the tick and recommend appropriate treatment. 
        Score: 1
        Comments: 3
        Created: 10/5/2024, 3:35:24 PM`;

  try {
    const categories = await categorizeSubredditPost(examplePost);
    console.log("Categorization result:", categories);
  } catch (error) {
    console.error("Error categorizing post:", error);
  }
}

main();
```

#### Example Output

```
Categorization result: {"solution_request":true,"pain_anger":false,"advice_request":true,"money_talk":false}
```

---

## Implementation Details and Guidelines

### 1. Libraries and Tools

- **Next.js 14**: Utilize the app router for routing and page management.
- **shadcn/ui**: For reusable UI components.
- **Tailwind CSS**: For styling components efficiently.
- **Lucide Icons**: For iconography throughout the app.
- **snoowrap**: For interacting with Reddit's API.
- **OpenAI GPT-4 Model ('gpt-4o')**: For categorizing posts.
- **Zod Package**: For defining and validating data structures.

### 2. Data Fetching and State Management

- All data fetching should be done in **server components** to leverage Next.js's server-side rendering and data fetching capabilities.
- Data fetched in server components should be passed down to **client components** as props.
- **Client components** that use state or React hooks must include `'use client'` at the top of the file.

### 3. Component Structure

- Components should be modular and reusable.
- Place all components in the `/components` directory.
- Follow the naming convention: `ComponentName.tsx`.

### 4. API Interaction

#### Reddit API

- Use **snoowrap** to fetch posts.
- Fetch the top 100 posts and filter those from the last 24 hours.

#### OpenAI API

- Use the **'gpt-4o'** model.
- **Zod Package**:
  - Define the data structure for categorization using zod.
  - Include category descriptions in the zod model's `.describe()` method.
- **Prompt Structure**:
  - Make the prompt generic.
  - Do not specify the JSON output structure directly in the prompt.
- **Concurrency**:
  - Run the categorization process concurrently for multiple posts to improve performance.
- **Response Parsing**:
  - Use `zodResponseFormat` from `openai/helpers/zod` to ensure proper response formatting.
  - Parse the OpenAI API response correctly, typically using `JSON.parse()` on the response content.

### 5. UI/UX Details

- **Homepage**:
  - Display subreddit cards with the subreddit name and an option to navigate to its page.
  - Include an "Add Reddit" button to open a modal for adding new subreddits.

- **Subreddit Page**:
  - Implement tabs for "Top Posts" and "Themes".
  - Under "Top Posts":
    - Display posts in a sortable table.
  - Under "Themes":
    - Display category cards with the number of posts in each.
    - Clicking a category opens a side panel with the relevant posts.

- **Accessibility**:
  - Ensure all interactive elements are accessible via keyboard navigation.
  - Use semantic HTML where appropriate.

### 6. Styling and Theming

- Use **Tailwind CSS** classes for styling.
- Consistent use of **shadcn/ui** components for uniform design.
- Incorporate **Lucide Icons** for visual enhancements.

### 7. Environment Variables

- Store sensitive data like API keys and Reddit credentials in environment variables.
- Use a `.env` file and ensure it's excluded from version control (`.gitignore`).

### 8. Error Handling

- Implement error handling for API requests.
- Display user-friendly messages in the UI when errors occur.

### 9. Data Processing and Filtering

- When defining themes or categories:
  - Include a `key` property that matches the property names in the categorization schema.
  - Ensure consistency between the categorization schema and the theme definitions.
- When filtering categorized data:
  - Use boolean values from the categorization results to filter posts into appropriate themes.
  - Double-check that the filtering logic correctly matches the structure of the categorization results.

### 10. Debugging and Logging

- Implement comprehensive logging throughout the application, especially in API routes and data processing functions.
- Log intermediate results, such as the number of posts fetched and categorized, to help identify issues in the data pipeline.
- Use `console.log` statements strategically to track the flow of data and catch potential issues early.

### 11. Error Handling

- Implement try-catch blocks in all asynchronous operations, especially those involving external API calls.
- Provide informative error messages that can help diagnose issues quickly.
- Consider implementing a custom error handling middleware for API routes to standardize error responses.

### 12. Component Integration and Data Flow

- Ensure proper data flow between parent and child components:
  - Pass data and callback functions as props from parent to child components.
  - Verify that prop types match between parent and child components.
- Implement proper state management in parent components:
  - Use useState for local component state.
  - Use useEffect for side effects like data fetching.
- Ensure child components correctly consume and render passed props:
  - Implement proper type checking for props.
  - Handle cases where props might be undefined or null.

### 13. Debugging and Troubleshooting

- Implement comprehensive logging throughout the application:
  - Log important state changes and data fetching results.
  - Use descriptive log messages to track the flow of data.
- Utilize browser developer tools:
  - Check the console for errors and log messages.
  - Use the React Developer Tools to inspect component hierarchy and props.
- Implement error boundaries to catch and display errors gracefully.

### 14. Component Rendering and Conditional Logic

- Implement proper conditional rendering:
  - Handle loading states with appropriate UI feedback.
  - Display error messages when data fetching or processing fails.
  - Ensure components gracefully handle empty or null data.
- Use React.Fragment or shorthand <> </> to wrap multiple elements without adding extra nodes to the DOM.

### 15. API Integration and Data Processing

- Implement robust error handling in API calls:
  - Use try-catch blocks to handle exceptions.
  - Provide informative error messages for different types of failures.
- Process API responses correctly:
  - Ensure data structures match between API responses and component expectations.
  - Implement data transformation functions if necessary to format API data for component consumption.

### 16. Performance Considerations

- Implement proper memoization techniques:
  - Use React.memo for functional components that render often with the same props.
  - Use useMemo for expensive computations.
  - Use useCallback for functions passed as props to child components.
- Optimize re-renders:
  - Avoid unnecessary re-renders by properly structuring component hierarchy.
  - Use keys correctly in list rendering to help React identify which items have changed.

### 17. Testing and Quality Assurance

- Implement unit tests for critical components and functions:
  - Test components in isolation using tools like Jest and React Testing Library.
  - Implement integration tests for connected components.
- Perform thorough manual testing:
  - Test all user interactions and edge cases.
  - Verify correct data display and updates across different scenarios.

---

## Additional Notes

- **Data Persistence**: If required, consider implementing data persistence for the list of subreddits using a lightweight database or local storage.
- **Scalability**: The architecture should allow for easy addition of new features or categories in the future.
- **Testing**: Write unit tests for critical functions, especially those interacting with external APIs.
- **Documentation**: Comment code where necessary and maintain updated documentation for developers.

---

## Additional Implementation Guidelines

1. Server-Side API Calls:
   - All interactions with external APIs (e.g., Reddit, OpenAI) should be performed server-side.
   - Create dedicated API routes in the `pages/api` directory for each external API interaction.
   - Client-side components should fetch data through these API routes, not directly from external APIs.

2. Environment Variables:
   - Store all sensitive information (API keys, credentials) in environment variables.
   - Use a `.env.local` file for local development and ensure it's listed in `.gitignore`.
   - For production, set environment variables in the deployment platform (e.g., Vercel).
   - Access environment variables only in server-side code or API routes.

3. Error Handling and Logging:
   - Implement comprehensive error handling in both client-side components and server-side API routes.
   - Log errors on the server-side for debugging purposes.
   - Display user-friendly error messages on the client-side.

4. Type Safety:
   - Use TypeScript interfaces for all data structures, especially API responses.
   - Avoid using `any` type; instead, define proper types for all variables and function parameters.

5. API Client Initialization:
   - Initialize API clients (e.g., Snoowrap for Reddit, OpenAI) in server-side code only.
   - Implement checks to ensure API clients are properly initialized before use.

6. Data Fetching in Components:
   - Use React hooks (e.g., `useEffect`) for data fetching in client-side components.
   - Implement loading states and error handling for all data fetching operations.

7. Next.js Configuration:
   - Utilize `next.config.mjs` for environment-specific configurations.
   - Use the `env` property in `next.config.mjs` to make environment variables available to the application.

8. CORS and API Routes:
   - Use Next.js API routes to avoid CORS issues when interacting with external APIs.
   - Implement proper request validation in API routes.

9. Component Structure:
   - Separate concerns between client and server components.
   - Use server components for initial data fetching and pass data as props to client components.

10. Security:
    - Never expose API keys or sensitive credentials on the client-side.
    - Implement proper authentication and authorization for API routes if needed.

By following these principles and requirements, we can create a more robust, secure, and maintainable application, avoiding common pitfalls in Next.js and React development.