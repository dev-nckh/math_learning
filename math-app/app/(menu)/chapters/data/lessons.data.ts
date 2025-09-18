// lessonsData.ts - Lessons and games data structure

export interface GameData {
  id: number;
  title: string;
  type: string;
  difficulty: string;
  description?: string;
}

export interface LessonData {
  title: string;
  description: string;
  games: GameData[];
}

export interface ChapterData {
  [lessonId: number]: LessonData;
}

export interface LessonsDataStructure {
  [chapterId: number]: ChapterData;
}

export const lessonsData: LessonsDataStructure = {
  1: { // Chapter 1
    1: {
      title: "Bài 1: Đếm từ 1 đến 10",
      description: "Học cách đếm các số từ 1 đến 10 thông qua trò chơi",
      games: [
        { id: 1, title: "Đếm quả táo", type: "counting", difficulty: "Dễ" },
        { id: 2, title: "Ghép số với hình", type: "matching", difficulty: "Dễ" },
        { id: 3, title: "Sắp xếp số", type: "sorting", difficulty: "Trung bình" },
      ]
    },
    2: {
      title: "Bài 2: Đếm từ 10 đến 20",
      description: "Mở rộng khả năng đếm lên số 20",
      games: [
        { id: 1, title: "Đếm kẹo", type: "counting", difficulty: "Dễ" },
        { id: 2, title: "Tìm số thiếu", type: "puzzle", difficulty: "Trung bình" },
      ]
    }
  },
  2: { // Chapter 2
    1: {
      title: "Bài 1: Phép cộng và trừ cơ bản",
      description: "Học phép cộng và phép trừ với số nhỏ từ 1 đến 10",
      games: [
        { id: 1, title: "Phép cộng từ 1-10", type: "addition", difficulty: "Dễ" },
        { id: 2, title: "Phép trừ từ 1-10", type: "subtraction", difficulty: "Dễ" },
        { id: 3, title: "Học ...", type: "racing", difficulty: "Khó" },
      ]
    }
  },
  3: { // Chapter 3
    1: {
      title: "Bài 2: Điểm và đoạn thẳng",
      description: "Học cách vẽ điểm và đoạn thẳng",
      games: [
        { id: 1, title: "Vẽ điểm và đoạn thẳng", type: "draw", difficulty: "Dễ" },

      ]
    }
  },
  4: { // Chapter 4
    1: {
      title: "Bài 4: Phép cộng và trừ phạm vi 100",
      description: "Học phép cộng và phép trừ phạm vi từ 1 đến 100",
      games: [
        { id: 1, title: "Phép cộng từ 1-100", type: "addition100", difficulty: "Trung bình" },
        { id: 2, title: "Phép trừ từ 1-100", type: "subtraction100", difficulty: "Trung bình" },

      ]
    }
  }
}

export const chapterData = {
  '1': {
    title: 'Học đếm số',
    lessons: [
      { id: '1', title: 'Bài 1: Điểm và đoạn thẳng', description: 'Giúp bé biết cách vẽ điểm và đoạn thẳng', completed: false },
      { id: '2', title: 'Bài 2: Đếm từ 6-10', description: 'Tiếp tục đếm số', completed: false },
      { id: '3', title: 'Bài 3: Ôn tập 1-10', description: 'Ôn tập tổng hợp', completed: false },
    ]
  },
  '2': {
    title: 'Phép cộng',
    lessons: [
      { id: '1', title: 'Bài 1: Phép cộng cơ bản', description: 'Học cộng hai số trong phạm vi 10', completed: false },
      { id: '2', title: 'Bài 2: Cộng có nhớ', description: 'Phép cộng có nhớ đơn giản', completed: false },
      { id: '3', title: 'Bài 3: Bài tập thực hành', description: 'Luyện tập phép cộng', completed: false },
    ]
  },
  '3': {
    title: 'Các số trong phạm vi 100. Đo độ dài, giải bài toán',
    lessons: [
      { id: '1', title: 'Bài 1: Đếm số đến 100', description: 'Học đếm và viết số từ 1-100', completed: false },
      { id: '2', title: 'Bài 2: Đo độ dài', description: 'Sử dụng thước để đo độ dài', completed: false },
      { id: '3', title: 'Bài 3: Giải bài toán có lời văn', description: 'Đọc hiểu và giải bài toán', completed: false },
      { id: '4', title: 'Bài 4: Ôn tập tổng hợp', description: 'Ôn tập các kiến thức đã học', completed: false },
    ]
  },
  '4': {
    title: 'Phép cộng trừ trong phạm vi 100. Đo thời gian',
    lessons: [
      { id: '1', title: 'Bài 1: Cộng trừ trong phạm vi 100', description: 'Phép tính cộng trừ với số lớn', completed: false },
      { id: '2', title: 'Bài 2: Đọc đồng hồ', description: 'Học cách đọc giờ trên đồng hồ', completed: false },
      { id: '3', title: 'Bài 3: Đo thời gian', description: 'Sử dụng đồng hồ để đo thời gian', completed: false },
      { id: '4', title: 'Bài 4: Bài tập tổng hợp', description: 'Kết hợp cộng trừ và thời gian', completed: false },
    ]
  }
};