export type MathQuestion = {
    question: string;
    answer: number;
};

export const generateRandomQuestion = (): MathQuestion => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isAddition = Math.random() > 0.5;

    return {
        question: isAddition ? `${a} + ${b}` : `${a + b} - ${b}`,
        answer: isAddition ? a + b : a + b - b,
    };
};
