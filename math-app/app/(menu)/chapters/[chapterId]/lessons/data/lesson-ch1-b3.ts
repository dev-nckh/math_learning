// app/lessons/[lessonId]/data/lesson-ch1-b3.ts
export const LessonCh1B3 = {
  id: "ch1-b3",
  title: "Bài 3: Dấu so sánh",
  description: "Học dấu <, >, = và luyện tập",
  slides: [
    {
      id: "s1",
      type: "text",
      title: "Dấu < (bé hơn)",
      body: "Dùng khi số bên trái nhỏ hơn số bên phải.\nVí dụ: 3 < 5",
    },
    {
      id: "s2",
      type: "text",
      title: "Dấu > (lớn hơn)",
      body: "Dùng khi số bên trái lớn hơn số bên phải.\nVí dụ: 7 > 4",
    },
    {
      id: "s3",
      type: "text",
      title: "Dấu = (bằng nhau)",
      body: "Dùng khi hai số bằng nhau.\nVí dụ: 6 = 6",
    },
    {
      id: "q1",
      type: "quiz",
      title: "Thử sức nào!",
      prompt: "Điền dấu đúng: 8 ? 3",
      left: 8,
      right: 3,
      choices: ["<", ">", "="],
      answer: ">",
    },
    {
      id: "q2",
      type: "quiz",
      title: "Câu hỏi tiếp theo",
      prompt: "Điền dấu đúng: 4 ? 4",
      left: 4,
      right: 4,
      choices: ["<", ">", "="],
      answer: "=",
    },
  ],
};
