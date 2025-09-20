import { DropPosition } from "./DropPosition";

/**
 * onDrag 시 마우스가 어떤 요소(id)의 어떤 position에 위치해있는지를 나타낸다.
 */
export type OverInfo = {
  id: string | null;
  position: DropPosition | null;
};