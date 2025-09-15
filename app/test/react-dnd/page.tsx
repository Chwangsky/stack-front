import { BlockEditor } from "./components/BlockEditor";

// 서버에서 기본 데이터 (예시)
const initialBlocks = [
  { id: "1", content: "제목 블록", children: [] },
  {
    id: "2",
    content: "리스트 블록",
    children: [
      { id: "2-1", content: "리스트 아이템 1", children: [] },
      { id: "2-2", content: "리스트 아이템 2", children: [] },
    ],
  },
  { id: "3", content: "텍스트 블록", children: [] },
  {
    id: "4",
    content: "리스트 블록2",
    children: [
      { id: "4-1", content: "리스트 아이템 1", children: [] },
      { id: "4-2", content: "리스트 아이템 2", children: [] },
    ],
  },
];

export default function Page() {
  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">📝 Notion 스타일 DnD 실험</h1>
      {/* Client Component로 데이터 전달 */}
      <BlockEditor initialBlocks={initialBlocks} />
    </main>
  );
}
