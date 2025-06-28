# Travel Itinerary Generator

## Overview

This is a full-stack travel itinerary generator application that uses AI to create personalized trip plans. Users can describe their travel desires in natural language, and the system generates detailed day-by-day itineraries with activities, costs, and recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for trip generation
- **Development**: Hot reload with Vite middleware integration

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration Strategy**: Schema-first with automatic migrations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Location**: Shared between client and server (`/shared/schema.ts`)

## Key Components

### Core Entities
1. **Users**: Basic user management with username/password authentication
2. **Trips**: Generated travel itineraries with structured JSON data
3. **Itinerary Structure**: Day-by-day activities with time, location, cost, and category

### AI Integration
- **Service**: OpenAI GPT-4o model for natural language processing
- **Prompt Engineering**: Structured prompts for consistent JSON output
- **Response Validation**: Zod schemas ensure data integrity
- **Error Handling**: Graceful fallbacks for API failures

### Storage Strategy
- **Development**: In-memory storage for rapid prototyping
- **Production**: PostgreSQL with Drizzle ORM
- **Data Models**: Shared TypeScript interfaces between frontend and backend

## Data Flow

1. **User Input**: Natural language trip description via form interface
2. **Validation**: Zod schema validation on both client and server
3. **AI Processing**: OpenAI API generates structured itinerary data
4. **Response**: Formatted itinerary displayed with interactive UI components
5. **State Management**: TanStack Query caches responses and manages loading states

## External Dependencies

### Core Dependencies
- **openai**: Official OpenAI SDK for GPT integration
- **drizzle-orm**: Type-safe database toolkit
- **@tanstack/react-query**: Server state management
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Usage

1. Visit the application in your browser
2. Enter a description of your desired trip (destination, duration, budget, preferences)
3. Click "Generate Itinerary" to create your personalized travel plan
4. View the detailed day-by-day itinerary with activities, costs, and locations

## Example Input

"I want to visit Paris for 3 days with a budget of $1000. I love art, good food, and historic sites. I prefer mid-range accommodations."

## Features

- **AI-Powered Generation**: Uses GPT-4o for intelligent itinerary creation
- **Detailed Planning**: Day-by-day breakdown with specific times and locations
- **Cost Tracking**: Individual activity costs and daily totals
- **Category Organization**: Activities categorized (food, sightseeing, transport, etc.)
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Generation**: Fast API responses with loading states