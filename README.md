# Komodki Impex v0.2 - Next.js Migration

This is the Next.js version of the Komodki Impex export business website, migrated from the original React + Vite setup.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
KomodkiimpexV0.2/
├── pages/                 # Next.js pages (file-based routing)
│   ├── api/              # API routes (ready for database integration)
│   ├── products/         # Dynamic product pages
│   ├── admin/            # Admin panel
│   ├── index.tsx         # Home page
│   └── packaging.tsx     # Packaging page
├── components/           # React components
├── styles/              # Global CSS styles
├── lib/                 # Utility functions
└── public/              # Static assets
```

## 🔐 Admin Access

- **URL**: `/admin`
- **Password**: `komodki2025`
- **Features**: Dashboard with stats, tabs for future database integration

## 🎨 Design System

- **Colors**: Blue (#2563eb) + Orange (#f97316) gradient scheme
- **Style**: Modern glassmorphism with industrial aesthetic
- **Framework**: Tailwind CSS v3.4.0
- **Icons**: Lucide React

## 🛠️ Tech Stack

- **Framework**: Next.js 14.0.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel

## 📄 Pages

- **Home** (`/`): Complete landing page with all sections
- **Products** (`/products/[slug]`): Dynamic product category pages
- **Packaging** (`/packaging`): Dedicated packaging solutions page
- **Admin** (`/admin`): Password-protected admin dashboard

## 🔄 Migration Changes

### What Changed:
- **Vite** → **Next.js** (build system)
- **Custom routing** → **File-based routing**
- **Custom navigate()** → **Next.js Router**

### What Stayed Same:
- ✅ All React components
- ✅ Tailwind CSS styling
- ✅ Design system & aesthetics
- ✅ Business logic & functionality

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform

## 🔮 Future Database Integration

The project is ready for database integration with:
- API routes in `/pages/api/`
- Contact form ready for backend
- Admin panel prepared for data management
- Product catalog ready for dynamic content

## 📞 Contact Information

- **Company**: Komodki Impex
- **Email**: info@komodkiimpex.com
- **Phone**: +919833964347
- **Address**: Shivneri C-2, Ashok Nager, Dahisar (East), Mumbai - 400068, Maharashtra, India.

## 📝 License

© 2025 Komodki Impex. All rights reserved.