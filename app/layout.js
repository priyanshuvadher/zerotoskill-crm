import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Zero to Skill CRM',
  description: 'Complete EdTech Platform - Student Management, LMS, CRM, Community',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
