# Honey Singh - Portfolio Website

A modern, responsive portfolio website built with Next.js, showcasing projects, skills, and GitHub activity.

## 🚀 Features

- **Modern UI/UX**: Dark theme with neon accents and smooth animations
- **GitHub Integration**: Real-time GitHub stats, contributions, and repository showcase
- **Responsive Design**: Mobile-first approach with optimized layouts
- **Performance Optimized**: Code splitting, lazy loading, and optimized images
- **Interactive Sections**: Hero, About, Skills, Projects, and GitHub activity
- **Theme Support**: Dark theme with smooth transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Iconify
- **Font**: Orbitron (Google Fonts)
- **Analytics**: Vercel Analytics

## 📦 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0 (or pnpm/bun)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/HoneySinghDev/honey-portfolio-site.git
cd honey-portfolio-site
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
bun install
```

3. Configure your personal information in `lib/config.ts`

4. Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Check for linting errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean build artifacts

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes (GitHub integration)
│   ├── components/        # Page components
│   └── page.tsx           # Main page
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── config.ts         # Site configuration
│   └── github/           # GitHub API client
└── public/               # Static assets
```

## ⚙️ Configuration

Edit `lib/config.ts` to customize:

- Personal information
- Contact details
- Featured GitHub repositories
- Skills and experience
- Navigation sections

## 🚀 Deployment

The site can be deployed on Vercel, Netlify, or any platform that supports Next.js.

```bash
npm run build
npm run start
```

## 📝 License

Private project - All rights reserved

## 👤 Author

**Honey Singh**

- GitHub: [@HoneySinghDev](https://github.com/HoneySinghDev)
- Portfolio: [honeysingh.dev](https://honeysingh.dev)
