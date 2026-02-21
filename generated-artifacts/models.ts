// TypeScript interfaces for collaborative code review system
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'reviewer' | 'developer';
  createdAt: Date;
  lastActive: Date;
}

export interface CodeReview {
  id: string;
  title: string;
  description: string;
  author: User;
  reviewers: User[];
  status: 'draft' | 'open' | 'under_review' | 'approved' | 'rejected';
  pullRequestUrl?: string;
  repository: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  author: User;
  filePath: string;
  lineNumber: number;
  content: string;
  type: 'comment' | 'suggestion' | 'issue';
  status: 'open' | 'resolved' | 'dismissed';
  aiSuggestions?: AISuggestion[];
  createdAt: Date;
}

export interface AISuggestion {
  id: string;
  type: 'improvement' | 'bug_fix' | 'security' | 'performance';
  description: string;
  codeSnippet?: string;
  confidence: number;
  applied: boolean;
}