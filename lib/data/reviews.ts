export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  text: string
  date: string
  helpful: number
}

const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    author: 'Sarah M.',
    rating: 5,
    text: 'Amazing shoes! Incredibly comfortable for all-day wear. The quality is outstanding and the design is sleek and modern. Highly recommend!',
    date: '2024-08-15',
    helpful: 24,
  },
  {
    id: '2',
    productId: '1',
    author: 'James K.',
    rating: 4,
    text: 'Great shoes overall. A bit tight initially but loosened up after a few wears. Very responsive and perfect for running.',
    date: '2024-08-10',
    helpful: 18,
  },
  {
    id: '3',
    productId: '1',
    author: 'Emma R.',
    rating: 5,
    text: 'Best purchase ever! These shoes are so lightweight and provide excellent support. I wear them every day now.',
    date: '2024-08-05',
    helpful: 32,
  },
  {
    id: '4',
    productId: '2',
    author: 'Michael T.',
    rating: 5,
    text: 'Premium quality! The craftsmanship is evident from the moment you unbox them. Worth every penny.',
    date: '2024-08-12',
    helpful: 15,
  },
  {
    id: '5',
    productId: '2',
    author: 'Alex P.',
    rating: 4,
    text: 'Good shoes but sizing runs a bit small. Otherwise very comfortable and stylish.',
    date: '2024-08-08',
    helpful: 12,
  },
  {
    id: '6',
    productId: '3',
    author: 'Lisa W.',
    rating: 5,
    text: 'Perfect for both gym and casual wear. Great design and super comfortable!',
    date: '2024-08-14',
    helpful: 28,
  },
  {
    id: '7',
    productId: '4',
    author: 'David N.',
    rating: 4,
    text: 'Solid shoes with great arch support. Perfect for athletes and everyday use.',
    date: '2024-08-11',
    helpful: 20,
  },
  {
    id: '8',
    productId: '5',
    author: 'Rachel G.',
    rating: 5,
    text: 'Absolutely love these! The color is vibrant and the fit is perfect. Best shoes I own.',
    date: '2024-08-09',
    helpful: 35,
  },
  {
    id: '9',
    productId: '6',
    author: 'Chris L.',
    rating: 5,
    text: 'Excellent quality and style. These shoes turn heads wherever I go!',
    date: '2024-08-13',
    helpful: 22,
  },
]

export function getProductReviews(productId: string): Review[] {
  return reviews.filter((review) => review.productId === productId)
}

export function addReview(
  productId: string,
  author: string,
  rating: number,
  text: string
): Review {
  const review: Review = {
    id: String(reviews.length + 1),
    productId,
    author,
    rating,
    text,
    date: new Date().toISOString().split('T')[0],
    helpful: 0,
  }
  reviews.push(review)
  return review
}
