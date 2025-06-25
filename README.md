# PDF to Word Converter

A simple, fast, and free PDF to Word converter built with Next.js and `pdf-to-word`.

## Overview

This project provides a user-friendly web interface for converting PDF documents into editable Microsoft Word files (`.docx`). It's designed for privacy and speed, performing all conversions directly in the user's browser.

## Features

- **Client-Side Conversion**: No files are uploaded to a server, ensuring user privacy.
- **High-Quality Conversion**: Aims to preserve the original layout, text, and images.
- **User-Friendly Interface**: Simple drag-and-drop or file selection.
- **Fast Performance**: Built with Next.js for a speedy user experience.

## Tech Stack

- [Next.js](https://nextjs.org/) – React framework
- [TypeScript](https://www.typescriptlang.org/) – Language
- [Tailwind CSS](https://tailwindcss.com/) – Styling
- [shadcn/ui](https://ui.shadcn.com/) – UI components
- [pdf-to-word](https://www.npmjs.com/package/pdf-to-word) – Core conversion library
- [Cypress](https://www.cypress.io/) - End-to-end testing

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/pdf-converter.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd pdf-converter
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
