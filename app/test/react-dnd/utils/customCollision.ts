import { CollisionDetection, rectIntersection } from "@dnd-kit/core";

type DropPosition = "top" | "bottom" | "inside";

export const customCollisionDetection: CollisionDetection = (args) => {
  const collisions = rectIntersection(args);
  if (collisions.length === 0) return [];

  const over = collisions[0];
  const overRect = args.droppableRects.get(over.id);
  const pointer = args.pointerCoordinates;

  if (!overRect || !pointer) return []; 

  const y = pointer.y;
  const top = overRect.top + overRect.height * 0.25;
  const bottom = overRect.bottom - overRect.height * 0.25;

  let position: "top" | "bottom" | "inside";
  if (y < top) position = "top";
  else if (y > bottom) position = "bottom";
  else position = "inside";

  return [
    {
      ...over,
      data: { ...over.data, droppable: { position } },
    },
  ];
};