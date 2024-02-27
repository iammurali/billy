interface User {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    name: string;
    category_id: number;
    price: number;
}

interface BillItem {
    quantity: number;
    item: MenuItem;
}

interface Bill {
    id: number;
    total: number;
    date: string;
    items: BillItem[];
}