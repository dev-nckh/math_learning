import Matter from "matter-js";

const randomColor = () => {
    const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const createBall = (
    world: Matter.World,
    x: number,
    y: number,
    radius: number,
    id: string,
    color?: string,
    number?: number
) => {
    const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.4,      // Độ nảy (0.4 là thực tế, không nhảy cao quá)
        friction: 0.2,         // Ma sát khi tiếp đất
        frictionAir: 0.03,     // Ma sát không khí, giảm trượt ngang và rung lắc
        density: 0.01,        // Tăng khối lượng để rơi nhanh và có lực hơn
        inertia: Infinity,
        label: id,
    });

    Matter.World.add(world, [body]);

    return {
        id,
        body,
        radius,
        color: color || randomColor(),
        number: number ?? Math.floor(Math.random() * 50) + 1,
    };
};
