"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { dbInstance } from '@/lib/db';

const BillsPage: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);

    useEffect(() => {
        console.log('Fetching menu items');
        fetchBills()
    },[]);

    const fetchBills = async () => {
        const db = await dbInstance();
        const result = await db.select<any[]>("SELECT * FROM bills");
        setBills(result);
    }

    const addMenuItem = () => {
        // Logic to add a new menu item
    };

    const deleteMenuItem = (id: number) => {
        // Logic to delete a menu item by ID
    };

    const updateMenuItem = (id: number, updatedItem: MenuItem) => {
        // Logic to update a menu item by ID
    };

    return (
        <div className='p-2'>
            <div className='border border-border p-2 flex flex-row items-center'>
                <Link href="/" className='p-2 bg-zinc-500'> {`< back`}</Link>
                <h1 className='p-2'>Bills</h1>
            </div>

            {/* Form to add a new menu item */}
            <form onSubmit={addMenuItem}>
               
            </form>

            {/* List of menu items */}
            <ul>
                {bills.map((item) => (
                    <li key={item.id} className='p-2'>
                        {JSON.stringify(item)}
                        {/* Display item name and price */}
                        {/* Button to delete item */}
                        {/* Button to update item */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BillsPage;