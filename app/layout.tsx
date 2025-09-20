import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Factorio Clone",
  description: "Factorioクローンゲーム - TypeScript + PIXI.js + ECS実装",
  keywords: ["game", "factorio", "automation", "crafting", "typescript", "pixi.js"],
  authors: [{ name: "Factorio Clone Project" }],
  viewport: "width=device-width, initial-scale=1",
}

type RootLayoutProps = {
  readonly children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
  return (
    <html lang="ja">
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}

export default RootLayout