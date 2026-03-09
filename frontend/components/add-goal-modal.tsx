"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddGoalModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("carbon");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  async function handleSubmit() {
    if (!title || !category || !target || !unit || !deadline) {
      alert("Please fill all fields");
      return;
    }

    await api.createGoal({
      title,
      category,
      target: Number(target),
      unit,
      deadline,
      progress: 0,
      status: "on-track",
    });

    onCreated();
    onClose();

    setTitle("");
    setCategory("carbon");
    setTarget("");
    setUnit("");
    setDeadline("");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Create Sustainability Goal</DialogTitle>
        </DialogHeader>

        {/* TITLE */}

        <div className="space-y-1">
          <label className="text-sm font-medium">Goal Title</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Example: Carbon Neutral by 2030"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* CATEGORY DROPDOWN */}

        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>

          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="carbon">Carbon</option>
            <option value="energy">Energy</option>
            <option value="waste">Waste</option>
            <option value="water">Water</option>
            <option value="supply-chain">Supply Chain</option>
          </select>
        </div>

        {/* TARGET */}

        <div className="space-y-1">
          <label className="text-sm font-medium">Target</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Example: 100"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        {/* UNIT */}

        <div className="space-y-1">
          <label className="text-sm font-medium">Unit</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Example: % or kg CO2e"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        {/* DEADLINE */}

        <div className="space-y-1">
          <label className="text-sm font-medium">Deadline</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* ACTION BUTTONS */}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
