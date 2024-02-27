import Database from "tauri-plugin-sql-api";

export async function dbInstance() {
    const db = await Database.load('sqlite:billy.db');
    return db;
}