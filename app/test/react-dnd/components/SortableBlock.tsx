"use client";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Node, OverInfo } from "../types";

export const SortableBlock = ({
  block,
  overInfo,
}: {
  block: Node;
  overInfo: OverInfo;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: "block" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOver = overInfo.id === block.id;
  const showPlaceholder =
    isOver && (overInfo.position === "top" || overInfo.position === "bottom");
  const showInside = isOver && overInfo.position === "inside";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="my-1"
    >
      {showPlaceholder && (
        <div className="opacity-40">
          {/* 원래 block UI를 그대로 placeholder로 */}
          <div className="border p-2 rounded shadow bg-gray-700 text-white">
            {block.content}
          </div>
        </div>
      )}
      {!showPlaceholder && (
        <div
          className={`border p-2 rounded shadow bg-gray-700 text-white ${
            showInside ? "outline-blue-400" : ""
          }`}
        >
          {block.content}
        </div>
      )}

      {block.children?.length ? (
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
      ) : null}
    </div>
  );
};
