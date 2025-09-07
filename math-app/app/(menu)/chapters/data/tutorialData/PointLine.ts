interface TutorialStep {
  title: string;
  content: string;
  image: string;
  interactive: boolean;
  demo?: 'point' | 'draw-point' | 'line' | 'draw-line';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Chào bé! 👋",
    content: "Hôm nay chúng ta sẽ học về điểm và đoạn thẳng trong hình học nhé!",
    image: "🎯",
    interactive: false
  },
  {
    title: "Điểm là gì? 🔴",
    content: "Điểm là một vị trí nhỏ xíu trong không gian. Như một chấm nhỏ trên giấy vậy!",
    image: "•",
    interactive: true,
    demo: 'point'
  },
  {
    title: "Thử vẽ điểm nào! ✨",
    content: "Hãy chạm vào màn hình để tạo ra những điểm nhỏ xinh!",
    image: "👆",
    interactive: true,
    demo: 'draw-point'
  },
  {
    title: "Đoạn thẳng là gì? 📏",
    content: "Đoạn thẳng là một đường thẳng nối giữa 2 điểm. Như một sợi dây căng thẳng!",
    image: "━",
    interactive: true,
    demo: 'line'
  },
  {
    title: "Thử vẽ đoạn thẳng! 🎨",
    content: "Kéo ngón tay từ điểm này sang điểm khác để tạo đoạn thẳng nhé!",
    image: "↔️",
    interactive: true,
    demo: 'draw-line'
  },
  {
    title: "Tuyệt vời! 🎉",
    content: "Bây giờ bé đã hiểu về điểm và đoạn thẳng rồi! Hãy bắt đầu chơi game thôi!",
    image: "🏆",
    interactive: false
  }
];