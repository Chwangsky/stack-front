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
import { Node, OverInfo } from "../types";
import { DropPosition } from "../types/DropPosition";
import { customCollisionDetection } from "../utils/customCollisionDetection"; // (closestCenter 결과를 block만 필터)
import { findNode, moveNodeOnce } from "../utils/treeUtils";
import { SortableBlock } from "./SortableBlock";

function computePosition(e: DragOverEvent): DropPosition | null {
  if (!e.over) return null;
  const activeRect = e.active.rect.current;
  const overRect = e.over.rect;

  // translate값이 있으면 translated로, 없으면 inital 값으로
  const centerY =
    (activeRect.translated?.top ?? activeRect.initial?.top ?? 0) +
    (activeRect.translated?.height ?? activeRect.initial?.height ?? 0) / 2;
  if (centerY === 0) return null;

  const top = overRect.top + overRect.height * 0.3;
  const bottom = overRect.bottom - overRect.height * 0.3;
  console.log(e);

  console.log(`centerY: ${centerY} top: ${top} bottom${bottom}`);
  if (centerY < top) return "top";
  if (centerY > bottom) return "bottom";
  return "inside";
}

export const BlockEditor = ({ initialBlocks }: { initialBlocks: Node[] }) => {
  const [blocks, setBlocks] = useState<Node[]>(initialBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overInfo, setOverInfo] = useState<OverInfo>({
    id: null,
    position: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // 1px 이상 움직여야 드래그 시작
      },
    })
  );
  const rootIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  };

  const handleDragOver = (e: DragOverEvent) => {
    if (!e.over) {
      setOverInfo({ id: null, position: null });
      return;
    }
    const pos: DropPosition | null = computePosition(e);
    setOverInfo({ id: String(e.over.id), position: pos });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    // console.log("hint", overInfo);

    if (!activeId) return;
    if (!overInfo.id || !overInfo.position) {
      // 힌트 없으면 아무 것도 안 함
      setActiveId(null);
      setOverInfo({ id: null, position: null });
      return;
    }

    setBlocks((prev) =>
      moveNodeOnce(prev, String(e.active.id), overInfo.id!, overInfo.position!)
    );

    // 힌트 초기화
    setActiveId(null);
    setOverInfo({ id: null, position: null });
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection} /* or closestCenter */
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
          <SortableBlock
            block={findNode(blocks, activeId)!}
            overInfo={{ id: null, position: null }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
