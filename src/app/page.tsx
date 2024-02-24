'use client' // research about this
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const data = [
  { id: 1, name: 'Filter coffee', category: "drinks" },
  { id: 2, name: 'Tea', category: "drinks" },
  { id: 3, name: 'Samosa', category: "snacks" },
];

export default function Home() {
  const [filteredData, setFilteredData] = useState([])

  const searchItem = (searchText: string ) => {
    console.log('Search text', searchText)
  }

  return (
    <main className="flex h-screen">
      <div className="h-full w-1/2">
        <div className="flex flex-col h-full p-2">
          <div className="">
            <Input 
            type="search" 
            placeholder="Press space to start search or click on the input box" 
            onChange={(e)=> searchItem(e.target.value)}
            />
          </div>
          <div className="border border-gray-700 mt-2 flex flex-row flex-1 rounded-sm">
            <div className="w-[15%] bg-gray-800 p-1">
              {data.map((item)=> (
                <div key={item.id}>
                  {item.category}
                </div>
              ))}
            </div>
            <div className="w-[85%] p-1">
              Items
            </div>
          </div>
        </div>
      </div>
      <div className="bg-green h-full w-1/2">
        <div className="border border-gray-600 h-full p-2">
          Section 2
        </div>
      </div>
    </main>
  );
}
