'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Check, Globe, HelpCircle, Loader2, Upload } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'

interface StoreSettings {
  storeName: string
  storeTagline: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  tiktokUrl: string | null
  twitterUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface StoreSettingsClientProps {
  initialSettings: StoreSettings
}

export function StoreSettingsClient({ initialSettings }: StoreSettingsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form states
  const [storeName, setStoreName] = useState(initialSettings.storeName)
  const [storeTagline, setStoreTagline] = useState(initialSettings.storeTagline || '')
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || '')
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.faviconUrl || '')
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor || '#000000')
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || '')
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || '')
  const [address, setAddress] = useState(initialSettings.address || '')
  const [instagramUrl, setInstagramUrl] = useState(initialSettings.instagramUrl || '')
  const [facebookUrl, setFacebookUrl] = useState(initialSettings.facebookUrl || '')
  const [tiktokUrl, setTiktokUrl] = useState(initialSettings.tiktokUrl || '')
  const [twitterUrl, setTwitterUrl] = useState(initialSettings.twitterUrl || '')
  const [metaTitle, setMetaTitle] = useState(initialSettings.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialSettings.metaDescription || '')

  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    if (type === 'logo') setIsUploadingLogo(true)
    if (type === 'favicon') setIsUploadingFavicon(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', 'temp')
      formData.append('variantId', 'temp')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to upload image')
      }

      if (type === 'logo') setLogoUrl(data.publicUrl)
      if (type === 'favicon') setFaviconUrl(data.publicUrl)
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image')
    } finally {
      setIsUploadingLogo(false)
      setIsUploadingFavicon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)

    const payload = {
      storeName,
      storeTagline: storeTagline || null,
      logoUrl: logoUrl || null,
      faviconUrl: faviconUrl || null,
      primaryColor: primaryColor || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      address: address || null,
      instagramUrl: instagramUrl || null,
      facebookUrl: facebookUrl || null,
      tiktokUrl: tiktokUrl || null,
      twitterUrl: twitterUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    }

    try {
      const csrfRes = await fetch('/api/csrf')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save store settings')
      }

      showToast('success', 'Store settings updated successfully!')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save store settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Store Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your brand details, contact options, social links and SEO defaults</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Branding */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>General Branding</CardTitle>
              <CardDescription>Customize the name, tagline and visual assets of your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. STRIDE"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeTagline">Store Tagline</Label>
                <Input
                  id="storeTagline"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="e.g. Premium Footwear Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Store Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="e.g. https://r2.stride.com/logo.png"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingLogo}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {logoUrl && (
                  <div className="mt-2 relative w-16 h-16 border rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img src={logoUrl} alt="Store Logo Preview" className="object-contain max-w-full max-h-full" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Store Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="faviconUrl"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="e.g. https://r2.stride.com/favicon.ico"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="favicon-upload"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                      className="hidden"
                      disabled={isUploadingFavicon}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingFavicon}
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                    >
                      {isUploadingFavicon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {faviconUrl && (
                  <div className="mt-2 relative w-8 h-8 border rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img src={faviconUrl} alt="Store Favicon Preview" className="object-contain max-w-full max-h-full" />
                  </div>
                )}
              </div>
              {uploadError && <p className="text-sm text-destructive font-medium">{uploadError}</p>}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Specify the business address, phone, and customer support email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Support Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. support@stride.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Support Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1st Floor, Stride Plaza, Nairobi, Kenya"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Social links shown in the footer and main pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram Link</Label>
                <Input
                  id="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/stride"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook Link</Label>
                <Input
                  id="facebookUrl"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/stride"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktokUrl">TikTok Link</Label>
                <Input
                  id="tiktokUrl"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@stride"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter / X Link</Label>
                <Input
                  id="twitterUrl"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/stride"
                />
              </div>
            </CardContent>
          </Card>

          {/* Default Search SEO */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Search Engine Optimization (SEO)</CardTitle>
              <CardDescription>Configure tags that search engines (like Google) read for indexing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Default SEO Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="e.g. STRIDE | Buy Premium Footwear in Kenya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Default SEO Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Specify a descriptive summary of your store shown in search results."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4">
          {success && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
