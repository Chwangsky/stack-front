import {
  closestCorners,
  DroppableContainer,
  getClientRect,
  getFirstCollision,
  KeyboardCode,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

import { RectMap } from '@dnd-kit/core/dist/store';
import { SensorContext } from './type';
import { getProjection } from './utilities';

enum CustomKeyboardCode {
    W = "KeyW",
    A = "KeyA",
    S = "KeyS",
    D = "KeyD",
}

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
  CustomKeyboardCode.W,
  CustomKeyboardCode.A,
  CustomKeyboardCode.S,
  CustomKeyboardCode.D,
];

const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right, CustomKeyboardCode.A, CustomKeyboardCode.D];

export const sortableTreeKeyboardCoordinates: (
  context: SensorContext,
  indentationWidth: number
) => KeyboardCoordinateGetter = (context, indentationWidth) => (
  event,
  {
    currentCoordinates,
    context: {active, over, collisionRect, droppableContainers},
  }
) => {
  if (directions.includes(event.code)) {
    if (!active || !collisionRect) {
      return;
    }

    event.preventDefault();

    const {
      current: {items, offset},
    } = context; 

    if (horizontal.includes(event.code) && over?.id) {
      const {depth, maxDepth, minDepth} = getProjection(
        items,
        active.id.toString(),
        over.id.toString(),
        offset,
        indentationWidth
      );

      switch (event.code) {
        case KeyboardCode.Left:
        case CustomKeyboardCode.A:
          if (depth > minDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x - indentationWidth,
            };
          }
          break;
        case KeyboardCode.Right:
        case CustomKeyboardCode.D:
          if (depth < maxDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x + indentationWidth,
            };
          }
          break;
      }

      return undefined;
    }

    const containers: DroppableContainer[] = [];

    const overRect = over?.id
      ? droppableContainers.get(over.id)?.rect.current
      : undefined;

    if (overRect) {
      droppableContainers.forEach((container) => {
        if (container?.disabled) {
          return;
        }

        const rect = container?.rect.current;

        if (!rect) {
          return;
        }

        switch (event.code) {
          case KeyboardCode.Down:
          case CustomKeyboardCode.S:
            if (overRect.top < rect.top) {
              containers.push(container);
            }
            break;
          case KeyboardCode.Up:
          case CustomKeyboardCode.W:
            if (overRect.top > rect.top) {
              containers.push(container);
            }
            break;
        }
      });
    }

  const rectMap: RectMap = new Map();
  droppableContainers.forEach((container) => {
    if (container?.rect.current) {
      rectMap.set(container.id, container.rect.current);
    } 
  });

  const collisions = closestCorners({
    active,
    collisionRect,
    pointerCoordinates: null,
    droppableContainers: containers,
    droppableRects: rectMap,
  });
    const closestId = getFirstCollision(collisions, 'id');
    console.log(`closest Id: ${closestId}`);

    if (closestId && over?.id) {
      const newNode = droppableContainers.get(closestId)?.node.current;
      const activeNodeRect = droppableContainers.get(active.id)?.rect.current;

      if (newNode && activeNodeRect) {
        const newRect = getClientRect(newNode, {ignoreTransform: true});
        const newItem = items.find(({id}) => id === closestId);
        const activeItem = items.find(({id}) => id === active.id);

        if (newItem && activeItem) {
          const {depth} = getProjection(
            items,
            active.id.toString(),
            closestId.toString(),
            (newItem.depth - activeItem.depth) * indentationWidth,
            indentationWidth
          );
          const offset =
            newRect.top > activeNodeRect.top
              ? Math.abs(activeNodeRect.height - newRect.height)
              : 0;

          const newCoordinates = {
            x: newRect.left + depth * indentationWidth,
            y: newRect.top + offset,
          };
          console.log(newCoordinates);

          console.log(event.key)
          console.log("Before:", currentCoordinates, "After:", newCoordinates);

          return newCoordinates;
        }
      }
    }
  }

  

  return undefined;
};
