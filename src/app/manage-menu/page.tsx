"use client"
import React, { useState } from 'react';
import Link from 'next/link';

const ManageMenuPage: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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
            <div className='border border-zinc-700 p-2 flex flex-row items-center'>
            <Link href="/" className='px-2 py-1 bg-zinc-700'> {`< back`}</Link>
            <h1 className='p-2 text-sm'>Manage Menu</h1>

            </div>

            {/* Form to add a new menu item */}
            <form onSubmit={addMenuItem}>
                {/* Input fields for name and price */}
                
                {/* Submit button */}
            </form>

            {/* List of menu items */}
            <ul>
                {menuItems.map((item) => (
                    <li key={item.id}>
                        {/* Display item name and price */}
                        {/* Button to delete item */}
                        {/* Button to update item */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageMenuPage;