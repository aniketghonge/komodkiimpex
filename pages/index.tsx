import Head from 'next/head'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Services } from '@/components/Services'
import { Products } from '@/components/Products'
import { Packaging } from '@/components/Packaging'
import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Komodki Impex - Global Export Solutions</title>
        <meta name="description" content="Reliable Global Trade Partner for Minerals, Hardware & Petroleum Jelly" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white bg-surface">
        <Header />
        <main>
          <Hero />
          <Services />
          <Products />
          <Packaging />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}