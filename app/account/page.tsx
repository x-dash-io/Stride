'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import { getProductById } from '@/lib/data/products'
import { getUserOrders } from '@/lib/data/orders'
import { LogOut, Settings, Package, Heart, MapPin, Edit2 } from 'lucide-react'

type Tab = 'overview' | 'orders' | 'favorites' | 'addresses' | 'settings'

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isEditing, setIsEditing] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="container-max py-24 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Please sign in</h1>
        <button
          onClick={() => router.push('/auth/login')}
          className="btn-primary"
        >
          Sign In
        </button>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const orders = getUserOrders(user.id)
  const favorites = user.favorites || []

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Settings className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-5 h-5" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="container-max py-12 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-foreground flex items-center justify-center text-white text-2xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-serif font-bold mb-1">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-4xl font-serif font-bold mb-8">Your Account</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Favorite Items</p>
                  <p className="text-3xl font-bold">{favorites.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground mb-2">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h2 className="text-2xl font-serif font-bold mb-6">Recent Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-accent font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="font-semibold mb-1">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-accent mb-2">
                            ${order.totalPrice.toFixed(2)}
                          </p>
                          <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-3 py-1 rounded-full">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-4xl font-serif font-bold mb-8">Order History</h1>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6">No orders yet</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="btn-primary"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-accent font-medium">Order #{order.id}</p>
                            <p className="text-lg font-serif font-bold">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-accent">
                              ${order.totalPrice.toFixed(2)}
                            </p>
                            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-3 py-1 rounded-full mt-2">
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="p-6 space-y-4">
                        {order.items.map((item) => (
                          <div key={`${item.productId}-${item.color}`} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                              👟
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.color} · Size {item.size}
                              </p>
                              <p className="text-sm">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h1 className="text-4xl font-serif font-bold mb-8">Your Favorites</h1>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6">No favorites yet</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="btn-primary"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map((productId) => {
                    const product = getProductById(productId)
                    if (!product) return null
                    const price = product.salePrice || product.price

                    return (
                      <div
                        key={productId}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
                      >
                        <div className="aspect-square bg-muted flex items-center justify-center text-5xl">
                          👟
                        </div>
                        <div className="p-6">
                          <p className="text-sm text-accent font-medium mb-1">{product.brand}</p>
                          <h3 className="text-lg font-serif font-bold mb-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              {product.salePrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  ${product.price.toFixed(2)}
                                </p>
                              )}
                              <p className="text-xl font-bold text-accent">
                                ${price.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => router.push(`/products/${productId}`)}
                              className="btn-accent px-4"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-serif font-bold">Saved Addresses</h1>
                <button className="btn-primary">Add Address</button>
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {user.addresses.map((address, idx) => (
                    <div
                      key={idx}
                      className={`bg-card border-2 rounded-lg p-6 ${
                        address.isDefault ? 'border-accent' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif font-bold text-lg mb-2">
                            {address.fullName}
                          </h3>
                          {address.isDefault && (
                            <span className="inline-block bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full">
                              Default Address
                            </span>
                          )}
                        </div>
                        <button className="text-accent hover:bg-muted p-2 rounded transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zipCode}
                        <br />
                        {address.country}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6">No addresses yet</p>
                  <button className="btn-primary">Add Your First Address</button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-4xl font-serif font-bold mb-8">Account Settings</h1>

              <div className="space-y-8">
                {/* Personal Info */}
                <div className="bg-card border border-border rounded-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold">Personal Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold block mb-2">Name</label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user.email}
                          className="input-base"
                        />
                      </div>
                      <button className="btn-primary">Save Changes</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-semibold">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferences */}
                <div className="bg-card border border-border rounded-lg p-8">
                  <h2 className="text-2xl font-serif font-bold mb-6">Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Receive promotional emails</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Receive order updates</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Receive new collection notifications</span>
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-8">
                  <h2 className="text-2xl font-serif font-bold mb-2 text-red-900 dark:text-red-100">
                    Danger Zone
                  </h2>
                  <p className="text-red-800 dark:text-red-200 text-sm mb-6">
                    These actions cannot be undone.
                  </p>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
