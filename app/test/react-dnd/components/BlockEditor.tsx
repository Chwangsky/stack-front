"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
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
import { Node, OverInfo } from "../types";

import { customCollisionDetection } from "../utils/customCollisionDetection";
import {
  insertAfter,
  insertBefore,
  insertInside,
  isAncestor,
  removeNode,
} from "../utils/treeUtils";
import { SortableBlock } from "./SortableBlock";

function computePosition(e: DragOverEvent): "top" | "bottom" | "inside" | null {
  if (!e.over) return null;
  const activeRect = e.active.rect.current;
  const overRect = e.over.rect;

  const activeCenterY =
    (activeRect.translated?.top ?? activeRect.initial?.top ?? 0) +
    (activeRect.translated?.height ?? activeRect.initial?.height ?? 0) / 2;

  const top = overRect.top + overRect.height * 0.25; // ㅇ
  const bottom = overRect.bottom - overRect.height * 0.25;

  if (activeCenterY < top) return "top";
  if (activeCenterY > bottom) return "bottom";
  return "inside";
}

export const BlockEditor = ({ initialBlocks }: { initialBlocks: Node[] }) => {
  const [blocks, setBlocks] = useState<Node[]>(initialBlocks);
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
    if (!e.over) {
      setOverInfo({ id: null, position: null });
      return;
    }
    const pos = computePosition(e);
    setOverInfo({ id: String(e.over.id), position: pos });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverInfo({ id: null, position: null });

    if (!over) {
      // root 맨 끝으로
      setBlocks((prev) => {
        const [removed, rest] = removeNode(prev, active.id as string);
        return removed ? [...rest, removed] : prev;
      });
      return;
    }

    const targetId = String(over.id);
    const pos = computePosition(e);
    if (!pos) return;

    if (active.id === targetId) return;

    if (isAncestor(blocks, active.id as string, targetId)) return;

    setBlocks((prev) => {
      const [removed, rest] = removeNode(prev, active.id as string);
      if (!removed) return prev;

      if (pos === "top") return insertBefore(rest, targetId, removed);
      if (pos === "bottom") return insertAfter(rest, targetId, removed);
      return insertInside(rest, targetId, removed);
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
    </DndContext>
  );
};
