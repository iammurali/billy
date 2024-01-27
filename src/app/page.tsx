import Image from "next/image";

export default function Home() {
  return (
    <main className="flex h-screen">
      <div className="h-full w-1/2 border border-red-600 p-2">Section 1</div>
      <div className="bg-green h-full w-1/2 border border-red-600 p-2">Section 2</div>
    </main>
  );
}
