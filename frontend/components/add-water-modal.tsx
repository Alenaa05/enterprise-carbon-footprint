"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddWaterModal({ open, onClose, onCreated }: Props) {
  const [date, setDate] = useState("");
  const [source, setSource] = useState("");
  const [facility, setFacility] = useState("");
  const [consumption, setConsumption] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!date || !source || !consumption) {
      setError("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.createWater({
        date,
        source,
        facility,
        consumption: Number(consumption),
        cost: cost ? Number(cost) : 0,
      });

      onCreated();
      onClose();

      // reset form
      setDate("");
      setSource("");
      setFacility("");
      setConsumption("");
      setCost("");
    } catch (err: any) {
      setError(err.message || "Failed to add record");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold">Log Water Usage</h2>

        {/* DATE */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Date *</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* SOURCE DROPDOWN */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Source *</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select source</option>
            <option value="Municipal">Municipal</option>
            <option value="Recycled">Recycled</option>
            <option value="Groundwater">Groundwater</option>
          </select>
        </div>

        {/* FACILITY */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Facility</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            placeholder="HQ, Plant A, etc."
          />
        </div>

        {/* CONSUMPTION */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Consumption (Liters) *</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        {/* COST */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Cost</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
