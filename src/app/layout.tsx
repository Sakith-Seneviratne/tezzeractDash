import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const figtree = Figtree({ 
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Dashboard - Content Generation Tool",
  description: "Multi-platform dashboard and content generation tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              (function() {
                if (typeof window !== 'undefined') {
                  const body = document.body;
                  if (body) {
                    // Remove attributes that start with __processed_
                    const attributes = body.attributes;
                    for (let i = attributes.length - 1; i >= 0; i--) {
                      const attr = attributes[i];
                      if (attr.name.startsWith('__processed_')) {
                        body.removeAttribute(attr.name);
                      }
                    }
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${figtree.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}