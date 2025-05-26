## FlipFolio

FlipFolio is a web application that transforms PDF documents into interactive, visually stunning digital flipbooks that can be shared via unique URLs. Built with modern web technologies, FlipFolio offers an elegant user experience for both uploading PDFs and viewing the resulting flipbooks.

## Overview

FlipFolio simplifies the process of converting static PDF documents into engaging, interactive flipbooks. Users can upload their PDFs through a simple drag-and-drop interface, and the application automatically transforms them into flipbooks with realistic page-turning animations, zoom functionality, and easy sharing options.

The application utilizes AWS Amplify for backend services, including authentication and S3 storage for the PDF files. The frontend is built with Next.js and styled with Tailwind CSS for a responsive and modern UI.

## Features

### PDF Upload
- Simple drag-and-drop interface for uploading PDF files
- Progress indication during upload
- Automatic processing of uploaded PDFs

### Flipbook Viewer
- Realistic page-turning animations powered by react-pageflip
- Responsive design that adapts to different screen sizes
- Navigation controls (previous/next page)
- Page counter showing current position and total pages
- Zoom in/out functionality for detailed viewing
- One-click sharing with automatic URL copying
- Loading progress indicator

### Sharing & Access
- Unique URL generation for each uploaded flipbook
- No authentication required to view shared flipbooks
- Clean, presentation-friendly viewing interface

## Architecture

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **PDF Handling**: react-pdf for rendering PDF pages
- **Flipbook Effect**: react-pageflip for page turning animations
- **Icons**: Heroicons

### Backend
- **Cloud Services**: AWS Amplify
- **Authentication**: AWS Cognito
- **Storage**: AWS S3 for storing and serving PDF files
- **URL Generation**: Dynamic routing with Next.js

### Key Components

#### Home Page (`src/app/page.tsx`)
The landing page with the file upload interface.

#### FlipbookViewer (`src/app/components/FlipbookViewer.tsx`)
The core component that renders the interactive flipbook, handling:
- PDF loading and rendering
- Page turning animations
- Zoom controls
- Sharing functionality

#### Folio Page (`src/app/folio/[slug]/page.tsx`)
The public-facing page that displays a specific flipbook identified by its slug.

#### FileUpload Component
Handles the file upload process, including:
- Drag and drop functionality
- File validation
- Upload progress tracking
- S3 storage integration

#### AmplifyClientProvider (`src/app/components/AmplifyClientProvider.tsx`)
Manages the AWS Amplify configuration and provides it to the rest of the application.

## Testing

### Manual Testing
Test the following functionality manually:
1. PDF upload via drag-and-drop
2. Flipbook rendering and page turning
3. Navigation controls (prev/next)
4. Zoom in/out functionality
5. Sharing via URL copying
6. Responsive behavior across different device sizes

### End-to-End Testing (Future Implementation)
Consider implementing Cypress or Playwright tests for:
- Upload flow
- Flipbook navigation
- Sharing functionality

### Performance Testing
Monitor and optimize:
- PDF loading times
- Page turning animation smoothness
- Initial load performance

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

The application is designed to be deployed on Vercel, which provides optimal support for Next.js applications. Follow the deployment instructions in the Next.js documentation for more details.

## License

© 2025 FlipFolio. All rights reserved.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
