# Landing Page - Eduardo Montenegro

![Project Presentation](/images/EM-presentation.png)

## 📋 Project Description

Professional landing page for **Eduardo Montenegro**, Clinical Psychologist, designed with a modern and elegant approach. The website presents information about psychoanalysis services, clinical supervision, and study groups, with a fluid and attractive user experience.

![Hero Section](/images/EM-1.png)

## ✨ Key Features

### 🎨 Design and User Experience

- **Responsive Design**: Perfectly adapted for mobile devices, tablets, and desktop
- **Smooth Animations**: Framer Motion implementation for smooth transitions and attractive visual effects
- **Scroll Velocity**: Moving text effect with scroll-based velocity
- **Sticky Sections**: Sections that remain visible during scroll for better navigation
- **Dark/Light Mode**: Support for light and dark themes with next-themes

### 🌐 Multilingual

- **Bilingual Support**: Spanish and English with dynamic language switching
- **Language Context**: Integrated translation system with React Context
- **Localized Validation**: Error messages and validation adapted to selected language

### 📝 Site Sections

1. **Hero Banner**: Impactful presentation with profile image and animations
2. **About Section**: Personal information and professional profile
3. **Message Section**: Featured message from the professional
4. **Services Section**: Service cards with detailed information
5. **FAQ Section**: Frequently asked questions with interactive accordion
6. **Contact Section**: Functional contact form with validation

![Services Section](/images/EM-2.png)

### 🔧 Technical Features

- **Contact Form**: Validation with Zod, async submission, and visual feedback
- **API Route**: Endpoint `/api/contact` for form processing
- **Email Integration**: Email sending system with Resend
- **Database**: Integration with Supabase for data management
- **Privacy Policy**: PDF data protection document (Colombia)

## 🛠️ Technologies Used

### Frontend

- **Next.js 16.1.0** (Canary) - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Static typing
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Framer Motion 12.23.25** - Animation library

### UI Components

- **Radix UI** - Accessible and primitive components
- **Lucide React** - Modern icons
- **shadcn/ui** - Reusable component system
- **Magic UI** - Advanced UI components

### Backend & Services

- **Supabase 2.86.2** - Backend as a service
- **Resend 6.5.2** - Email sending service
- **React Email** - Email template creation

### Validation & Forms

- **Zod 3.25.76** - Schema validation
- **React Hook Form 7.60.0** - Form management
- **@hookform/resolvers** - Zod integration

### Utilities

- **clsx & tailwind-merge** - CSS class management
- **date-fns** - Date manipulation
- **sonner** - Toast notification system

## 🚀 Installation and Setup

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd landing-page-Eduardo-Montenegro
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure environment variables**
   Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

4. **Run development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open in browser**

```
http://localhost:3000
```

## 📁 Project Structure

```
landing-page-Eduardo-Montenegro/
├── public/
│   ├── images/           # Project images
│   │   ├── EM-presentation.png
│   │   ├── EM-1.png
│   │   ├── EM-2.png
│   │   ├── EM-3.jpg
│   │   └── profile.png
│   └── Politica_Proteccion_Datos_Colombia.pdf
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   │   └── contact/  # Contact endpoint
│   │   ├── layout.tsx    # Main layout
│   │   ├── page.tsx      # Main page
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   ├── about-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── faq-section.tsx
│   │   ├── footer.tsx
│   │   ├── hero-banner.tsx
│   │   ├── message-section.tsx
│   │   ├── navbar.tsx
│   │   ├── services-section.tsx
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   ├── language-context.tsx
│   │   ├── translations.ts
│   │   ├── validation.ts
│   │   └── social-links.ts
│   └── registry/
│       └── magicui/      # Magic UI components
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎯 Work Completed

### Frontend Development

- ✅ Next.js 16 implementation with App Router
- ✅ Responsive design with Tailwind CSS
- ✅ Reusable component system with Radix UI
- ✅ Advanced animations with Framer Motion
- ✅ Scroll velocity effect in hero banner
- ✅ Sticky sections for better UX
- ✅ Dark/Light mode with next-themes

### Features

- ✅ Multilingual system (Spanish/English)
- ✅ Contact form with Zod validation
- ✅ API route for form processing
- ✅ Supabase integration for data management
- ✅ Email sending system with Resend
- ✅ Error handling and visual feedback
- ✅ Privacy policy and terms of use

### Optimizations

- ✅ Image optimization with Next.js Image
- ✅ Lazy component loading
- ✅ Font optimization with next/font
- ✅ CSS and JS minification
- ✅ Strict TypeScript configuration

![Contact Section](/images/EM-3.jpg)

## 🧪 Testing

The project includes form validation with Zod and error handling on both client and server.

## 📦 Production Build

```bash
npm run build
npm start
```

## 🌐 Deploy

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

The project can be deployed on any platform that supports Next.js:

- Vercel
- Netlify
- AWS Amplify
- Railway
- Render

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
