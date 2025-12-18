export enum Sender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export enum ExpertMode {
  GENERAL = 'general',
  TAX = 'tax',
  LABOR = 'labor',
  CORPORATE = 'corporate'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isError?: boolean;
  groundingChunks?: GroundingChunk[];
}

export interface CustomKnowledge {
  id: string;
  title: string;
  content: string;
  dateAdded: Date;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  customKnowledge: CustomKnowledge[];
  createdAt: Date;
  lastModified: Date;
  isPinned?: boolean;
}