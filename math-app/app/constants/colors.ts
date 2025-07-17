import { AnswerKey } from '../types';

const getPointColor = (point: AnswerKey): string => {
  const colors: Record<AnswerKey, string> = {
    'A': '#FF6B6B', // Red-orange
    'B': '#4ECDC4', // Teal
    'C': '#FFD166', // Yellow-orange
    'D': '#A78BFA', // Light purple
  };
  return colors[point];
};

export default getPointColor;