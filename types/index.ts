export type Expense = {
  id: number;
  date: string;
  description: string;
  category: 'income' | 'outcome';
  amount: number;
  created_at: string;
};

export type ExpenseFormData = Omit<Expense, 'id' | 'created_at'>;