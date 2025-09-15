"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { Block, OverInfo } from "../types";
import { DropPosition } from "../types/DropPosition";
import { customCollisionDetection } from "../utils/customCollision";

import {
  findBlockById,
  insertAfter,
  insertBefore,
  insertBlock,
  isAncestor,
  removeBlock,
} from "../utils/treeUtils";
import { SortableBlock } from "./SortableBlock";

export const BlockEditor = ({ initialBlocks }: { initialBlocks: Block[] }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overInfo, setOverInfo] = useState<OverInfo>({
    id: null,
    position: null,
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const rootIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const id = (e.over?.id as string) ?? null;
    const position =
      (e.over?.data?.current as any)?.droppable?.position ?? null;
    setOverInfo({ id, position });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverInfo({ id: null, position: null });
    if (!over) return;

    const targetId = over.id.toString();
    const position: DropPosition | undefined = (over.data.current as any)
      ?.droppable?.position;
    console.log(position); // undefined
    if (!position) return;

    if (isAncestor(blocks, active.id as string, targetId)) return;

    setBlocks((prev) => {
      const [removed, withoutActive] = removeBlock(prev, active.id as string);
      if (!removed) return prev;

      if (position === "top")
        return insertBefore(withoutActive, targetId, removed);
      if (position === "bottom")
        return insertAfter(withoutActive, targetId, removed);
      return insertBlock(withoutActive, targetId, removed);
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
        {blocks.map((block) => (
          <SortableBlock key={block.id} block={block} overInfo={overInfo} />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="border p-2 rounded shadow bg-gray-600 text-white opacity-95">
            {findBlockById(blocks, activeId)?.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
