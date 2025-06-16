// Request/Response interfaces
export interface EvaluationRequest {
  question: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface EvaluationResponse {
  question: string;
  sources: Source[];
  answer: boolean;
  hash: string;
  status: 'pending' | 'evaluated' | 'failed';
  tx_hash: string;
  explorer_url: string;
}

// Database entity interfaces
export interface QuestionEntity {
  id: number;
  question_text: string;
  question_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface EvaluationEntity {
  id: number;
  question_id: number;
  answer: boolean;
  status: 'pending' | 'evaluated' | 'failed';
  tx_hash?: string;
  explorer_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SourceEntity {
  id: number;
  evaluation_id: number;
  title: string;
  url: string;
  created_at: Date;
}

// Combined interface for API responses
export interface EvaluationWithSources extends EvaluationEntity {
  question: QuestionEntity;
  sources: SourceEntity[];
}