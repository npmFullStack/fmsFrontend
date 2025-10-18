// pages/CategoryList.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveCategory = async () => {
    try {
      if (!name || !baseRate) return alert("Name and Base Rate required!");

      if (editId) {
        await api.put(`/categories/${editId}`, { name, base_rate: baseRate });
        setEditId(null);
      } else {
        await api.post("/categories", { name, base_rate: baseRate });
      }

      setName("");
      setBaseRate("");
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const editCategory = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setBaseRate(cat.base_rate);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Category Management</h1>

      {/* Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Base Rate"
          value={baseRate}
          onChange={(e) => setBaseRate(e.target.value)}
          className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={saveCategory}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Base Rate</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr
                key={cat.id}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{cat.name}</td>
                <td className="px-4 py-2">₱{cat.base_rate}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => editCategory(cat)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryList;
