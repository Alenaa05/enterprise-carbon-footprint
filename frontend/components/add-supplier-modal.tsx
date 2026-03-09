"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AddSupplierModal({ open, onClose, onCreated }: any) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Logistics");
  const [location, setLocation] = useState("");
  const [carbon, setCarbon] = useState("");
  const [certs, setCerts] = useState("");

  if (!open) return null;

  async function submit(e: any) {
    e.preventDefault();

    await api.createSupplier({
      name,
      category,
      location,
      carbonFootprint: Number(carbon),
      certifications: certs ? certs.split(",").map((c) => c.trim()) : [],
    });

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Supplier</h2>

        <form className="space-y-3" onSubmit={submit}>
          <input
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Logistics</option>
            <option>Manufacturing</option>
            <option>Packaging</option>
          </select>

          <input
            placeholder="Location"
            className="w-full border p-2 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="number"
            placeholder="Carbon Footprint (kg)"
            className="w-full border p-2 rounded"
            value={carbon}
            onChange={(e) => setCarbon(e.target.value)}
          />

          <input
            placeholder="Certifications (comma separated)"
            className="w-full border p-2 rounded"
            value={certs}
            onChange={(e) => setCerts(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="border px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="bg-black text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
