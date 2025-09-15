import { CollisionDetection, closestCenter } from "@dnd-kit/core";

export const customCollisionDetection: CollisionDetection = (args) => {
  const { droppableContainers } = args;
  const collisions = closestCenter(args);

  // droppable type === "block" 만 허용
  return collisions.filter(c => {
    const container = droppableContainers.find(d => d.id === c.id);
    return container?.data?.current?.type === "block";
  });
};
