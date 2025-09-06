# Overview

HealthScan AI is a full-stack web application that provides AI-powered health analysis through image scanning. The application allows users to upload images for three types of health assessments: nutrition analysis (detecting nutrient deficiencies), acne analysis (skincare recommendations), and general health assessments. The system uses OpenAI's Vision API to analyze uploaded images and provides personalized health recommendations based on the analysis results.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built with **React 18** and **TypeScript**, using modern React patterns with functional components and hooks. The UI is constructed with **shadcn/ui** components built on top of **Radix UI** primitives, providing a consistent and accessible design system. **Tailwind CSS** handles styling with a custom design token system for colors, spacing, and typography.

State management is handled through **TanStack Query** (React Query) for server state management, providing caching, synchronization, and optimistic updates. Local component state uses React's built-in hooks like `useState` and `useEffect`.

The application uses **Wouter** for client-side routing, which is a lightweight alternative to React Router. The camera functionality is implemented with **react-webcam** for image capture, while voice features utilize the Web Speech API through custom hooks.

## Backend Architecture

The server is built with **Express.js** and **TypeScript**, following a RESTful API pattern. The application uses an in-memory storage implementation (`MemStorage`) that implements a defined storage interface (`IStorage`), making it easy to swap out for database persistence later.

File uploads are handled with **Multer** middleware, configured for memory storage with a 20MB file size limit. Images are converted to base64 format for processing and storage.

The AI analysis is powered by **OpenAI's Vision API** (using GPT-5 model), which analyzes uploaded images based on the scan type and returns structured health assessments and recommendations.

## Data Storage Design

The application uses **Drizzle ORM** with **PostgreSQL** as the database solution, configured to work with **Neon Database**. The schema defines three main entities:

- **Users**: Basic user authentication with username/password
- **Scans**: Store image data, analysis results, confidence scores, and scan metadata
- **Recommendations**: Health recommendations linked to specific scans with priority levels

The current implementation includes both in-memory storage (for development/testing) and database configuration (for production), allowing for flexible deployment scenarios.

## Authentication & Session Management

The application is configured for session-based authentication using **connect-pg-simple** for PostgreSQL session storage, though the current implementation focuses on the core scanning functionality rather than user management.

## Real-time Features

The application includes voice interaction capabilities through the Web Speech API, allowing users to interact with the system using voice commands and receive audio feedback through text-to-speech functionality.

# External Dependencies

## AI Services
- **OpenAI API**: Powers the image analysis using GPT-5 Vision model for health assessments
- **OpenAI Text-to-Speech**: Provides voice responses for accessibility features

## Database & Hosting
- **Neon Database**: PostgreSQL database hosting for production data persistence
- **Replit**: Development and hosting platform with integrated deployment

## Frontend Libraries
- **Radix UI**: Provides accessible UI components foundation
- **TanStack Query**: Server state management and caching
- **React Webcam**: Camera access and image capture functionality
- **Embla Carousel**: Image carousel components
- **date-fns**: Date formatting and manipulation

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Server-side bundling for production builds
- **TypeScript**: Type safety across the full stack