'use client'; // research about this

import Link from 'next/link';
import React, { use, useCallback, useEffect, useState } from 'react';
import Database from 'tauri-plugin-sql-api';

import { Input } from '@/components/ui/input';
import { toast } from "sonner"

import { DatabaseService } from '@/lib/db';
import { cn } from '@/lib/utils';
import SearchComponent from '@/components/search-component';


const dbService = new DatabaseService()

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
    await dbService.truncateTables()
  }

  useEffect(() => {
    // truncateData()
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
        1: ['Tea', 'Coffee', 'Iced Tea', 'Smoothie', 'Hot Chocolate', 'Milkshake', 'Soda', 'Lemonade', 'Fruit Juice', 'Water'],
        2: ['Burger', 'Pizza', 'Sandwich', 'Nachos', 'French Fries', 'Chicken Wings', 'Mozzarella Sticks', 'Quesadilla', 'Spring Rolls', 'Pretzels'],
        3: ['Toy 1', 'Toy 2', 'Toy 3', 'Toy 4', 'Toy 5', 'Toy 6', 'Toy 7', 'Toy 8', 'Toy 9', 'Toy 10'],
        4: ['Orange Juice', 'Apple Juice', 'Grape Juice', 'Pineapple Juice', 'Cranberry Juice', 'Carrot Juice', 'Tomato Juice', 'Watermelon Juice', 'Coconut Water', 'Mango Juice'],
        5: ['Fried Chicken', 'Fried Fish', 'Fried Shrimp', 'Fried Calamari', 'Fried Tofu', 'Fried Pickles', 'Fried Okra', 'Fried Zucchini', 'Fried Cheese', 'Fried Mushrooms'],
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
      const result = await dbService.getMenuItems()
      setMenuItems(result);
      setFilteredData(result);
    } catch (error) {
      console.log(error)
    }
  };
  const getCategories = async () => {
    try {
      const result: Category[] = await dbService.getCategories()
      console.log('categories::::', result);
      setCategories(result);
    } catch (error) {
      console.log(error)
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
      console.log('Bill items test', error)
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
      const insertBill = await dbService.insertBill(
        [TotalAmount, new Date()]
      );
      console.log('INSERTED BILL:', insertBill);

      const billId = insertBill.lastInsertId;
      console.log('BILL ID:', billId);
      // insert billItems for the bill
      await Promise.all(
        billItems.map((billItem) => {
          return dbService.insertBillItems(
            [billId, billItem.item.id, billItem.quantity]
          );
        })
      );
      setBillItems([])
      toast('Bill saved successfully', { position: 'top-center', duration: 1000 })
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const printBill = () => {
    console.log('Printing bill...');
  };

  const clearBill = () => {
    setBillItems([]);
  }

  return (
    <main className="flex h-screen min-w-96">
      <div className="h-full flex flex-col w-full">
        <div className="border-b border-zinc-700 bg-zinc-800 flex flex-row justify-start font-light text-sm h-9">
          <Link
            href={'/manage-menu'}
            className="border-zinc-600 text-left hover:bg-zinc-500 px-2 py-1 rounded-sm"
          >
            Manage menu
          </Link>
          <Link
            href={'/reports'}
            className="border-zinc-600 text-center hover:bg-zinc-500 px-2 py-1 rounded-sm"
          >
            Reports
          </Link>
          <Link
            href={'/bills'}
            className="border-zinc-600 text-center hover:bg-zinc-500 px-2 py-1 rounded-sm"
          >
            Bills
          </Link>
        </div>
        <div className="flex flex-row h-full">
          <div className="h-full w-1/2 min-w-96">
            <div className="flex flex-col h-full p-2">
              <div className="flex flex-col w-full">
                {/* <Input
                  className="w-full p-6 border border-zinc-700 rounded-none"
                  type="search"
                  placeholder="Press space to start search or click on the input box"
                  onChange={(e) => searchItem(e.target.value)}
                /> */}
                <SearchComponent data={filteredData} />
              </div>
              <div className="border border-zinc-700 mt-2 flex flex-row h-[91%] max-h-[91%]">
                <div className="w-[17%] min-w-28 p-1 border-r border-zinc-700 h-full">
                  <div
                    onClick={() => {
                      setSelectedCategory(-1);
                      filterMenuItems(-1);
                    }}
                    className={cn('hover:bg-zinc-700 p-2', {
                      'bg-zinc-700':
                        selectedCategory === -1 || !selectedCategory,
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
                      className={cn('hover:bg-zinc-700  p-2', {
                        'bg-zinc-700 border-y border-zinc-600':
                          selectedCategory === category.id,
                      })}
                      key={category.id}
                    >
                      {category.name.toLocaleUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="min-w-96 w-[83%] p-1 h-full overflow-y-scroll">
                  {filteredData.map((item) => (
                    <div
                      onClick={() => addItemToBill(item)}
                      className="hover:bg-zinc-700 p-2"
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
          <div className="bg-green h-full w-1/2 min-w-96 py-2 pr-2">
            <div className="border border-zinc-700 flex flex-col h-full">
              <div className="flex flex-row justify-between p-2">
                <div className="text-xl">Bill</div>
                <div className="text-xl">Total: Rs. {TotalAmount}</div>
              </div>
              <div className="flex flex-col p-2">
                {billItems.map((billItem) => (
                  <div
                    className="flex flex-row justify-between"
                    key={billItem.item.id}
                  >
                    <div>{billItem.item.name}</div>
                    <div>{billItem.quantity}</div>
                    <div>{billItem.item.price}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-row justify-between p-2">
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
      </div>
    </main>
  );
}
