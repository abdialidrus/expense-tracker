export interface Expense {
  id: number;
  created_at?: string;
  date: string;
  description: string;
  category: 'income' | 'outcome'; // DB values remain the same
  amount: number;
}

// Helper function to map DB category to display label
export function getCategoryLabel(category: 'income' | 'outcome'): string {
  return category === 'income' ? 'Credit' : 'Debit';
}