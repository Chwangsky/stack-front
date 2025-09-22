import { arrayMove } from '@dnd-kit/sortable';
import { FlattenedItem, StackItem, StackItems } from './type';

export const iOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.platform);


function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({id}) => id === overId);
  const activeItemIndex = items.findIndex(({id}) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({nextItem});
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return {depth, maxDepth, minDepth, parentId: getParentId()};

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth({previousItem}: {previousItem: FlattenedItem}) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({nextItem}: {nextItem: FlattenedItem}) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: StackItems,
  parentId: string | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      {...item, parentId, depth, index},
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: StackItems): FlattenedItem[] {
  return flatten(items);
}

type RootItem = { id: string; children: StackItem[] };

export function buildTree(flattenedItems: FlattenedItem[]): StackItems {
  const root: RootItem = { id: "root", children: [] };

  const nodes: Record<string, StackItem | RootItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] as StackItem[] }));

  for (const item of items) {
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[item.id] = item;
    (parent.children as StackItem[]).push(item);
  }

  return root.children;
}

export function findItem(items: StackItem[], itemId: string) {
  return items.find(({id}) => id === itemId);
}

export function findItemDeep(
  items: StackItems,
  itemId: string
): StackItem | undefined {
  for (const item of items) {
    const {id, children} = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function removeItem(items: StackItems, id: string) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

// export function setProperty<T extends keyof StackItem>(
//   items: StackItems,
//   id: string,
//   property: T,
//   setter: (value: StackItem[T]) => StackItem[T]
// ) {

//   for (const item of items) {
//     if (item.id === id) {
      
//       item[property] = setter(item[property]);
//       continue;
//     }

//     if (item.children.length) {
//       item.children = setProperty(item.children, id, property, setter);
//     }
//   }

//   return [...items];
// }

// 가변 -> 불변으로 변경
export function setProperty<T extends keyof StackItem>(
  items: StackItems,
  id: string,
  property: T,
  setter: (value: StackItem[T]) => StackItem[T]
): StackItems {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, [property]: setter(item[property]) };
    }
    if (item.children.length) {
      return { ...item, children: setProperty(item.children, id, property, setter) };
    }
    return item;
  });
}

function countChildren(items: StackItem[], count = 0): number {
  return items.reduce((acc, {children}) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: StackItems, id: string) {
  if (!id) {
    return 0;
  }

  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}
