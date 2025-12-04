export interface Wish {
  id: number;
  childName: string;
  age: number;
  wish: string;
  category: string;
  position: { x: number; y: number };
  color: string;
  status?: string;
  fulfilledBy?: string;
}

export const CATEGORIES = ['Игрушки', 'Книги', 'Спорт', 'Творчество', 'Мечта'];
export const COLORS = ['#FFD700', '#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'];
export const API_URL = 'https://functions.poehali.dev/8990a62f-83d1-4f33-88e1-fa8fcffaea2a';
export const WISHES_PER_PAGE = 8;
