import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { Packaging } from '@/components/Packaging'
import { Footer } from '@/components/Footer'

export default function PackagingPage() {
  const router = useRouter()

  // Handle browser back button
  useEffect(() => {
    const handleBeforePopState = (e: PopStateEvent) => {
      router.push('/').then(() => {
        setTimeout(() => {
          const element = document.getElementById('packaging')
          element?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      })
      return false
    }

    window.addEventListener('popstate', handleBeforePopState)
    return () => window.removeEventListener('popstate', handleBeforePopState)
  }, [router])

  return (
    <>
      <Head>
        <title>Packaging Solutions - Komodki Impex</title>
        <meta name="description" content="Professional packaging solutions for minerals, hardware, and petroleum jelly exports. Secure and certified packaging for worldwide delivery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white bg-surface">
        <Header />
        <main>
          <Packaging />
        </main>
        <Footer />
      </div>
    </>
  )
}