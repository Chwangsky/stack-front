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

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right];

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
        case KeyboardCode.A:
          if (depth > minDepth) {
            return {
              ...currentCoordinates,
              x: currentCoordinates.x - indentationWidth,
            };
          }
          break;
        case KeyboardCode.Right:
        case KeyboardCode.D:
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
          case KeyboardCode.S:
            if (overRect.top < rect.top) {
              containers.push(container);
            }
            break;
          case KeyboardCode.Up:
          case KeyboardCode.W:
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

          return newCoordinates;
        }
      }
    }
  }

  return undefined;
};
