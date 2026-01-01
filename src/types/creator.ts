// Creator Economy Types
export interface Creator {
  id: number;
  creatorHandle: string;
  bio: string;
  specialties: string;
  followerCount: number;
  contentCount: number;
  totalViews: number;
  totalEarnings: string; // BigDecimal as string
  monthlyEarnings: string;
  engagementRate: string;
  averageRating: string;
  tier: CreatorTier;
  applicationStatus: ApplicationStatus;
  isActive: boolean;
  applicationDate?: string;
  approvalDate?: string;
}

export enum CreatorTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface CreatorContent {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  contentType: ContentType;
  contentUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
  durationSeconds?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isPublished: boolean;
  isMonetized: boolean;
  moderationStatus: ModerationStatus;
  createdAt: string;
  publishedAt?: string;
}

export enum ContentType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  ARTICLE = 'ARTICLE',
  RECIPE = 'RECIPE',
  WORKOUT = 'WORKOUT'
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Brand {
  id: number;
  name: string;
  brandHandle: string;
  description: string;
  industry: Industry;
  website?: string;
  logoUrl?: string;
  contactEmail: string;
  monthlyBudget: string;
  totalCampaigns: number;
  successfulCampaigns: number;
  successRate: string;
  averageRoi: string;
  brandRating: string;
  accountStatus: AccountStatus;
  isVerified: boolean;
}

export enum Industry {
  FITNESS_EQUIPMENT = 'FITNESS_EQUIPMENT',
  SUPPLEMENTS = 'SUPPLEMENTS',
  HEALTHY_FOOD = 'HEALTHY_FOOD',
  SPORTSWEAR = 'SPORTSWEAR',
  WELLNESS = 'WELLNESS',
  OTHER = 'OTHER'
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export interface BrandCollaboration {
  id: number;
  brandId: number;
  creatorId: number;
  collaborationType: CollaborationType;
  title: string;
  description: string;
  requirements?: string;
  deliverables?: string;
  budget: string;
  creatorFee: string;
  platformFee: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  targetMetrics?: string;
  actualMetrics?: string;
  aiMatchScore: string;
  status: CollaborationStatus;
  paymentStatus: PaymentStatus;
  brandRating?: number;
  creatorRating?: number;
  brandFeedback?: string;
  creatorFeedback?: string;
  createdAt: string;
}

export enum CollaborationType {
  SPONSORED_POST = 'SPONSORED_POST',
  PRODUCT_REVIEW = 'PRODUCT_REVIEW',
  BRAND_AMBASSADOR = 'BRAND_AMBASSADOR',
  AFFILIATE = 'AFFILIATE',
  EVENT_PROMOTION = 'EVENT_PROMOTION'
}

export enum CollaborationStatus {
  PROPOSED = 'PROPOSED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Request/Response DTOs
export interface CreatorApplicationRequest {
  creatorHandle: string;
  bio: string;
  specialties: string[];
}

export interface CreateContentRequest {
  title: string;
  description: string;
  contentType: ContentType;
  tags: string[];
  durationSeconds?: number;
}

export interface CreatorAnalytics {
  creatorId: number;
  totalFollowers: number;
  totalViews: number;
  totalContent: number;
  totalEarnings: string;
  monthlyEarnings: string;
  engagementRate: string;
  averageRating: string;
  tier: CreatorTier;
}

export interface TrendingContent {
  content: CreatorContent[];
  timeframe: string;
}