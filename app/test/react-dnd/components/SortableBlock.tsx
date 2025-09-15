"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block, OverInfo } from "../types";

export const SortableBlock = ({
  block,
  overInfo,
}: {
  block: Block;
  overInfo: OverInfo;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const isOver = overInfo.id === block.id;
  const showTop = isOver && overInfo.position === "top";
  const showBottom = isOver && overInfo.position === "bottom";
  const showInside = isOver && overInfo.position === "inside";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="my-1"
    >
      {showTop && <div className="h-0.5 bg-blue-400 rounded-full mx-1" />}
      <div
        className={`border p-2 rounded shadow bg-gray-700 text-white ${
          showInside ? "outline outline-2 outline-blue-400" : ""
        }`}
      >
        {block.content}
      </div>
      {showBottom && <div className="h-0.5 bg-blue-400 rounded-full mx-1" />}

      {block.children && block.children.length > 0 && (
        <div className="ml-6 border-l pl-2 mt-2">
          <SortableContext
            items={block.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {block.children.map((child) => (
              <SortableBlock key={child.id} block={child} overInfo={overInfo} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
