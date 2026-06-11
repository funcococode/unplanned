// ============================================================
// Types — Trip Unplanned
// ============================================================

// ---- Enums ----

export enum TravelStyle {
  BACKPACKER = 'BACKPACKER',
  LUXURY = 'LUXURY',
  ROAD_TRIPPER = 'ROAD_TRIPPER',
  SOLO = 'SOLO',
  DIGITAL_NOMAD = 'DIGITAL_NOMAD',
  WEEKEND_EXPLORER = 'WEEKEND_EXPLORER',
}

export enum TripType {
  ADVENTURE = 'ADVENTURE',
  BACKPACKING = 'BACKPACKING',
  ROAD_TRIP = 'ROAD_TRIP',
  WORKATION = 'WORKATION',
  LEISURE = 'LEISURE',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
}

export enum BudgetRange {
  UNDER_5K = 'UNDER_5K',
  RANGE_5K_10K = 'RANGE_5K_10K',
  RANGE_10K_25K = 'RANGE_10K_25K',
  ABOVE_25K = 'ABOVE_25K',
}

export enum MemberRole {
  CREATOR = 'CREATOR',
  MEMBER = 'MEMBER',
}

export enum JoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ---- User ----

export interface UserDto {
  id: string;
  email: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  travelStyle: TravelStyle | null;
  languages: string[];
  instagram: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserDto {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  travelStyle: TravelStyle | null;
  languages: string[];
  instagram: string | null;
  tripsCreated: number;
  tripsJoined: number;
  createdAt: string;
}

export interface UpdateUserDto {
  username?: string;
  bio?: string;
  city?: string;
  country?: string;
  travelStyle?: TravelStyle;
  languages?: string[];
  instagram?: string;
  phone?: string;
}

// ---- Trip ----

export interface TripDto {
  id: string;
  creatorId: string;
  creator: PublicUserDto;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange: BudgetRange;
  maxMembers: number;
  currentMemberCount: number;
  tripType: TripType;
  coverImage: string | null;
  meetingPoint: string | null;
  rules: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripSummaryDto {
  id: string;
  creatorId: string;
  creator: Pick<PublicUserDto, 'id' | 'name' | 'username' | 'image'>;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange: BudgetRange;
  maxMembers: number;
  currentMemberCount: number;
  tripType: TripType;
  coverImage: string | null;
  createdAt: string;
}

export interface CreateTripDto {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange: BudgetRange;
  maxMembers: number;
  tripType: TripType;
  coverImage?: string;
  meetingPoint?: string;
  rules?: string;
}

export interface UpdateTripDto {
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budgetRange?: BudgetRange;
  maxMembers?: number;
  tripType?: TripType;
  coverImage?: string;
  meetingPoint?: string;
  rules?: string;
}

// ---- Trip Member ----

export interface TripMemberDto {
  id: string;
  tripId: string;
  userId: string;
  user: Pick<PublicUserDto, 'id' | 'name' | 'username' | 'image' | 'city' | 'country'>;
  role: MemberRole;
}

// ---- Join Request ----

export interface JoinRequestDto {
  id: string;
  tripId: string;
  trip?: TripSummaryDto;
  userId: string;
  user?: Pick<PublicUserDto, 'id' | 'name' | 'username' | 'image' | 'city' | 'country'>;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- Message ----

export interface MessageDto {
  id: string;
  tripId: string;
  senderId: string;
  sender: Pick<PublicUserDto, 'id' | 'name' | 'username' | 'image'>;
  content: string;
  createdAt: string;
}

export interface SendMessageDto {
  content: string;
}

// ---- Dashboard ----

export interface DashboardDto {
  upcomingTrips: TripSummaryDto[];
  tripsCreated: TripSummaryDto[];
  pendingRequests: JoinRequestDto[];
  myJoinRequests: JoinRequestDto[];
}

// ---- Pagination ----

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ---- Trip Filters ----

export interface TripFiltersQuery extends PaginationQuery {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budgetRange?: BudgetRange;
  tripType?: TripType;
  sort?: 'newest' | 'popular';
}

// ---- WebSocket Events ----

export interface WsJoinRoomPayload { tripId: string }
export interface WsMessagePayload  { tripId: string; content: string }
export interface WsMessageEvent    { type: 'message'; data: MessageDto }

// ---- API Error ----

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ---- Label maps ----

export const TRAVEL_STYLE_LABELS: Record<TravelStyle, string> = {
  [TravelStyle.BACKPACKER]:       'Backpacker',
  [TravelStyle.LUXURY]:           'Luxury Traveler',
  [TravelStyle.ROAD_TRIPPER]:     'Road Tripper',
  [TravelStyle.SOLO]:             'Solo Traveler',
  [TravelStyle.DIGITAL_NOMAD]:    'Digital Nomad',
  [TravelStyle.WEEKEND_EXPLORER]: 'Weekend Explorer',
};

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  [TripType.ADVENTURE]:   'Adventure',
  [TripType.BACKPACKING]: 'Backpacking',
  [TripType.ROAD_TRIP]:   'Road Trip',
  [TripType.WORKATION]:   'Workation',
  [TripType.LEISURE]:     'Leisure',
  [TripType.PHOTOGRAPHY]: 'Photography',
};

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  [BudgetRange.UNDER_5K]:       'Under ₹5,000',
  [BudgetRange.RANGE_5K_10K]:   '₹5,000 – ₹10,000',
  [BudgetRange.RANGE_10K_25K]:  '₹10,000 – ₹25,000',
  [BudgetRange.ABOVE_25K]:      '₹25,000+',
};
