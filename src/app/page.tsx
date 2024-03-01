'use client'; // research about this

import React, { use, useCallback, useEffect, useState } from 'react';
import Database from 'tauri-plugin-sql-api';

import { toast } from 'sonner';

import { DatabaseService } from '@/lib/db';
import { cn } from '@/lib/utils';
import SearchComponent from '@/components/search-component';
import { Trash2 } from 'lucide-react';

const dbService = new DatabaseService();

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredData, setFilteredData] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [TotalAmount, setTotalAmount] = useState<number>(0.0);

  const searchItem = (searchText: string) => {
    console.log('Search text', searchText);
  };

  const truncateData = async () => {
    await dbService.truncateTables();
  };

  useEffect(() => {
    // truncateData();
    // addSeedData();
    getMenuItems();
    getCategories();
    getBillsWithBillItems();
  }, []);

  useEffect(() => {
    let total = 0;
    billItems.forEach((billItem) => {
      total += billItem.item.price * billItem.quantity;
    });
    total = parseFloat(total.toFixed(2));
    setTotalAmount(total);
  }, [billItems]);

  const dbInstance = async () => {
    const db = await Database.load('sqlite:billy.db');
    return db;
  };

  const addSeedData = async () => {
    // console.log('seed data inserted')
    const db = await dbInstance();

    try {
      // Truncate all tables
      await db.execute('DELETE FROM menu_items;');
      await db.execute('DELETE FROM users;');
      await db.execute('DELETE FROM category;');

      // Insert new data with new IDs
      const insertUsers = await db.execute(
        "INSERT INTO users (name) VALUES ('Murali'), ('Magesh'), ('Yugesh'), ('Dhinesh'), ('Mohanadevan');"
      );

      const insertCategory = await db.execute(
        "INSERT INTO category (id, name) VALUES (1,'Beverages'), (2, 'Snacks'), (3, 'Toys'), (4, 'Juice'), (5, 'Fried');"
      );

      const categoryNames: any = {
        1: [
          'Tea',
          'Coffee',
          'Iced Tea',
          'Smoothie',
          'Hot Chocolate',
          'Milkshake',
          'Soda',
          'Lemonade',
          'Fruit Juice',
          'Water',
        ],
        2: [
          'Burger',
          'Pizza',
          'Sandwich',
          'Nachos',
          'French Fries',
          'Chicken Wings',
          'Mozzarella Sticks',
          'Quesadilla',
          'Spring Rolls',
          'Pretzels',
        ],
        3: [
          'Toy 1',
          'Toy 2',
          'Toy 3',
          'Toy 4',
          'Toy 5',
          'Toy 6',
          'Toy 7',
          'Toy 8',
          'Toy 9',
          'Toy 10',
        ],
        4: [
          'Orange Juice',
          'Apple Juice',
          'Grape Juice',
          'Pineapple Juice',
          'Cranberry Juice',
          'Carrot Juice',
          'Tomato Juice',
          'Watermelon Juice',
          'Coconut Water',
          'Mango Juice',
        ],
        5: [
          'Fried Chicken',
          'Fried Fish',
          'Fried Shrimp',
          'Fried Calamari',
          'Fried Tofu',
          'Fried Pickles',
          'Fried Okra',
          'Fried Zucchini',
          'Fried Cheese',
          'Fried Mushrooms',
        ],
      };

      const insertMenuItems = await db.execute(`
        INSERT INTO menu_items (name, category_id, price)
        VALUES
        ${Array.from({ length: 50 }, (_, index) => {
          const categoryId = Math.ceil((index + 1) / 10);
          const itemName = categoryNames[categoryId][index % 10];
          const price = Math.floor(Math.random() * (20 - 5) + 5); // Random price between 5 and 20
          return `('${itemName}', ${categoryId}, ${price})`;
        }).join(',\n')};
      `);

      console.log('INSERTED USERS:', insertUsers);
      console.log('INSERTED CATEGORY:', insertCategory);
      console.log('INSERTED MENU ITEMS:', insertMenuItems);
    } catch (error) {
      console.error('Error adding seed data:', error);
    } finally {
      await db.close();
    }
  };

  const getMenuItems = async () => {
    try {
      const result = await dbService.getMenuItems();
      setMenuItems(result);
      setFilteredData(result);
    } catch (error) {
      console.log(error);
    }
  };
  const getCategories = async () => {
    try {
      const result: Category[] = await dbService.getCategories();
      console.log('categories::::', result);
      setCategories(result);
    } catch (error) {
      console.log(error);
    }
  };
  const getBillsWithBillItems = async () => {
    const db = await dbInstance();

    try {
      const result: any[] = await db.select(
        'SELECT b.id as bill_id, b.total, b.date, bi.quantity, m.id as menu_item_id, m.name, m.category_id, m.price FROM bills b JOIN bill_items bi ON b.id = bi.bill_id JOIN menu_items m ON bi.menu_item_id = m.id;'
      );
      // change the result to a map of bill interface
      const bills: Bill[] = [];
      result.forEach((row) => {
        const bill = bills.find((bill) => bill.id === row.bill_id);
        if (bill) {
          bill.items.push({
            quantity: row.quantity,
            item: {
              id: row.menu_item_id,
              name: row.name,
              category_id: row.category_id,
              price: row.price,
            },
          });
        } else {
          bills.push({
            id: row.bill_id,
            total: row.total,
            date: row.date,
            items: [
              {
                quantity: row.quantity,
                item: {
                  id: row.menu_item_id,
                  name: row.name,
                  category_id: row.category_id,
                  price: row.price,
                },
              },
            ],
          });
        }
      });

      console.log('BILLS::::', bills);
    } catch (error) {
      console.log('Bill items test', error);
    } finally {
      await db.close();
    }
  };

  const filterMenuItems = (categoryId: number) => {
    if (categoryId === -1) return setFilteredData(menuItems);
    const filtered = menuItems.filter(
      (item) => item.category_id === categoryId
    );
    setFilteredData(filtered);
  };

  const addItemToBill = (item: MenuItem) => {
    // if item already exists in bill, increment the quantity
    const existingItem = billItems.find(
      (billItem) => billItem.item.id === item.id
    );
    if (existingItem) {
      existingItem.quantity += 1;
      return setBillItems([...billItems]);
    }
    const billItem: BillItem = {
      quantity: 1,
      item: item,
    };
    setBillItems([...billItems, billItem]);
  };

  const saveBill = async () => {
    try {
      const insertBill = await dbService.insertBill([TotalAmount, new Date()]);
      console.log('INSERTED BILL:', insertBill);

      const billId = insertBill.lastInsertId;
      console.log('BILL ID:', billId);
      // insert billItems for the bill
      await dbService.bulkInsertBillItems(billItems, billId);
      // await Promise.all(
      //   billItems.map((billItem) => {
      //     return dbService.insertBillItems(
      //       [billId, billItem.item.id, billItem.quantity]
      //     );
      //   })
      // );
      setBillItems([]);
      toast('Bill saved successfully', {
        position: 'top-center',
        duration: 1000,
      });
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const printBill = () => {
    console.log('Printing bill...');
  };

  const clearBill = () => {
    setBillItems([]);
  };

  return (
    <div
      className={`flex w-full flex-row`}
      style={{ height: 'calc(100% - 1.75rem)' }}
    >
      {/* // Nav Container */}

      <div className="h-full w-1/2 min-w-96 px-2 py-2">
        <div className="flex h-full flex-col">
          {/* input */}
          <div className="flex h-12 w-full flex-col">
            {/* <Input
                  className="w-full p-6 border border-zinc-700 rounded-none"
                  type="search"
                  placeholder="Press space to start search or click on the input box"
                  onChange={(e) => searchItem(e.target.value)}
                /> */}
            <SearchComponent data={filteredData} />
          </div>
          {/* cat and menu container */}
          <div
            className="mt-2 flex flex-row border border-zinc-700"
            style={{ height: 'calc(100% - 3.5rem)' }}
          >
            {/* category */}
            <div className="min-w-28 border-r border-zinc-700 p-1">
              <div
                onClick={() => {
                  setSelectedCategory(-1);
                  filterMenuItems(-1);
                }}
                className={cn('p-2 hover:bg-zinc-700', {
                  'bg-zinc-700': selectedCategory === -1 || !selectedCategory,
                })}
              >
                {'All'}
              </div>
              {categories.map((category) => (
                <div
                  onClick={() => {
                    setSelectedCategory(category.id);
                    filterMenuItems(category.id);
                  }}
                  className={cn('p-2  hover:bg-zinc-700', {
                    'border-y border-zinc-600 bg-zinc-700':
                      selectedCategory === category.id,
                  })}
                  key={category.id}
                >
                  {category.name.toLocaleUpperCase()}
                </div>
              ))}
            </div>
            {/* menu items */}
            <div className="min-w-96 flex-1 overflow-y-auto p-1">
              {filteredData.map((item) => (
                <div
                  onClick={() => addItemToBill(item)}
                  className="p-2 hover:bg-zinc-700"
                  key={item.id}
                >
                  {item.name} ::
                  {' Rs.'}
                  {item.price}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-full w-1/2 min-w-96 py-2 pr-2">
        <div className="flex h-full flex-1 flex-col overflow-y-auto border border-zinc-700">
          <div className="flex flex-row justify-between p-4">
            <div className="text-xl">Bill</div>
            <div className="text-xl">Total: Rs. {TotalAmount}</div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-scroll p-4">
            <table className="table-auto">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="py-1 px-4 text-left">Item</th>
                  <th className="py-1 px-4">Qty</th>
                  <th className="py-1 px-4">Price</th>
                  <th className="py-1 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((billItem) => (
                  <tr
                    className="border-y border-zinc-800"
                    key={billItem.item.id}
                  >
                    <td className="w-56 py-1 px-4">{billItem.item.name}</td>
                    <td className="text-center py-1 px-2">
                      <button
                        className="px-2 bg-zinc-700 rounded-sm border border-zinc-500"
                        onClick={() => {
                          const newQuantity = billItem.quantity - 1;
                          if (newQuantity < 1) return;
                          const updatedBillItems = billItems.map((item) => {
                            if (item.item.id === billItem.item.id) {
                              return { ...item, quantity: newQuantity };
                            }
                            return item;
                          });
                          setBillItems(updatedBillItems);
                        }}
                      >
                        -
                      </button>
                      <input
                        className="w-14 p-1 border border-zinc-700 rounded-sm text-center"
                        type="number"
                        value={billItem.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          const updatedBillItems = billItems.map((item) => {
                            if (item.item.id === billItem.item.id) {
                              return { ...item, quantity: newQuantity };
                            }
                            return item;
                          });
                          setBillItems(updatedBillItems);
                        }}
                      />
                      <button
                        className="px-2 bg-zinc-700 rounded-sm border border-zinc-500"
                        onClick={() => {
                          const newQuantity = billItem.quantity + 1;
                          const updatedBillItems = billItems.map((item) => {
                            if (item.item.id === billItem.item.id) {
                              return { ...item, quantity: newQuantity };
                            }
                            return item;
                          });
                          setBillItems(updatedBillItems);
                        }}
                      >
                        +
                      </button>
                    </td>
                    <td className="text-center py-1 px-4">
                      {billItem.item.price}
                    </td>
                    <td className="text-center py-1 px-4">
                      <button
                        className="bg-zinc-700 p-2 rounded-sm"
                        onClick={() => {
                          const newBillItems = billItems.filter(
                            (item) => item.item.id !== billItem.item.id
                          );
                          setBillItems(newBillItems);
                        }}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-row justify-between p-4">
            <div>Sub Total</div>
            <div>Rs. {TotalAmount}</div>
            <button className="bg-zinc-700 p-1" onClick={() => clearBill()}>
              Clear Bill
            </button>
            <button className="bg-zinc-700 p-1" onClick={() => saveBill()}>
              Save Bill
            </button>
            <button className="bg-zinc-700 p-1" onClick={() => printBill()}>
              Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
