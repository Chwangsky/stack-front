import { Node } from "../types";

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
  return nodes.map(n =>
    n.id === parentId
      ? { ...n, children: [...(n.children ?? []), node] }
      : n.children
        ? { ...n, children: insertInside(n.children, parentId, node) }
        : n
  );
};

export const isAncestor = (nodes: Node[], ancestorId: string, targetId: string): boolean => {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor) return false;
  const stack = [...(ancestor.children ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.id === targetId) return true;
    if (cur.children) stack.push(...cur.children);
  }
  return false;
};
