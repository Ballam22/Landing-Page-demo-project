export type PublicCourse = {
  id: string
  title: string
  thumbnailUrl: string | undefined
  categoryId: string | undefined
  categoryName: string | undefined
  price: number
  avgRating: number
}

export type PublicCategory = {
  id: string
  name: string
  courseCount: number
}

export type PublicReview = {
  id: string
  courseId: string
  courseTitle: string
  rating: number
  comment: string | undefined
  createdAt: string
  user: {
    fullName: string
    avatarUrl: string | undefined
  } | undefined
}

export type PublicBlogPost = {
  id: string
  title: string
  excerpt: string | undefined
  featuredImageUrl: string | undefined
  categoryName: string | undefined
  createdAt: string
}

export type LandingStats = {
  totalCourses: number
  totalStudents: number
  totalReviews: number
  publishedBlogs: number
}
