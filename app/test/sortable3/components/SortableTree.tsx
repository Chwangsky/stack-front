"use client";

import {
  Announcements,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { sortableTreeKeyboardCoordinates } from "./keyboardCoordinates";
import { SortableTreeItem } from "./TreeItem/SortableTreeItem";
import { FlattenedItem, SensorContext, StackItem } from "./type";
import {
  buildTree,
  findItemDeep,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
} from "./utilities";

const initialItems: StackItem[] = [
  {
    id: "course-1",
    title: "Course Alpha",
    description: "Introduction to productivity system",
    status: "todo",
    children: [
      {
        id: "module-1",
        title: "Module 1: Basics",
        status: "in-progress",
        children: [
          {
            id: "lesson-1",
            title: "Lesson 1: Getting Started",
            status: "done",
            children: [
              {
                id: "lo-1",
                title: "Learning Object 1",
                status: "todo",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Course Beta",
    description: "Advanced techniques",
    status: "in-progress",
    timer: {
      isRunning: false,
      isOverdued: false,
      elapsed: 0,
      deadline: Date.now() + 1000 * 60 * 60, // 1시간 뒤
    },
    children: [
      {
        id: "module-2",
        title: "Module 2: Deep Dive",
        status: "todo",
        children: [
          {
            id: "lesson-2",
            title: "Lesson 2: Focus Management",
            status: "todo",
            children: [
              {
                id: "lo-2",
                title: "Learning Object 2",
                status: "deferred",
                alarm: {
                  duration: 1000 * 60 * 15, // 15분 타이머
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "Course Gamma",
    description: "Final project course",
    status: "deferred",
    stopwatch: {
      isRunning: true,
      elapsed: 5000, // 5초 진행중
    },
    children: [],
  },
];

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  // dragSourceOpacity: 0.5,
};

interface Props {
  collapsible?: boolean;
  defaultItems?: StackItem[];
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
  editable?: boolean;
}
``;

export function SortableTree({
  collapsible,
  defaultItems = initialItems,
  indicator,
  indentationWidth = 20,
  removable,
  editable,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null;
    overId: string;
  } | null>(null);

  const collapseLockRef = useRef(false);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children?.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableTreeKeyboardCoordinates(
        sensorContext,
        indentationWidth
      ),
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement(
        "onDragMove",
        active.id.toString(),
        over?.id?.toString()
      );
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement(
        "onDragOver",
        active.id.toString(),
        over?.id?.toString()
      );
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement(
        "onDragEnd",
        active.id.toString(),
        over?.id?.toString()
      );
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            return `Picked up ${active.id}.`;
          },
          onDragOver({ active, over }) {
            return over
              ? `${active.id} was moved over ${over.id}`
              : `${active.id} is no longer over a droppable area.`;
          },
          onDragEnd({ active, over }) {
            return over
              ? `${active.id} was dropped over ${over.id}`
              : `${active.id} was dropped.`;
          },
          onDragCancel({ active }) {
            return `Dragging ${active.id} was cancelled.`;
          },
        },
      }}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(
          ({ id, title, description, children, collapsed, depth }) => (
            <SortableTreeItem
              key={id}
              id={id}
              value={{ title: title, description: description }}
              depth={id === activeId && projected ? projected.depth : depth}
              indentationWidth={indentationWidth}
              indicator={indicator}
              collapsed={Boolean(collapsed && children?.length)}
              onCollapse={
                collapsible && children.length
                  ? () => handleCollapse(id)
                  : undefined
              }
              onRemove={removable ? () => handleRemove(id) : undefined}
              onEdit={editable ? () => handleEdit(id) : undefined}
            />
          )
        )}
        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={dropAnimation}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <SortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items, activeId) + 1}
                  value={{ title: activeItem.title }}
                  indentationWidth={indentationWidth}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId.toString());
    setOverId(activeId.toString());

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId.toString(),
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id.toString() ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    document.body.style.setProperty("cursor", "");
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);
  }

  function handleRemove(id: string) {
    setItems((items) => removeItem(items, id));
  }

  function handleEdit(id: string) {
    console.log(id);
    console.log("handle동작작");
  }

  function handleCollapse(id: string) {
    const before = findItemDeep(items, id)?.collapsed;
    // console.log("[collapse] before:", id, before);

    if (collapseLockRef.current) return;
    collapseLockRef.current = true;
    // StrictMode 중복 방지
    setTimeout(() => {
      collapseLockRef.current = false;
    }, 0);

    setItems((items) => setProperty(items, id, "collapsed", (value) => !value));
  }

  // 접근성 보장을 위한 사용자 안내 메서드
  function getMovementAnnouncement(
    eventName: string,
    activeId: string,
    overId?: string
  ) {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved";
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested";

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: string | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
