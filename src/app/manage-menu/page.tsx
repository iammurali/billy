"use client"
import React, { FormEvent, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { dbInstance } from '@/lib/db';
import Database from 'tauri-plugin-sql-api';

const ManageMenuPage: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        console.log('Fetching menu items');
        fetchMenuItems()
        fetchCategories()
    },[]);

    const fetchMenuItems = async () => {
        const db = await dbInstance();
        const result = await db.select<MenuItem[]>("SELECT * FROM menu_items");
        setMenuItems(result);
    }

    const fetchCategories = async () => {
        const db = await dbInstance();
        const result: Category[] = await db.select('SELECT * from category;');
        console.log('Categories:', result);
        setCategories(result);
    }

    const addMenuItem = async (event: any) => {
        event.preventDefault();
        if(selectedMenuItem) {
            // logic to update item
            console.log('Updating item:', itemName, itemPrice, selectedCategory, selectedMenuItem.id);
            const db = await dbInstance();
            const result = await db.execute('UPDATE menu_items SET name = ?, price = ?, category_id = ? WHERE id = ?', [itemName, itemPrice, selectedCategory, selectedMenuItem.id]);
            console.log('Result:', result);
            setSelectedMenuItem(null);
            setItemName('');
            setItemPrice(0);
            setSelectedCategory('');
        } else {
            // Logic to add a new menu item
            console.log('Adding item:', itemName, itemPrice, selectedCategory);
            const db = await dbInstance();
            const result = await db.execute('INSERT INTO menu_items (name, price, category_id) VALUES (?, ?, ?)', [itemName, itemPrice, selectedCategory]);
            console.log('Result:', result);
        }
        await fetchMenuItems();
    };

    const deleteMenuItem = async (id: number) => {
        // Logic to delete a menu item by ID
        console.log('Deleting item with id:', id);
        const db = await dbInstance();
        const result = await db.execute('DELETE FROM menu_items WHERE id = ?', [id]);
        console.log('Result:', result);
        await fetchMenuItems();
    };

    const updateMenuItem = async (id: number, updatedItem: MenuItem) => {
        // Logic to update a menu item by ID
        console.log('Updating item with id:', id);
        setItemName(updatedItem.name);
        setItemPrice(updatedItem.price);
        setSelectedCategory(updatedItem.category_id.toString());
        setSelectedMenuItem(updatedItem);

    };

    return (
        <div className='p-2'>
            <div className='border border-border p-2 flex flex-row items-center'>
            <Link href="/" className='px-2 lg:py-1 bg-background'> {`< back`}</Link>
            <h1 className='p-2 text-sm'>Manage Menu</h1>

            </div>

            {/* Form to add a new menu item */}
            <form onSubmit={addMenuItem}>
               {/* Input fields for name and price */}
               <input
                    type="text"
                    placeholder="Item Name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className='p-2'
                />
                <input
                    type="number"
                    placeholder="Item Price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className='p-2'
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className='p-2'
                >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button type="submit" className='p-2 bg-zinc-500'>Add Item</button>
                {/* Submit button */}
            </form>

            {/* List of menu items */}
            <ul>
                {menuItems.map((item) => (
                    <li key={item.id} className='flex flex-row justify-between p-2'>
                        {item.name} - {item.price} 
                        <button className='bg-zinc-600 p-1' onClick={() => deleteMenuItem(item.id)}>Delete</button>
                        <button className='bg-zinc-600 p-1' onClick={() => updateMenuItem(item.id, item)}>Update</button>
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