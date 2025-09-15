import { Block } from "../types";

export const findBlockById = (blocks: Block[], id: string): Block | undefined => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlockById(block.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const removeBlock = (blocks: Block[], id: string): [Block | null, Block[]] => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) {
      return [b, [...blocks.slice(0, i), ...blocks.slice(i + 1)]];
    }
    if (b.children) {
      const [removed, newChildren] = removeBlock(b.children, id);
      if (removed) {
        return [
          removed,
          blocks.map((bb, idx) =>
            idx === i ? { ...bb, children: newChildren } : bb
          ),
        ];
      }
    }
  }
  return [null, blocks];
};

export const insertBlock = (blocks: Block[], parentId: string, block: Block): Block[] => {
  return blocks.map((b) => {
    if (b.id === parentId) {
      return { ...b, children: [...(b.children ?? []), block] };
    }
    if (b.children) {
      return { ...b, children: insertBlock(b.children, parentId, block) };
    }
    return b;
  });
};

export const insertBefore = (blocks: Block[], targetId: string, block: Block): Block[] => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === targetId) {
      return [...blocks.slice(0, i), block, ...blocks.slice(i)];
    }
    if (b.children) {
      const newChildren = insertBefore(b.children, targetId, block);
      if (newChildren !== b.children) {
        return blocks.map((bb) =>
          bb.id === b.id ? { ...bb, children: newChildren } : bb
        );
      }
    }
  }
  return blocks;
};

export const insertAfter = (blocks: Block[], targetId: string, block: Block): Block[] => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === targetId) {
      return [...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)];
    }
    if (b.children) {
      const newChildren = insertAfter(b.children, targetId, block);
      if (newChildren !== b.children) {
        return blocks.map((bb) =>
          bb.id === b.id ? { ...bb, children: newChildren } : bb
        );
      }
    }
  }
  return blocks;
};

export const isAncestor = (blocks: Block[], ancestorId: string, targetId: string): boolean => {
  const node = findBlockById(blocks, ancestorId);
  if (!node) return false;
  const stack = [...(node.children ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.id === targetId) return true;
    if (cur.children) stack.push(...cur.children);
  }
  return false;
};
