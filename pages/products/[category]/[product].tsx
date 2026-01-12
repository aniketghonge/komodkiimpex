import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { STORAGE_BASE_URL } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Package, Box, Layers, ChevronUp, ChevronDown } from 'lucide-react'

export default function ProductDetailPage() {
  const router = useRouter()
  const { category, product } = router.query as { category?: string; product?: string }
  const [loading, setLoading] = useState(true)
  const [prod, setProd] = useState<any | null>(null)
  const [packaging, setPackaging] = useState<any | null>(null)
  const [openDetails, setOpenDetails] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (!category || !product) return
    fetchProduct()
  }, [category, product])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      // Try resolving the product type id and call get_products(producttype_id) first
      let json: any = null
      try {
        const catRes = await fetch('/api/product-categories')
        const catJson = await catRes.json()
        const foundType = (catJson.categories || []).find((c: any) => c.slug === category)
        if (foundType && foundType.id) {
          const resp = await fetch(`/api/products/${category}?typeId=${foundType.id}`)
          json = await resp.json()
          if (!resp.ok) throw new Error(json.message || 'Failed to fetch products by type')
        }
      } catch (err) {
        console.warn('get_products by type failed, falling back to category RPC:', err)
      }

      // Fallback to category-based RPC if needed
      if (!json) {
        const res = await fetch(`/api/products/${category}`)
        json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Failed to fetch products')
      }

      const items = (json.products || []).map((p: any) => {
        const image1 = p.product_image1 || p.product_img || p.image
        const image2 = p.product_image2 || (Array.isArray(p.details?.images) && p.details.images[1])
        const image = image1 ? (typeof image1 === 'string' && !/^https?:\/\//i.test(image1) ? `${STORAGE_BASE_URL}${image1}` : image1) : undefined
        const imageB = image2 ? (typeof image2 === 'string' && !/^https?:\/\//i.test(image2) ? `${STORAGE_BASE_URL}${image2}` : image2) : undefined

        let specsObj: any = p.product_specs || {}
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj) } catch { try { specsObj = JSON.parse(String(specsObj).replace(/[\r\n]/g, '')) } catch { specsObj = {} } }
        }

        return ({
          ...p,
          slug: p.slug || (p.name ? String(p.name).toLowerCase().replace(/\s+/g, '-') : String(p.id || 'product')),
          image,
          imageB,
          specsObj,
          details: p.details || {},
          name: p.product_name || p.name,
          short_description: p.product_desc || p.short_description || p.short,
          product_specs: specsObj || p.product_specs || null,
          product_usage: p.product_usage || null
        })
      })

      const found = items.find((i: any) => i.slug === String(product))
      if (!found) {
        // fallback: try match by name
        const byName = items.find((i: any) => String(i.name).toLowerCase() === String(product).toLowerCase())
        if (byName) setProd(byName)
        else setProd(null)
      } else {
        setProd(found)
      }

      // Robustly determine product type id from common field names and fetch packaging by that id
      const lookup = found || (json.products || [])[0] || prod
      const typeId = lookup?.producttype_id ?? lookup?.product_type_id ?? lookup?.producttypeid ?? lookup?.product_typeid ?? lookup?.type_id ?? lookup?.product_type ?? lookup?.category_id ?? lookup?.category ?? null
      if (typeId) await fetchPackagingByType(typeId)
    } catch (err) {
      console.error('Failed to load product:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPackagingByType = async (productTypeId: string | number) => {
    try {
      const { data, error } = await supabase.rpc('get_product_packaging')
      if (error) throw error
      const rows = (data || []).filter((r: any) => String(r.product_type_id) === String(productTypeId))
      if (!rows.length) return
      const grouped: any = { name: '', types: [] }
      grouped.name = rows[0].product_type
      rows.forEach((row: any) => {
        let specsObj: any = row.pkg_specs || {}
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj) } catch { try { specsObj = JSON.parse(specsObj.replace(/\r\n|\n/g, '')) } catch { specsObj = {} } }
        }
        const specs: string[] = []
        Object.keys(specsObj || {}).forEach((k) => {
          if (/^spec\d*/i.test(k)) specs.push(String(specsObj[k]).trim())
        })
        if (specs.length === 0) {
          Object.values(specsObj || {}).forEach((v) => { if (v) specs.push(String(v).trim()) })
        }
        grouped.types.push({ name: row.pkg_type, specs })
      })
      setPackaging(grouped)
    } catch (err) {
      console.warn('Packaging fetch failed:', err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!prod) return <div className="min-h-screen flex items-center justify-center">Product not found</div>

  const _images = [prod.image].filter(Boolean) as string[]
  if (prod.imageB) _images.push(prod.imageB)
  const currentImage = _images.length ? _images[imgIdx % _images.length] : null

  return (
    <>
      <Head>
        <title>{prod.name} - Komodki Impex</title>
      </Head>
      <div className="min-h-screen bg-white bg-surface">
        <Header />
        <main className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
              <div className="mb-6">
                <div className="relative rounded-lg overflow-hidden h-64 md:h-96 bg-gray-100 group">
                  {([prod.image].filter(Boolean) || []).length ? (
                    <>
                      <img src={currentImage ? (currentImage.startsWith('http') ? currentImage : `${STORAGE_BASE_URL}${currentImage}`) : undefined} className="w-full h-full object-cover" />

                      {prod.imageB && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 2 - 1) % 2) }} className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full">‹</button>
                          <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % 2) }} className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full">›</button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {[prod.image, prod.imageB].map((_: any, i: number) => (
                              <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} aria-label={`Show slide ${i + 1}`} />
                            ))}
                          </div>
                        </>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                  )}
                </div>

                <div className="mt-4">
                  <h1 className="text-2xl font-bold">{prod.name}</h1>
                  <p className="text-gray-600 mt-2">{prod.short_description || prod.short || ''}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => setOpenDetails(!openDetails)} aria-expanded={openDetails} className="text-sm text-orange-600 font-medium inline-flex items-center gap-2">
                      {openDetails ? (<><ChevronUp className="w-4 h-4" /> Know more</>) : (<><ChevronDown className="w-4 h-4" /> Know more</>)}
                    </button>
                  </div>
                </div>
              </div>

              {openDetails && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-2">Details</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(prod.details || {}).map(([k, v]) => (
                        <tr key={k}>
                          <td className="py-2 font-medium w-40 text-gray-700">{k}</td>
                          <td className="py-2 text-gray-700">{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {prod.product_specs && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Specifications</h4>
                      <pre className="text-sm text-gray-700 bg-gray-50 rounded p-3 mt-2 overflow-auto">{typeof prod.product_specs === 'string' ? prod.product_specs : JSON.stringify(prod.product_specs, null, 2)}</pre>
                    </div>
                  )}

                  {prod.product_usage && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Usage</h4>
                      <p className="text-gray-700">{prod.product_usage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Packaging</h3>
              {packaging ? (
                <div className="space-y-4">
                  {packaging.types.map((t: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded">
                      <h4 className="font-medium mb-2">{t.name}</h4>
                      <ul className="text-sm space-y-1">
                        {t.specs.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700"><CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />{s}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No packaging information available for this product.</p>
              )}
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}