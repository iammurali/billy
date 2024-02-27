// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {

  let migrations = vec![
    // Migration for creating all tables
    Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
            CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, password TEXT);
            CREATE TABLE category (id INTEGER PRIMARY KEY, name TEXT);
            CREATE TABLE menu_items (id INTEGER PRIMARY KEY, name TEXT, price REAL, category_id INTEGER, FOREIGN KEY(category_id) REFERENCES category(id));
        ",
        kind: MigrationKind::Up,
    },
    // Migration for billitems table and bills table
    Migration {
        version: 2,
        description: "create_bill_tables",
        sql: "
            CREATE TABLE bills (id INTEGER PRIMARY KEY, user_id INTEGER, date TEXT, FOREIGN KEY(user_id) REFERENCES users(id));
            CREATE TABLE bill_items (id INTEGER PRIMARY KEY, bill_id INTEGER, menu_item_id INTEGER, quantity INTEGER, FOREIGN KEY(bill_id) REFERENCES bills(id), FOREIGN KEY(menu_item_id) REFERENCES menu_items(id));
        ",
        kind: MigrationKind::Up,
    },
    // Migration for adding a total column to bills table
    Migration {
        version: 3,
        description: "add_total_column_to_bills",
        sql: "
            ALTER TABLE bills ADD COLUMN total REAL;
        ",
        kind: MigrationKind::Up,
    },

    
];
  

  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:billy.db", migrations).build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
