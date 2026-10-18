import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: "little library — Your private reading room", description: 'Your private reading room, saved across your devices.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body style={{margin:0}}>{children}</body></html>;
}
