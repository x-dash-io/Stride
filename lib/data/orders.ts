export interface OrderItem {
  productId: string
  productName: string
  brand: string
  price: number
  quantity: number
  color: string
  size: string
  image: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shippingAddress: {
    fullName: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  discount?: number
}

const orders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-1',
    items: [
      {
        productId: '1',
        productName: 'AeroStep Pro Running Shoes',
        brand: 'STRIDE',
        price: 169.99,
        quantity: 1,
        color: 'Midnight Black',
        size: '10',
        image: '/products/aerostep-pro.jpg',
      },
    ],
    totalPrice: 185.39,
    status: 'delivered',
    shippingAddress: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    createdAt: '2024-07-15',
    discount: 0,
  },
  {
    id: 'ORD-002',
    userId: 'user-1',
    items: [
      {
        productId: '2',
        productName: 'CloudWalk Urban Sneaker',
        brand: 'STRIDE',
        price: 129.99,
        quantity: 1,
        color: 'Pearl White',
        size: '10',
        image: '/products/cloudwalk.jpg',
      },
      {
        productId: '3',
        productName: 'VelociPace Training Shoe',
        brand: 'STRIDE',
        price: 159.99,
        quantity: 1,
        color: 'Solar Orange',
        size: '10',
        image: '/products/velocipace.jpg',
      },
    ],
    totalPrice: 324.47,
    status: 'shipped',
    shippingAddress: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    createdAt: '2024-08-01',
    discount: 15,
  },
]

export function getUserOrders(userId: string): Order[] {
  return orders.filter((order) => order.userId === userId)
}

export function getOrder(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId)
}

export function createOrder(
  userId: string,
  items: OrderItem[],
  shippingAddress: {
    id: string
    type: string
    fullName: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
  },
  promoCode?: string
): Order {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.09
  const shipping = subtotal >= 200 ? 0 : 10
  let discount = 0

  if (promoCode === 'SAVE10') {
    discount = subtotal * 0.1
  }

  const order: Order = {
    id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
    userId,
    items,
    totalPrice: subtotal + tax + shipping - discount,
    status: 'pending',
    shippingAddress: {
      fullName: shippingAddress.fullName,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
    },
    createdAt: new Date().toISOString().split('T')[0],
    discount,
  }

  orders.push(order)
  return order
}
