import { Question } from '../types';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

 const questions: Question[] = [
  {
    points: ['A', 'B'],
    correctAnswer: 'B',
    description: 'Có bao nhiêu điểm trên màn hình?',
    answers: {
      'A': 'Chỉ có 1 điểm',
      'B': 'Có 2 điểm',
      'C': 'Có 3 điểm',
      'D': 'Có 4 điểm'
    },
    pointPositions: [
      { x: width * 0.3, y: height * 0.3 },
      { x: width * 0.7, y: height * 0.4 }
    ]
  },
  {
    points: ['A', 'B', 'C'],
    correctAnswer: 'C',
    description: 'Đếm xem có mấy điểm nhé!',
    answers: {
      'A': '1 điểm',
      'B': '2 điểm',
      'C': '3 điểm',
      'D': '4 điểm'
    },
    pointPositions: [
      { x: width * 0.2, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.35 },
      { x: width * 0.8, y: height * 0.25 }
    ]
  },
  {
    points: ['A', 'B', 'C', 'D'],
    correctAnswer: 'D',
    description: 'Bé đếm được mấy điểm nào?',
    answers: {
      'A': '1 điểm',
      'B': '2 điểm',
      'C': '3 điểm',
      'D': '4 điểm'
    },
    pointPositions: [
      { x: width * 0.15, y: height * 0.25 },
      { x: width * 0.4, y: height * 0.4 },
      { x: width * 0.65, y: height * 0.3 },
      { x: width * 0.85, y: height * 0.25 }
    ]
  }
];

export default questions;