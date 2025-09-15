"use client";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useState } from "react";
import StackItem from "../interface/StackItem";

// 샘플 데이터 (최대 depth 2로 시작)
const initialData: StackItem[] = [
  {
    id: "1",
    title: "웹개발",
    status: "todo",
    children: [
      {
        id: "1-1",
        title: "DB 설계",
        status: "todo",
        children: [
          { id: "1-1-1", title: "Docker 생성", status: "todo" },
          { id: "1-1-2", title: "Network 세팅", status: "todo" },
        ],
      },
      {
        id: "1-2",
        title: "DB 설계 2번째",
        status: "todo",
        children: [
          { id: "1-2-1", title: "A 생성", status: "todo" },
          { id: "1-2-2", title: "B 세팅", status: "todo" },
        ],
      },
    ],
  },
  { id: "2", title: "UI 디자인", status: "todo" },
];

// Draggable 컴포넌트
function DraggableItem({ item }: { item: StackItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
    });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      layout
      animate={{ scale: isDragging ? 1.05 : 1, opacity: isDragging ? 0.5 : 1 }}
      className="p-2 mb-2 rounded bg-gray-700"
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : "none",
      }}
    >
      {item.title}
      {item.children && (
        <div className="ml-4 mt-2">
          {item.children.map((child) => (
            <DraggableItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Droppable wrapper (간단 버전)
// TODO
function DroppableArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: "droppable" });
  return (
    <div ref={setNodeRef} className="p-2 bg-gray-50 rounded border">
      {children}
    </div>
  );
}

// 메인
export default function NestedDnD() {
  const [items, setItems] = useState<StackItem[]>(initialData);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // ⚠️ 간단 예제: 실제로는 parent/children 계산 로직 필요
    console.log(`Moved ${active.id} → ${over.id}`);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DroppableArea>
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </DroppableArea>
    </DndContext>
  );
}
