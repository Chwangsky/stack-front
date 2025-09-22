import { SortableTree } from "./components/SortableTree";

export default function Page() {
  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Sortable Tree 테스팅</h1>
      <SortableTree removable collapsible indicator editable />
    </main>
  );
}
