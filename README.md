# Online Assessment Platform
Built for Akij iBOS Ltd. Frontend Engineer Assessment

##  GitHub Repository
https://github.com/shahadatrakib147/assessment-platform

##  Live Demo
[https://your-vercel-link-here.vercel.app](https://assessment-platform-virid.vercel.app/)

##  Video Walkthrough
[https://your-loom-link-here](https://www.loom.com/share/14df2debd9084decbdfb967536bc8dfc)

##  Setup Instructions
npm install
npm run dev
Open http://localhost:3000

##  Demo Credentials
**Employer Portal**
Email: hr@akijibos.com
Password: employer123

**Candidate Portal**
Email: rakib@candidate.com
Password: candidate123

##  Tech Stack
- Next.js 14 (App Router)
- React 18 with TypeScript
- Custom Zustand-like state management
- Form validation with typed error handling
- Tailwind-compatible CSS with CSS variables
- IBM Plex Sans + Plus Jakarta Sans typography

##  Features Implemented
**Employer Panel**
- Login with form validation
- Dashboard with exam cards (candidates, slots, question sets)
- View Candidates modal
- Multi-step Create Test form (Basic Info + Question Sets)
- Add / Edit / Delete questions (Radio, Checkbox, Text types)

**Candidate Panel**
- Login with form validation
- Dashboard showing available exams
- Full exam screen with countdown timer
- Auto-submit on timeout
- Manual submit option
- Tab switch detection and recording
- Question navigator dots

##  MCP Integration
I explored using Figma MCP to sync design tokens directly from the
Figma file into the codebase, eliminating manual copy-paste of colors,
spacing, and typography. I also explored Supabase MCP for AI-assisted
database schema generation and query building directly from the editor.

##  AI Tools Used
- **Claude Code** — component architecture, TypeScript typing, logic design
- **GitHub Copilot** — inline autocomplete during development
- **ChatGPT** — brainstorming state management approach

## Offline Mode Strategy
I would use the Service Worker API with Cache Storage to cache all
question data on exam start. Candidate answers would be persisted
locally using IndexedDB (via idb-keyval) as they answer each question.
On reconnect, a background sync queue would automatically push saved
answers to the backend (Supabase), ensuring zero data loss even if
the candidate loses internet mid-exam.
