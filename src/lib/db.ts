import Database, { QueryResult } from "tauri-plugin-sql-api";

export async function dbInstance() {
    const db = await Database.load('sqlite:billy.db');
    return db;
}

export class DatabaseService {
  private databaseUrl: string;
  private db: Database | null; // Replace 'any' with the actual type of your database library

  constructor(databaseUrl?: string) {
    this.databaseUrl = databaseUrl || 'sqlite:billy.db';
    this.db = null
  }

  private async openConnection() {
    if (!this.db) {
      this.db = await Database.load(this.databaseUrl);
    }
    return this.db;
  }

  private async closeConnection() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  public async executeQuery<T>(query: string, params: any[] = []): Promise<QueryResult> {
    const db = await this.openConnection();
    try {
      return await db.execute(query, params);
    } finally {
      await this.closeConnection();
    }
  }

  private async selectQuery<T>(query: string, params: any[] = []): Promise<T> {
    const db = await this.openConnection();
    try {
      return await db.select(query, params);
    } finally {
      await this.closeConnection();
    }
  }

  // Add more methods as needed
  public async getMenuItems() : Promise<MenuItem[]>{
    return this.selectQuery<MenuItem[]>('SELECT * FROM menu_items;');
  }

  public async getCategories(): Promise<Category[]>{
    return this.selectQuery<Category[]>('SELECT * from category;');
  }

  public async insertBill(params: any[]): Promise<QueryResult> {
    return this.executeQuery<QueryResult>('INSERT INTO bills (total, date) VALUES (?, ?);', params);
  }

  public async bulkInsertBillItems(billItems: BillItem[], billId: number) {
    const db = await this.openConnection();
    try {
      await Promise.all(
        billItems.map((billItem) => {
          return db.execute(
            'INSERT INTO bill_items (bill_id, menu_item_id, quantity) VALUES (?, ?, ?);',
            [billId, billItem.item.id, billItem.quantity]
          );
        })
      )
    } finally {
      await this.closeConnection();
    }
  }

  public async insertBillItems(params: any[]): Promise<QueryResult> {
    return this.executeQuery<QueryResult>('INSERT INTO bill_items (bill_id, menu_item_id, quantity) VALUES (?, ?, ?);', params);
  }

  public async truncateTables(): Promise<void> {
    await this.executeQuery<void>('DELETE FROM bill_items;');
    await this.executeQuery<void>('DELETE FROM bills;');
    await this.executeQuery<void>('DELETE FROM menu_items;');
    await this.executeQuery<void>('DELETE FROM users;');
    await this.executeQuery<void>('DELETE FROM category;');
  }

  
}

