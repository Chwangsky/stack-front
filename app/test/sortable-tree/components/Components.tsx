"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useState } from "react";

type Card = {
  id: string;
  title: string;
};

type Board = {
  id: string;
  title: string;
  cards: Card[];
  children?: Board[];
};

type OverInfo = {
  id: string;
  position: "top" | "inside" | "bottom";
};

function TreeNode({
  node,
  depth,
  overInfo,
}: {
  node: Board;
  depth: number;
  overInfo: OverInfo | null;
}) {
  const { setNodeRef: setDroppableRef } = useDroppable({ id: node.id });
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id: node.id,
  });

  const ref = (el: HTMLElement | null) => {
    setDroppableRef(el);
    setDraggableRef(el);
  };

  const isOver = overInfo?.id === node.id;
  const showTop = isOver && overInfo?.position === "top";
  const showBottom = isOver && overInfo?.position === "bottom";
  const showInside = isOver && overInfo?.position === "inside";

  return (
    <div style={{ marginLeft: depth * 16 }}>
      {showTop && <div style={{ height: 2, background: "blue" }} />}
      <div
        id={node.id}
        ref={ref}
        {...attributes}
        {...listeners}
        style={{
          border: "1px solid gray",
          padding: "6px 8px",
          margin: "4px 0",
          background: showInside ? "lightblue" : "white",
          cursor: "grab",
        }}
      >
        📁 {node.title}
      </div>
      {showBottom && <div style={{ height: 2, background: "blue" }} />}
      {node.cards.map((card) => (
        <div
          key={card.id}
          style={{
            marginLeft: (depth + 1) * 16,
            border: "1px dashed gray",
            padding: "4px 8px",
            background: "lightyellow",
          }}
        >
          📝 {card.title}
        </div>
      ))}
      {node.children?.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          overInfo={overInfo}
        />
      ))}
    </div>
  );
}

/* -------------------------------
   트리 조작 유틸 함수
--------------------------------*/

// 특정 id의 노드를 제거
function removeNode(tree: Board[], id: string): [Board | null, Board[]] {
  const newTree: Board[] = [];
  let removed: Board | null = null;

  for (const node of tree) {
    if (node.id === id) {
      removed = node;
      continue; // 제거
    }

    let newChildren: Board[] | undefined = node.children;
    if (node.children) {
      const [childRemoved, childTree] = removeNode(node.children, id);
      if (childRemoved) {
        removed = childRemoved;
        newChildren = childTree;
      }
    }

    newTree.push({ ...node, children: newChildren });
  }

  return [removed, newTree];
}

// 특정 위치에 노드 삽입
function insertNode(
  tree: Board[],
  targetId: string,
  position: "top" | "inside" | "bottom",
  node: Board
): Board[] {
  const newTree: Board[] = [];

  for (let i = 0; i < tree.length; i++) {
    const current = tree[i];

    if (current.id === targetId) {
      if (position === "top") {
        newTree.push(node);
        newTree.push(current);
      } else if (position === "bottom") {
        newTree.push(current);
        newTree.push(node);
      } else if (position === "inside") {
        const newChildren = [...(current.children ?? []), node];
        newTree.push({ ...current, children: newChildren });
      }
    } else {
      // 재귀적으로 children 탐색
      const updatedChildren = current.children
        ? insertNode(current.children, targetId, position, node)
        : current.children;

      newTree.push({ ...current, children: updatedChildren });
    }
  }

  return newTree;
}

export default function TreeKanban() {
  const [tree, setTree] = useState<Board[]>([
    {
      id: "board-a",
      title: "Board A",
      cards: [{ id: "c1", title: "Card 1" }],
      children: [
        { id: "board-a1", title: "Board A-1", cards: [] },
        { id: "board-a2", title: "Board A-2", cards: [] },
      ],
    },
    { id: "board-b", title: "Board B", cards: [] },
  ]);

  const [overInfo, setOverInfo] = useState<OverInfo | null>(null);

  const handleDragOver = (event: DragOverEvent) => {
    const { over, activatorEvent } = event;
    if (!over || !(activatorEvent instanceof PointerEvent)) return;

    const target = document.getElementById(over.id.toString());
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const offsetY = activatorEvent.clientY - rect.top;

    let position: "top" | "inside" | "bottom" = "inside";
    if (offsetY < rect.height / 3) position = "top";
    else if (offsetY > (rect.height * 2) / 3) position = "bottom";

    setOverInfo({ id: over.id.toString(), position });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!overInfo) return;
    if (event.active.id === overInfo.id) {
      setOverInfo(null);
      return;
    }

    // 1. 트리에서 active 노드 제거
    const [removed, withoutNode] = removeNode(tree, event.active.id.toString());
    if (!removed) {
      setOverInfo(null);
      return;
    }

    // 2. target 위치에 삽입
    const newTree = insertNode(
      withoutNode,
      overInfo.id,
      overInfo.position,
      removed
    );

    setTree(newTree);
    setOverInfo(null);
  };

  return (
    <DndContext onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      {tree.map((board) => (
        <TreeNode key={board.id} node={board} depth={0} overInfo={overInfo} />
      ))}
    </DndContext>
  );
}
