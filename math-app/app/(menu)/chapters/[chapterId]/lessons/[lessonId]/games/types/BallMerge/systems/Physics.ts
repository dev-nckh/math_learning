import Matter from "matter-js";

type GameEngineUpdateEvent = {
    time: { delta: number };
};

type BallEntity = {
    body: Matter.Body;
    color: string;
    number: number;
    radius: number;
    merged?: boolean;
    renderer: any;
};

const Physics = (entities: any, { time }: GameEngineUpdateEvent) => {
    const engine: Matter.Engine = entities.physics.engine;
    Matter.Engine.update(engine, time.delta);

    Matter.Events.on(engine, "collisionStart", (event) => {
        const pairs = event.pairs;

        for (const pair of pairs) {
            const { bodyA, bodyB } = pair;

            if (bodyA.label.startsWith("ball") && bodyB.label.startsWith("ball")) {
                const ballA = getBallEntity(entities, bodyA);
                const ballB = getBallEntity(entities, bodyB);

                if (
                    ballA &&
                    ballB &&
                    ballA.color === ballB.color &&
                    !ballA.merged &&
                    !ballB.merged
                ) {
                    const question = `${ballA.number} + ${ballB.number} = ?`;
                    const answer = ballA.number + ballB.number;


                    // Gọi trực tiếp hàm showQuiz từ quizManager
                    entities.quizManager?.showQuiz(question, answer, ballA, ballB);

                    ballA.merged = true;
                    ballB.merged = true;
                }
            }
        }
    });

    return entities;
};

// Helper: tìm bóng dựa trên Matter.Body
const getBallEntity = (entities: any, body: Matter.Body): BallEntity | undefined => {
    return Object.values(entities).find(
        (e: any) => e.body?.id === body.id
    ) as BallEntity | undefined;
};

export default Physics;
