import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SalesPlanMaker - 顧客感情分析ツール',
  description: 'リアルタイムで顧客の表情を分析し、動的に資料内容や提案方針を考案するアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="body-background"></div>
        <main className="min-h-screen p-4 relative z-0">
          {children}
        </main>
      </body>
    </html>
  )
} 