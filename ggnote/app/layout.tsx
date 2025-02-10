import { Source_Serif_4, Source_Code_Pro, LXGW_WenKai_TC } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FolderProvider } from "@/context/FolderContext";
import { ThemeProvider } from "@/components/theme-provider";

// Load Source Code Pro as the primary English font
const sourceCode = Source_Code_Pro({
  variable: "--font-source-code", // Now primary font
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Load Source Serif 4 as the fallback font
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif", // Now fallback font
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Load LXGW WenKai for Chinese text
const lxgwWenKai = LXGW_WenKai_TC({
  variable: "--font-lxgw-wenkai",
  subsets: ["lisu"], // Ensure correct subset
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${sourceCode.variable} ${sourceSerif.variable} ${lxgwWenKai.variable}`}>
      <body className="antialiased">
        {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
            
          <FolderProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1">
                {children}
              </main>
            </SidebarProvider>
          </FolderProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
