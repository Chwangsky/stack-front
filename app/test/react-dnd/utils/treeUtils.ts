import { DragEndEvent } from "@dnd-kit/core";
import { Node } from "../types";
import { DropPosition } from "../types/DropPosition";

/**
 * 
 * 재귀적으로 id를 가진 노드를 찾는다.
 * @param nodes id를 찾을 최상위 노드
 * @param id 찾을 대상노드의 id
 * @returns 만일 해당 id인 노드가 트리 안에 존재할 경우, 해당 노드를 리턴한다. 트리 안에 존재하지 않으면, null을 리턴한다.
 */
export const findNode = (nodes: Node[], id: string): Node | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 
 * 재귀적으로 id를 가진 노드를 삭제한다.
 * @param nodes id를 찾을 최상위 노드
 * @param id 찾을 대상 노드의 id
 * @returns 만일 해당 id인 노드가 자식노드 안에 존재할 경우, 해당 노드를 삭제한 child 노
 * 
 */
export const removeNode = (nodes: Node[], id: string): [Node | null, Node[]] => {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === id) {
      return [n, [...nodes.slice(0, i), ...nodes.slice(i + 1)]];
    }
    if (n.children) {
      const [removed, newChildren] = removeNode(n.children, id);
      if (removed) {
        return [removed, nodes.map((nn, idx) =>
          idx === i ? { ...nn, children: newChildren } : nn
        )];
      }
    }
  }
  return [null, nodes];
};

export const insertBefore = (nodes: Node[], targetId: string, node: Node): Node[] => {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === targetId) {
      return [...nodes.slice(0, i), node, ...nodes.slice(i)];
    }
    if (n.children) {
      const newChildren = insertBefore(n.children, targetId, node);
      if (newChildren !== n.children) {
        return nodes.map(nn => nn.id === n.id ? { ...nn, children: newChildren } : nn);
      }
    }
  }
  return nodes;
};

export const insertAfter = (nodes: Node[], targetId: string, node: Node): Node[] => {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === targetId) {
      return [...nodes.slice(0, i + 1), node, ...nodes.slice(i + 1)];
    }
    if (n.children) {
      const newChildren = insertAfter(n.children, targetId, node);
      if (newChildren !== n.children) {
        return nodes.map(nn => nn.id === n.id ? { ...nn, children: newChildren } : nn);
      }
    }
  }
  return nodes;
};

export const insertInside = (nodes: Node[], parentId: string, node: Node): Node[] => {
  return nodes.map((n) => {
    // 부모 노드를 찾았다면 children에 새 노드 추가
    if (n.id === parentId) {
      const children = n.children ? [...n.children, node] : [node];
      return { ...n, children };
    }

    // 자식이 있으면 재귀 탐색
    if (n.children) {
      return { ...n, children: insertInside(n.children, parentId, node) };
    }

    return n;
  });
};


export const isAncestor= (nodes: Node[], ancestorId: string, targetId: string): boolean => {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor || !ancestor.children) return false;

  for (const child of ancestor.children) {
    if (child.id === targetId) return true;
    if (isAncestor(child.children ?? [], child.id, targetId)) return true;
  }
  return false;
}

export function moveNodeOnce (
  tree: Node[],
  activeId: string,
  targetId: string,
  position: DropPosition
): Node[] {
  if (activeId === targetId) return tree; // 같은자리 이동 처리
  if (isAncestor(tree, activeId, targetId)) {
    return tree;
  }

  const [removed, rest] = removeNode(tree, activeId);
  if (!removed) return tree;

  if (position === "top")   return insertBefore(rest, targetId, removed);
  if (position === "bottom")return insertAfter(rest, targetId, removed);
  return insertInside(rest, targetId, removed);
}


export const computePositionFromRects = (e: DragEndEvent): DropPosition | null => {
  if (!e.over) return null;
  const activeRect = e.active.rect.current;
  const overRect = e.over.rect;
  const centerY =
    (activeRect.translated?.top ?? activeRect.initial?.top ?? 0) +
    (activeRect.translated?.height ?? activeRect.initial?.height ?? 0) / 2;

  const top = overRect.top + overRect.height * 0.3;
  const bottom = overRect.bottom - overRect.height * 0.3;

  if (centerY < top) return "top";
  if (centerY > bottom) return "bottom";
  return "inside";
}

export const pushAtRootEnd = (nodes: Node[], node: Node): Node[] => {
  return [...nodes, node];
}

export const moveToRootEnd = (tree: Node[], activeId: string): Node[] => {
  const [removed, rest] = removeNode(tree, activeId);
  if (!removed) return tree;
  return pushAtRootEnd(rest, removed);
}