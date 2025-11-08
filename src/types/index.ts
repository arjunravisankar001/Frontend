export interface PageResponse<T> {
    items: T[]; //actual content
    page: number; //current page number (0-indexed)
    size: number; //number of items per page
    totalItems: number; //total number of items across all pages
    totalPages: number; //total number of pages
};

export interface Session {
    id: string; //Unique identifier of the session
    creatorId: string; //Username of the session creator
    title: string; //Session title
    start: string; //Session start date and time (as Date object)
    duration: number; //Duration in minutes
    tags: string[]; //Tags applicable to the session
    meetingLink: string; //Meeting link
    resourcesLink: string; //Link to folder containing resources related to the session
};

export interface CreateSessionRequest {
    creatorId: string;
    title: string;
    start: string;
    duration: number;
    tags: string[];
    meetingLink: string;
    resourcesLink: string;
};

export interface SearchSessionRequest {
    creatorId?: string; //optional, non-empty if present
    titleContains?: string; //optional, non-empty if present
    startAfter?: string; //ISO date string (or Date)
    startBefore?: string; //ISO date string (or Date)
    minDuration?: number; //optional, must be >=1 if present
    maxDuration?: number; //optional, must be >=1 if present
    tagsInclude?: string[]; //optional, at least one tag must be present
    page?: number; //optional, >=0
    size?: number; //optional, 1<=size<=100
    sortBy?: "start"|"duration"|"title"|"creator_id"; //optional
    sortOrder?: "asc"|"desc"; //optional
};

export interface UpdateSessionRequest {
    title?: string; //optional, non-empty if present
    start?: string; //optional, must be in the future
    duration?: number; //optional, must be positive if present
    tags?: string[]; //optional, at least one tag must be present
    meetingLink?: string; //optional, non-empty if present
    resourcesLink?: string; //optional, non-empty if present
};

export interface Rarf {
    sessionId: string; //session ID
    userId: string; //username of the respondent
    feedbackFilled: boolean; //whether the feedback form was filled
    rating: number; //overall session rating
    understandableScore: number; //clarity of delivery and content complexity
    confidenceScore: number; //practical retention and applicability
    expectationsScore: number; //was it what was signed up for
    engagementScore: number; //speaker/presenter and content interaction
    organizationScore: number; //session flow, time management and logical progression
    relevanceScore: number; //topic-target fit
    presenterScore: number; //speaker performance
    paceScore: number; //too fast, too slow or just right
    mostValuable: string; //what was most valuable about the session
    suggestions: string; //suggestions for improvement
};

export interface RegistrationRequest {
    sessionId: string;
    userId: string;
};

export interface FillFeedbackRequest {
    rating: number;
    understandableScore: number;
    confidenceScore: number;
    expectationsScore: number;
    engagementScore: number;
    organizationScore: number;
    relevanceScore: number;
    presenterScore: number;
    paceScore: number;
    mostValuable: string;
    suggestions: string;
};

interface StatSummary {
  min: number;
  max: number;
  avg: number;
  median: number;
  mode: number;
};

export interface Stats {
  sessionId: string;
  rating: StatSummary;
  understandableScore: StatSummary;
  confidenceScore: StatSummary;
  expectationsScore: StatSummary;
  engagementScore: StatSummary;
  organizationScore: StatSummary;
  relevanceScore: StatSummary;
  presenterScore: StatSummary;
  paceScore: StatSummary;
};

export interface User {
    name: string;
    username: string;
    emailId: string;
    skillTagList: string[];
    qualificationList: string[];
    resumeLink: string;
    teachList: string[];
    learnList: string[];
    selfAccess: boolean;
};

export interface SearchQueryUser {
    nameSubstring: string;
    teachList: string[];
    learnList: string[];
};

export interface AuthResponse {
    token: string;
    refreshToken: string;
    username: string;
    issuedAt: string;
    expiresAt: string;
    message: string;
};

export interface LoginRequest {
    username: string;
    password: string;
};

export interface SignupRequest {
    username: string;
    password: string;
};

export interface UpdatePasswordRequest {
    username: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export interface GenericResponse {
    message: string;
    username: string;
    timestamp: string;
};

export interface ValidationResponse {
    valid: boolean;
    username: string;
    message: string;
};

export interface Health {
    status: string;
    service: string;
    timestamp: string;
};