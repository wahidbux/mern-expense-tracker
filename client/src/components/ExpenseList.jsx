import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExpenseList({ expenses: initialExpenses }) {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
  });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/expenses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(res.data);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };

    fetchExpenses();
  }, []);

  const deleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Could not delete expense');
    }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    setEditForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date?.substring(0, 10) || '',
    });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/expenses/${id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setExpenses((prev) => prev.map((e) => (e._id === id ? res.data : e)));
      setEditId(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Could not update expense');
    }
  };
  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      if (filterCategory && expense.category.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }
      if (filterStartDate && new Date(expense.date) < new Date(filterStartDate)) {
        return false;
      }
      if (filterEndDate && new Date(expense.date) > new Date(filterEndDate)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'category-asc') {
        return a.category.localeCompare(b.category);
      } else if (sortBy === 'category-desc') {
        return b.category.localeCompare(a.category);
      }
      return 0;
    });
  const categories = [...new Set(expenses.map((expense) => expense.category))];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-green-600">💸 Expense History</h2>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filter & Sort</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="category-desc">Category (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedExpenses.length === 0 ? (
        <p className="text-gray-500 text-center">No expenses found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAndSortedExpenses.map((expense) => (
            <li
              key={expense._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              {editId === expense._id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 w-full">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Title"
                  />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                    placeholder="Category"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ) : (
                <div className="flex flex-col text-gray-800 gap-1">
                  <div className="text-lg font-semibold text-gray-800">{expense.title}</div>
                  <div className="text-md font-bold text-green-700">₹{expense.amount}</div>
                  <div className="text-sm text-gray-600 capitalize">📂 {expense.category}</div>
                  {expense.date && (
                    <div className="text-sm text-gray-500">
                      📅 {new Date(expense.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end flex-wrap">
                {editId === expense._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(expense._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExpense(expense._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
