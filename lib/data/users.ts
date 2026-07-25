import { User } from '../types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    name: 'Alex Johnson',
    phone: '+1 (555) 123-4567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    addresses: [
      {
        id: 'addr-1',
        type: 'shipping',
        fullName: 'Alex Johnson',
        street: '123 Oak Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        isDefault: true,
      },
      {
        id: 'addr-2',
        type: 'billing',
        fullName: 'Alex Johnson',
        street: '456 Main Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'USA',
        isDefault: false,
      },
    ],
    loyaltyPoints: 2450,
    loyaltyTier: 'gold',
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: 'user-2',
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    phone: '+1 (555) 234-5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    addresses: [
      {
        id: 'addr-3',
        type: 'shipping',
        fullName: 'Sarah Smith',
        street: '789 Elm Road',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true,
      },
    ],
    loyaltyPoints: 5820,
    loyaltyTier: 'platinum',
    createdAt: '2022-03-22T14:45:00Z',
  },
]

// Mock auth storage
export const mockAuthTokens: Map<string, string> = new Map()

export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email)
}

export function findUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

export function createUser(
  email: string,
  name: string,
  password: string
): User {
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    addresses: [],
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    createdAt: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  // Store password hash (mock - normally would be hashed)
  mockAuthTokens.set(email, password)
  return newUser
}

export function validateUserPassword(
  email: string,
  password: string
): boolean {
  const storedPassword = mockAuthTokens.get(email)
  return storedPassword === password
}

export function generateAuthToken(userId: string): string {
  // Mock token - in production would be a JWT
  return `token-${userId}-${Date.now()}`
}
