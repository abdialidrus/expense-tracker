export interface Expense {
  id: number;
  created_at?: string;
  date: string;
  description: string;
  category: 'income' | 'outcome';
  amount: number;
}