import TreeKanban from "./components/Components";

export default function Page() {
  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">kanban 테스팅</h1>
      <TreeKanban />
    </main>
  );
}
