export type AnswerKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  points: AnswerKey[];
  correctAnswer: AnswerKey;
  description: string;
  answers: Record<AnswerKey, string>;
  pointPositions: { x: number; y: number }[];
}

