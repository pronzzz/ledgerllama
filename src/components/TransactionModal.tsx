import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import type { Transaction } from '../hooks/useTransactions';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'ai_categorized' | 'ai_confidence'>) => Promise<void>;
  initialData?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSave, initialData }: TransactionModalProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;
    
    setLoading(true);
    try {
      await onSave({
        amount: parseFloat(amount),
        description,
        date,
        type: parseFloat(amount) < 0 ? 'expense' : 'income',
        category_id: null,
      });
      onClose();
      // Reset form on success
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Transaction" : "New Transaction"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <input
            type="text"
            required
            placeholder="Grocery store, Salary, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background pl-8 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Use negative values for expenses.</p>
        </div>
        
        <div className="pt-4 flex justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
