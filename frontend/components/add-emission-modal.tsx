"use client"

import { useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function AddEmissionModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    source: "",
    facility: "",
    amount: "",
    date: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    try {
      setLoading(true)

      await api.createEmission({
        source: form.source,
        facility: form.facility,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes,
      })

      onCreated()
      onClose()
      setForm({ source: "", facility: "", amount: "", date: "", notes: "" })
    } catch (err) {
      console.error(err)
      alert("Failed to create emission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Emission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Source</Label>
            <Input name="source" value={form.source} onChange={handleChange} />
          </div>

          <div>
            <Label>Facility</Label>
            <Input name="facility" value={form.facility} onChange={handleChange} />
          </div>

          <div>
            <Label>Amount (kg CO2e)</Label>
            <Input name="amount" type="number" value={form.amount} onChange={handleChange} />
          </div>

          <div>
            <Label>Date</Label>
            <Input name="date" type="date" value={form.date} onChange={handleChange} />
          </div>

          <div>
            <Label>Notes</Label>
            <Input name="notes" value={form.notes} onChange={handleChange} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}