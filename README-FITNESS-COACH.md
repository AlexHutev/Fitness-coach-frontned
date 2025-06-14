# FitnessCoach Frontend

A modern web application for fitness coaches to manage their clients, training programs, and nutrition plans.

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── layout.tsx     # Auth-specific layout
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with Header/Footer
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── index.ts
│   └── layout/           # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── index.ts
```

## Features Implemented

### 🎨 Layout Components
- **Header**: Responsive navigation with mobile menu
  - Logo and branding
  - Authentication-aware navigation
  - User profile dropdown (when logged in)
  - Mobile-responsive hamburger menu
  
- **Footer**: Professional footer with links and social media
  - Company information
  - Quick links and support sections
  - Social media icons
  - Copyright and legal links

### 🔐 Authentication Forms
- **Login Form**: Complete login functionality
  - Email/password validation
  - Show/hide password toggle
  - Remember me checkbox
  - Forgot password link
  - Loading states and error handling
  
- **Register Form**: Comprehensive registration
  - Personal information (name, email, phone)
  - Professional details (specialization, experience)
  - Password strength validation
  - Terms and conditions acceptance
  - Form validation with error messages

### 🏠 Landing Page
- **Hero Section**: Call-to-action with registration/login buttons
- **Features Section**: Key platform capabilities
- **Benefits Section**: Why choose FitnessCoach
- **About Section**: Platform statistics and credibility
- **CTA Section**: Final conversion opportunity

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: Geist Sans and Geist Mono

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Design Features

### 🎨 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly mobile navigation

### 🌈 Color Scheme
- Primary: Blue (blue-600, blue-700)
- Secondary: Gray scale
- Success: Green
- Warning: Orange
- Error: Red

### ✨ User Experience
- Smooth transitions and animations
- Loading states for form submissions
- Clear validation messages
- Accessible focus states
- Custom scrollbar styling

## Next Steps

The foundation is complete! You can now:
1. Set up authentication backend integration
2. Create dashboard and client management pages
3. Build training program creation tools
4. Implement nutrition planning features
5. Add progress tracking and analytics

## File Organization

Each component is self-contained with:
- Clear prop interfaces (TypeScript)
- Form validation and error handling
- Loading states and user feedback
- Responsive design considerations
- Accessibility features