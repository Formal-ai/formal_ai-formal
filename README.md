# Formal.AI - Professional Appearance Platform

Formal.AI is an AI-powered professional appearance platform that helps people instantly look polished, confident, and business-ready.

It uses advanced, identity-preserving AI to generate photorealistic professional images, allowing users to adjust formal clothing, accessories, hair, lighting, and backgrounds—without altering who they are.

## What Formal.AI Does

- **Enhances formal attire and overall appearance**
- **Preserves real facial identity and natural features**
- **Adjusts hair style and color realistically**
- **Adds or edits accessories with precision**
- **Improves lighting and color automatically**
- **Replaces backgrounds with professional environments**

## Mission

Help people look formal, confident, and credible—instantly, affordably, and at scale.

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js & npm installed

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd formal-ai

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Key Features

- **Multi-Studio Pipeline**: Specialized studios for Portraits, Hair, Accessories, and Backgrounds.
- **Waitlist & Challenge**: Integrated waitlist system with an AI-identity challenge to engage early adopters.
- **Premium Aesthetics**: iOS-glass design system with liquid-glass sections and smooth animations.
- **Privacy & Compliance**: Built-in Cookie Consent, Terms of Service, and Privacy Policy systems.

## Deployment & Development

We use a `Makefile` to streamline common tasks:

```sh
make dev      # Start development server
make build    # Build production application
make preview  # Preview production build locally
make lint     # Run linter
make clean    # Remove build artifacts
```

### Environment Setup

Ensure you have a `.env` file with the following keys:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_LAUNCH_MODE` (Set to "waitlist" or "live")

## Database Setup

The core database schema is defined in `supabase/schema.sql`. For the waitlist functionality, ensure the RLS policies allow anonymous inserts and updates (for challenge results).

## Deployment

Build the application for production:

```sh
npm run build
```
