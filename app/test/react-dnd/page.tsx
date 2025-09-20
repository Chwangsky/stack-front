import { BlockEditor } from "./components/BlockEditor";

const initialBlocks = [
  { id: "1", content: "A", children: [] },
  {
    id: "2",
    content: "B",
    children: [
      { id: "2-1", content: "B-1", children: [] },
      { id: "2-2", content: "B-2", children: [] },
    ],
  },
  { id: "3", content: "C", children: [] },
  {
    id: "4",
    content: "D",
    children: [
      { id: "4-1", content: "D-1", children: [] },
      { id: "4-2", content: "D-2", children: [] },
    ],
  },
];

export default function Page() {
  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Notion 스타일 DnD 실험</h1>
      {/* Client Component로 데이터 전달 */}
      <BlockEditor initialBlocks={initialBlocks} />
    </main>
  );
}
