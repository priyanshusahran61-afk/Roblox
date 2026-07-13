import './globals.css'

export const metadata = {
  title: 'Bloxcraft - Play',
  description: 'A Roblox-like 3D playground built for the web',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ background: '#87ceeb' }}>
      <body>{children}</body>
    </html>
  )
}
