# ReGenX
### Industrial waste utilisation system

ReGenX is an intelligent B2B platform designed to power the circular economy. By treating one industry's waste as another's raw material, ReGenX connects manufacturers to facilitate the trading of industrial by-products, reducing waste and creating new revenue streams.

The platform leverages **Google Gemini AI** to gain deep insights into manufacturing processes, automatically identify waste streams, and find strategic buyer matches.

---

## Key Features

### **AI-Powered Workflow Analysis (Digital Twin)**
*   **Process Parsing:** Users can paste detailed descriptions of their manufacturing processes (e.g., "Solar Panel Manufacturing" or "Denim Production").
*   **Waste Identification:** The **Workflow Agent** analyzes the text to identify specific waste outputs (e.g., "Aluminum Offcuts", "EVA Trimmings") and assigns confidence scores.
*   **Input Requirements:** It also identifies the raw materials required, helping to find sustainable substitutes from the marketplace.
*   **Optimization Engine:** Suggests alternate, more sustainable workflow steps to reduce waste generation at the source.

### **Marketplace & Trading**
*   **Listing Management:** Companies can easily list their waste outputs for sale. Listings can be auto-generated from the "Waste Catalog" created by the Workflow Analysis.
*   **Smart Search:** Filter listings by material type (Metal, Chemical, Organic, etc.) or use keyword search.
*   **AI Matchmaking:** The system automatically highlights "Opportunity Matches" where a user's waste meets another user's input needs.
*   **Order Management:** Complete workflow for Buying and Selling, including order approval and status tracking.

### **Global Intelligence & News**
*   **Real-Time Industry News:** Fetches the latest updates on waste management, circular economy, and regulations from Google News RSS.
*   **Region Focused:** Tailored specifically for the **Indian Industrial Sector** (INR currency, Indian news sources).
*   **AI News Analysis:** Click on any news item to receive a deep-dive analysis. The AI acts as a consultant, explaining:
    *   **Strategic Considerations:** How this news impacts your specific business.
    *   **Opportunity Matching:** Links the news to your specific cataloged waste streams.

### **Interactive Dashboard**
*   **Metric Hub:** Real-time view of Revenue from Waste, Waste Streams Identified, and Active Listings.
*   **Daily AI Insight:** A unique, generative AI-powered insight banner that changes daily based on your data.
*   **Activity Feed:** Track all your recent sales, purchases, and listings.

---

## Technology Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
    *   *Note: Application enforces Dark Mode for a premium, modern aesthetic.*
*   **Database:** PostgreSQL
*   **AI/LLM:** [Google Gemini API](https://ai.google.dev/)
    *   Model: `gemini-2.5-flash` for high-speed, cost-effective inference.
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Authentication:** Custom Session-based (simulated with `localStorage` for prototype).

---

## Setup & Installation

### Prerequisites
1.  **Node.js** (v18 or higher)
2.  **PostgreSQL** (Local or Cloud instance)
3.  **Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd regenx-web
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database Connection
PGUSER=postgres
PGHOST=localhost
PGDATABASE=regenx
PGPASSWORD=your_password
PGPORT=5432

# Google Gemini AI
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dimensions
```bash
npm install
```

### 4. Database Setup
We have provided scripts to initialize and seed the database with realistic industrial data.

**Create Schema & Seed Data:**
```bash
# This script wipes existing data and plants 5 companies with full workflows
node -r dotenv/config scripts/seed_db.js
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the AI Features

### **Test Scenario 1: Workflow Analysis**
1.  Go to **Dashboard**.
2.  In the "Workflow Waste Analyzer" box, paste the following text:
    > "The assembly process starts with interconnecting mono-crystalline silicon cells... excess EVA material oozes out and is trimmed off... Cutting these frames generates aluminum offcuts and shavings."
3.  Click **Analyze Workflow**.
4.  See the AI identify **Aluminum Offcuts** and **EVA Trimmings**.

### **Test Scenario 2: News Analysis**
1.  Go to **Global Insights** (Feed).
2.  Click on any news card.
3.  Wait for the "AI Analysis" to load (Shimmer effect).
4.  Read the "Strategic Considerations" generated specifically for the logged-in user's industry.

---

## Project Structure

*   `app/(protected)`: Application routes requiring authentication (Dashboard, Marketplace, etc.).
*   `app/api`: Next.js API Routes (Backend logic, DB queries, AI integration).
*   `app/api/agents`: Specialized AI Agents (Matchmaker, News Analyst, Workflow Parser).
*   `lib/db.ts`: PostgreSQL connection pool.
*   `scripts/`: Database maintenance and seeding scripts.

---

## UI/UX Highlights
*   **Premium Dark Mode:** Sleek, high-contrast design optimized for professional monitoring.
*   **Shimmer Loading:** Skeleton screens provide perceived performance during AI operations.
*   **Consistent Iconography:** Lucide icons replace generic emojis for a polished feel.
*   **Interactive Elements:** Hover effects, smooth transitions, and dynamic feedback.
