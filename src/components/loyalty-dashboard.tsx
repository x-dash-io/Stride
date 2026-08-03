'use client'

import { Gift, Zap, Award, TrendingUp, Crown, Star, Medal, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface LoyaltyDashboardProps {
  userId: string
  totalSpent: number
  ordersCount: number
}

export default function LoyaltyDashboard({
  userId,
  totalSpent,
  ordersCount,
}: LoyaltyDashboardProps) {
  const getTier = (spent: number) => {
    if (spent >= 2000) return { name: 'Platinum', color: 'text-purple-600', icon: Crown }
    if (spent >= 1000) return { name: 'Gold', color: 'text-yellow-600', icon: Star }
    if (spent >= 500) return { name: 'Silver', color: 'text-gray-400', icon: Medal }
    return { name: 'Bronze', color: 'text-orange-600', icon: Award }
  }

  // Calculate reward points
  const rewardPoints = Math.floor(totalSpent * 0.1)
  const tierInfo = getTier(totalSpent)
  const nextTierThreshold = totalSpent >= 2000 ? 2000 : totalSpent >= 1000 ? 2000 : totalSpent >= 500 ? 1000 : 500
  const progressToNextTier = Math.min(100, (totalSpent / nextTierThreshold) * 100)

  return (
    <div className="space-y-8">
      {/* Tier Status */}
      <div className="bg-gradient-to-r from-accent to-accent/80 rounded-lg p-8 text-accent-foreground">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm opacity-90 mb-2">Your Current Tier</p>
            <div className="flex items-center gap-3">
              <tierInfo.icon className="w-10 h-10" />
              <h2 className="text-3xl font-serif font-bold">{tierInfo.name} Member</h2>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm opacity-90">Progress to Next Tier</p>
          <div className="w-full bg-accent-foreground/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-accent-foreground h-full transition-all duration-500"
              style={{ width: `${progressToNextTier}%` }}
            ></div>
          </div>
          <p className="text-sm">
            {formatPrice(nextTierThreshold - totalSpent)} more to reach the next tier
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reward Points */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reward Points</p>
              <p className="text-3xl font-bold text-accent">{rewardPoints}</p>
            </div>
            <Gift className="w-8 h-8 text-accent opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground">
            Earn 1 point for every KES 1,000 spent. Redeem for exclusive rewards!
          </p>
        </div>

        {/* Total Spent */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
              <p className="text-3xl font-bold">{formatPrice(totalSpent)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime value with STRIDE
          </p>
        </div>

        {/* Orders Count */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Orders</p>
              <p className="text-3xl font-bold">{ordersCount}</p>
            </div>
            <Award className="w-8 h-8 text-accent opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground">
            Thank you for your loyalty!
          </p>
        </div>

        {/* Perks */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tier Benefits</p>
              <p className="text-lg font-semibold">{getTierBenefits(tierInfo.name).length} Active</p>
            </div>
            <Zap className="w-8 h-8 text-accent opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground">
            Unlock more benefits as you advance
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h3 className="text-xl font-serif font-bold mb-6">Your Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getTierBenefits(tierInfo.name).map((benefit, idx) => (
            <div key={idx} className="flex gap-3">
              <Check className="w-5 h-5 mt-1 text-accent" />
              <div>
                <p className="font-semibold text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Points */}
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h3 className="text-xl font-serif font-bold mb-4">Ready to Redeem?</h3>
        <p className="text-muted-foreground mb-6">
          You have <span className="font-semibold text-accent">{rewardPoints} points</span> available to redeem for exclusive discounts and rewards.
        </p>
        <Button variant="default">
          View Rewards Store
        </Button>
      </div>
    </div>
  )
}

function getTierBenefits(tier: string) {
  const allBenefits: Record<string, Array<{ title: string; description: string }>> = {
    Bronze: [
      { title: 'Earn Points', description: '1 point per KES 1,000 spent' },
      { title: 'Birthday Bonus', description: '100 bonus points' },
      { title: 'Early Access', description: 'To new collections' },
    ],
    Silver: [
      { title: 'Free Shipping', description: 'On all orders' },
      { title: 'Double Points', description: '2 points per KES 1,000 spent' },
      { title: 'Birthday Bonus', description: '150 bonus points' },
      { title: 'VIP Access', description: 'To exclusive sales' },
      { title: '10% Discount', description: 'On select items' },
    ],
    Gold: [
      { title: 'Express Shipping', description: 'Free on all orders' },
      { title: 'Triple Points', description: '3 points per KES 1,000 spent' },
      { title: 'Birthday Bonus', description: '200 bonus points' },
      { title: 'VIP Access', description: 'To exclusive sales' },
      { title: '15% Discount', description: 'On select items' },
      { title: 'Priority Support', description: '24/7 concierge' },
    ],
    Platinum: [
      { title: 'White Glove Delivery', description: 'Free on all orders' },
      { title: 'Quadruple Points', description: '4 points per KES 1,000 spent' },
      { title: 'Birthday Bonus', description: '500 bonus points' },
      { title: 'VIP Access', description: 'To exclusive sales' },
      { title: '20% Discount', description: 'On all items' },
      { title: 'Priority Support', description: '24/7 concierge' },
      { title: 'Exclusive Events', description: 'Invitation to VIP events' },
      { title: 'Personal Stylist', description: 'Free styling consultations' },
    ],
  }

  return allBenefits[tier] || []
}
