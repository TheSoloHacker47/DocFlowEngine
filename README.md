# DocFlowEngine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC)](https://tailwindcss.com/)

DocFlowEngine is a modern, secure PDF to Word converter that processes files entirely in your browser. Built with privacy-first principles, it ensures your documents never leave your device while delivering high-quality conversions.

## 🚀 Features

- **🔒 Privacy First**: All conversions happen locally in your browser - no file uploads to servers
- **⚡ Fast & Efficient**: Client-side processing with optimized conversion algorithms
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎯 High-Quality Output**: Preserves formatting, structure, and text positioning
- **🛡️ Secure**: No data collection, no tracking, no server-side processing
- **🆓 Free to Use**: No registration, no limits, no hidden fees

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **PDF Processing**: pdf.js (Mozilla)
- **Word Generation**: docx.js
- **Deployment**: Vercel (recommended)

## 🏗️ Project Structure

```
DocFlowEngine/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── privacy-policy/    # Privacy policy
│   │   └── terms-of-service/  # Terms of service
│   ├── components/            # React components
│   │   └── Layout.tsx         # Main layout component
│   ├── lib/                   # Core conversion libraries
│   │   ├── pdfParser.ts       # PDF parsing logic
│   │   ├── docxGenerator.ts   # Word document generation
│   │   ├── pdfToWordConverter.ts # Main conversion engine
│   │   └── index.ts           # Library exports
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
└── .taskmaster/              # TaskMaster project management
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheSoloHacker47/DocFlowEngine.git
   cd DocFlowEngine
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload PDF**: Drag and drop or click to select a PDF file
2. **Convert**: The conversion happens automatically in your browser
3. **Download**: Save the converted Word document to your device

### Supported Features

- ✅ Text extraction and formatting preservation
- ✅ Paragraph and line break handling
- ✅ Document metadata preservation
- ✅ Multiple conversion modes (simple/advanced)
- ✅ Progress tracking and error handling
- 🔄 Coming soon: Image extraction, table conversion, advanced formatting

## 🧪 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### TaskMaster Integration

This project uses TaskMaster for project management. Key commands:

```bash
# View current tasks
npx task-master-ai list

# Get next task to work on
npx task-master-ai next

# View specific task details
npx task-master-ai show <task-id>

# Update task status
npx task-master-ai set-status --id=<task-id> --status=done
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Deploy automatically** - Vercel will handle the build and deployment

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

DocFlowEngine is built with privacy as a core principle:

- **No Server Processing**: All conversions happen in your browser
- **No Data Collection**: We don't collect, store, or transmit your files
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency in our code and processes

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/TheSoloHacker47/DocFlowEngine/issues)
- **Email**: support@docflowengine.com
- **Documentation**: [Project Wiki](https://github.com/TheSoloHacker47/DocFlowEngine/wiki)

## 🎯 Roadmap

- [ ] File uploader component with drag-and-drop
- [ ] Complete UI state management
- [ ] Advanced formatting preservation
- [ ] Image and table conversion
- [ ] OCR for scanned PDFs
- [ ] Additional output formats (Excel, PowerPoint)
- [ ] Performance optimizations
- [ ] Mobile app versions

---

**DocFlowEngine** - Transforming documents, preserving privacy.
