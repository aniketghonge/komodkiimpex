import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ChevronDown, ChevronUp, CheckCircle, Package, Box, Layers } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Product } from '@/lib/supabase'
import { STORAGE_BASE_URL } from '@/lib/config'

type Props = { 
  category: string 
  categoryName: string
}

export default function ProductCategoryPage({ category, categoryName }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryImage, setCategoryImage] = useState<string | undefined>(undefined)
  const [categoryDesc, setCategoryDesc] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchCategoryMeta()
  }, [category])

  useEffect(() => {
    // If a typeId was passed via query (from homepage links), prefer it.
    const typeId = (router.query?.typeId as string) || undefined
    fetchProducts(typeId)
  }, [category, router.query?.typeId])

  const fetchProducts = async (typeId?: number | string) => {
    try {
      const qs = typeId ? `?typeId=${typeId}` : ''
      const response = await fetch(`/api/products/${category}${qs}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }

      // Normalize product images (prefer product_image1 and product_image2)
      const mapped = (data.products || []).map((p: any) => {
        const image1 = p.product_image1 || p.product_img || p.image || p.details?.image
        const image2 = p.product_image2 || (Array.isArray(p.details?.images) && p.details.images[1])

        const image = image1 ? (typeof image1 === 'string' && !/^https?:\/\//i.test(image1) ? `${STORAGE_BASE_URL}${image1}` : image1) : undefined
        const imageB = image2 ? (typeof image2 === 'string' && !/^https?:\/\//i.test(image2) ? `${STORAGE_BASE_URL}${image2}` : image2) : undefined

        // Parse specs JSON if present
        let specsObj: any = p.product_specs || {}
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj) } catch { try { specsObj = JSON.parse(String(specsObj).replace(/[\r\n]/g, '')) } catch { specsObj = {} } }
        }

        const details = p.details || {}

        return {
          ...p,
          image,
          imageB,
          specsObj,
          details,
          // Bind canonical fields from RPC
          name: p.product_name || p.name,
          short_description: p.product_desc || p.short_description || p.short,
          product_specs: specsObj || p.product_specs || null,
          product_usage: p.product_usage || null
        }
      })

      setProducts(mapped)

      // If packaging not already fetched via category metadata, try fetching by scanning product type ids from loaded products
      try {
        const foundTypeId = mapped?.[0]?.product_type_id || mapped?.[0]?.producttype_id || mapped?.[0]?.producttypeid || mapped?.[0]?.type_id
        if (foundTypeId && !packagingData) {
          // ensure we fetch packaging for this type id
          fetchPackagingForCategory(String(foundTypeId))
        }
      } catch (e) {
        // ignore
      }

    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
      // Fallback to static data (single-column simplified) — include required Product fields
      const fallback: Product[] = [{
        id: 'fallback-1',
        name: 'Fallback Product',
        short_description: 'Static fallback product',
        category_id: String(category || ''),
        details: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]
      setProducts(fallback)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryMeta = async () => {
    try {
      const res = await fetch('/api/product-categories')
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to fetch categories')

      const categories = (json.categories || []) as any[]
      // Try to match by slug first, then by numeric id (some links pass the type id)
      let found = categories.find((c: any) => c.slug === category)
      if (!found && category && /^\d+$/.test(String(category))) {
        found = categories.find((c: any) => String(c.id) === String(category))
      }

      if (found) {
        setCategoryDesc(found.description)
        // Don't display product-type image on listing (we only show product images)
        // Fetch products (prefer RPC by type id) and packaging for this product type
        fetchProducts(found.id)
        fetchPackagingForCategory(found.id)
      } else if (category && /^\d+$/.test(String(category))) {
        // Category was provided as a numeric type id directly — fetch by that id
        fetchProducts(String(category))
        fetchPackagingForCategory(String(category))
      }
    } catch (err) {
      // not critical
      console.warn('Category meta fetch failed:', err)
    }
  }

  const [packagingData, setPackagingData] = useState<any | null>(null)

  const fetchPackagingForCategory = async (productTypeId: string) => {
    try {
      // Use server API that returns only rows for this typeId (safer and faster)
      const res = await fetch(`/api/packaging?typeId=${productTypeId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to fetch packaging')
      let rows = json.packaging || []

      // If no rows returned for the type, request the full set and filter locally (cached on server)
      if (!rows.length) {
        const allRes = await fetch('/api/packaging?all=1')
        const allJson = await allRes.json()
        if (allRes.ok) {
          rows = (allJson.packaging || []).filter((r: any) => String(r.product_type_id) === String(productTypeId))
        }
      }

      if (!rows.length) {
        setPackagingData(null)
        return
      }

      const grouped: Record<string, any> = { types: [] }
      rows.forEach((row: any) => {
        let specsObj: any = row.pkg_specs || {}
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj) } catch { try { specsObj = JSON.parse(String(specsObj).replace(/\r\n|\n/g, '')) } catch { specsObj = {} } }
        }

        // Prefer spec1/2/3 fields, otherwise collect values
        let specs = []
        if (typeof specsObj === 'object') {
          specs = [specsObj.spec1, specsObj.spec2, specsObj.spec3].filter(Boolean)
          if (specs.length === 0) {
            specs = Object.values(specsObj).filter(Boolean).map((v: any) => String(v))
          }
        }

        grouped.types.push({ name: row.pkg_type, specs })
      })

      // Choose gradient by category name fallback
      const gradientMap: Record<string, string> = { 'minerals': 'from-blue-600 to-purple-600', 'hardware': 'from-orange-600 to-red-600', 'petroleum-jelly': 'from-teal-600 to-green-600' }
      const iconMap: Record<string, any> = { 'minerals': Package, 'hardware': Box, 'petroleum-jelly': Layers }
      const pkg = {
        name: categoryName,
        gradient: gradientMap[category] || 'from-blue-600 to-purple-600',
        icon: iconMap[category] || Package,
        types: grouped.types
      }

      setPackagingData(pkg)
    } catch (err) {
      console.warn('Failed to fetch packaging for category:', err)
      setPackagingData(null)
    }
  }



  // Map categories to packaging data
  const packagingMap: Record<string, { name: string; gradient: string; icon: any; types: any[] }> = {
    'minerals': {
      name: 'Minerals',
      gradient: 'from-blue-600 to-purple-600',
      icon: Package,
      types: [
        { name: 'Bulk Bags', specs: ['500kg-2000kg capacity', 'UV resistant', 'Moisture proof liner'] },
        { name: 'Drums', specs: ['50kg-200kg capacity', 'Air-tight sealing', 'Stackable design'] },
        { name: 'Containers', specs: ['20ft & 40ft options', 'Climate controlled', 'Secure loading'] },
      ],
    },
    'hardware': {
      name: 'Hardware',
      gradient: 'from-orange-600 to-red-600',
      icon: Box,
      types: [
        { name: 'Carton Boxes', specs: ['Multi-layer protection', 'Custom sizes available', 'Water resistant'] },
        { name: 'Wooden Crates', specs: ['ISPM 15 certified', 'Load: up to 1000kg', 'Fumigation treated'] },
        { name: 'Pallet Packaging', specs: ['Standard & Euro pallets', 'Strapping & protection', 'Forklift compatible'] },
      ],
    },
    'petroleum-jelly': {
      name: 'Petroleum Jelly',
      gradient: 'from-teal-600 to-green-600',
      icon: Layers,
      types: [
        { name: 'Plastic Containers', specs: ['50g-5kg sizes', 'Tamper-proof seals', 'FDA approved material'] },
        { name: 'Metal Tins', specs: ['100g-1kg capacity', 'Air-tight closure', 'Recyclable material'] },
        { name: 'Bulk Drums', specs: ['25kg-200kg capacity', 'Food-safe lining', 'Easy dispensing'] },
      ],
    },
  }

  // Only use dynamic packaging; do not fallback to hardcoded map
  const packaging = packagingData || null
  const headingGradient = 'bg-gradient-to-r ' + (packaging?.gradient || packagingMap[category]?.gradient || 'from-blue-600 to-orange-500')

  return (
    <>
      <Head>
        <title>{categoryName} - Komodki Impex</title>
        <meta name="description" content={`Browse our ${categoryName.toLowerCase()} products. Quality export solutions from Komodki Impex.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white bg-surface">
        <Header />
        <main>
          <section className="bg-white bg-surface min-h-[60vh]">
            <div className="max-w-6xl mx-auto px-4 py-20 mt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className={`text-4xl md:text-5xl font-bold leading-relaxed mb-2 bg-clip-text text-transparent ${headingGradient}`}>{categoryName}</h1>
                  <p className="text-lg text-gray-600 mt-2">{categoryDesc || `Browse products in the ${categoryName.toLowerCase()} category.`}</p>
                </div>


              </div>

              {loading ? (
                <div className="space-y-6 mb-16">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-56 bg-gray-200 w-full" />
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 mb-16">
                  {products.map((p, i) => (
                    <ProductCard key={p.id || i} product={p} category={category} />
                  ))}
                  {products.length === 0 && (
                    <div className="p-12 bg-gray-50 rounded-xl text-center text-gray-500">
                      {error ? `Error: ${error}` : 'No products found for this category.'}
                    </div>
                  )}
                </div>
              )}

              {/* Product-specific Packaging Card */}
              {packaging ? (
                <div className="mt-20 pt-16 border-t border-gray-200">
                  <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Professional Packaging</h2>
                  <PackagingCard packaging={packaging} />
                </div>
              ) : (
                <div className="mt-20 pt-16 border-t border-gray-200 text-center text-gray-500">
                  <p>No packaging information is available for this product type.</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}

function ProductCard({ product, category }: { product: any, category: string }) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  const images = [product.image].filter(Boolean) as string[]
  if (product.imageB) images.push(product.imageB)

  // Auto-advance slideshow for cards that have multiple images
  useEffect(() => {
    if (images.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000)
    return () => clearInterval(t)
  }, [images.length])

  // Helper to render specs table from JSON or object
  const renderSpecs = (specs: any) => {
    if (!specs) return null
    let obj: any = specs
    if (typeof specs === 'string') {
      try { obj = JSON.parse(specs) } catch { try { obj = JSON.parse(String(specs).replace(/\r\n|\n/g, '')) } catch { obj = null } }
    }
    if (!obj || typeof obj !== 'object') return (<pre className="text-sm text-gray-700 bg-gray-50 rounded p-3 mt-2 overflow-auto">{String(specs)}</pre>)

    return (
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Specifications</h4>
        <div className="overflow-auto border rounded bg-gray-50 p-3">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(obj).map(([k, v]) => (
                <tr key={k} className="odd:bg-white even:bg-gray-50">
                  <td className="py-1 pr-4 font-medium text-gray-700 w-40">{k}</td>
                  <td className="py-1 text-gray-700">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <article className="group bg-white bg-surface rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Left: square image block (card-shaped, matches product-type aesthetic) */}
        <div className="w-full md:w-80 h-80 aspect-square relative rounded-2xl overflow-hidden bg-neutral-800 text-white flex-shrink-0">
          {images.length ? (
            images.map((src, i) => (
              <div
                key={i}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url(${src})` } as any}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-neutral-800 flex items-center justify-center">
              <div className="text-sm text-white/80 px-4">No image available</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Optional slide controls centered vertically */}
          {images.length > 1 && (
            <>
              <button aria-label="Previous" onClick={() => setIdx((idx + images.length - 1) % images.length)} className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">‹</button>
              <button aria-label="Next" onClick={() => setIdx((idx + 1) % images.length)} className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full">›</button>
            </>
          )}
        </div>

        {/* Right: title, description and corner "Know more" */}
        <div className="md:flex-1 w-full p-6 flex flex-col justify-between relative">
          <div>
            <h3 className="text-3xl font-extrabold mb-3 text-gray-900">{product.name}</h3>
            <p className="text-lg text-gray-600 mb-4">{product.short_description || product.short}</p>
          </div>

          <div className="absolute top-4 right-4 md:static">
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="text-sm text-orange-600 font-medium inline-flex items-center gap-2"
            >
              {open ? (<><ChevronUp className="w-4 h-4" /> Know more</>) : (<><ChevronDown className="w-4 h-4" /> Know more</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable section that spans the full card width and appears below image+description */}
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 border-t border-gray-100 text-sm text-gray-700">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Usage</h4>
            <p className="text-sm text-gray-700">{product.product_usage ? String(product.product_usage) : 'Usage information not provided. Please contact us for details.'}</p>
          </div>

          {renderSpecs(product.product_specs)}
        </div>
      </div>
    </article>
  )
}

function PackagingCard({ packaging }: { packaging: any }) {
  const Icon = packaging.icon
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${packaging.gradient} p-6 text-white flex items-center gap-4`}>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold">{packaging.name}</h3>
          <p className="text-white/90">Packaging Options & Specifications</p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {packaging.types.map((type: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">{type.name}</h4>
              </div>
              <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide mb-3">Specifications:</p>
              <ul className="space-y-2">
                {type.specs.map((spec: string, s: number) => (
                  <li key={s} className="flex gap-2 items-start text-sm text-gray-700">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string || null

  // Map slugs to category names
  const categoryMap: Record<string, string> = {
    'minerals': 'MINERALS',
    'hardware': 'HARDWARE', 
    'petroleum-jelly': 'PETROLEUM JELLY'
  }

  const categoryName = category ? (categoryMap[category] || 'Products') : 'Products'

  return {
    props: {
      category: category ?? null,
      categoryName
    }
  }
}