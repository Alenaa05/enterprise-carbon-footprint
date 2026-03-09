"use client";

import { useEffect, useState } from "react";
import AIRecommendations from "@/components/AIRecommendations";
import api, { ComplianceRecord } from "@/lib/api";

type Regulation = ComplianceRecord & {
  status: "Compliant" | "Pending" | "Non-Compliant";
};

export default function CompliancePage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Pending",
    lastAudit: "",
  });

  /* ---------------- LOAD DATA ---------------- */

  async function loadRegulations() {
    try {
      const data = await api.getCompliance();
      setRegulations(data as Regulation[]);
    } catch (err) {
      console.error("Fetch error", err);
    }
  }

  useEffect(() => {
    loadRegulations();
  }, []);

  /* ---------------- CREATE ---------------- */

  async function handleSubmit() {
    await api.createCompliance(form);

    setShowModal(false);

    setForm({
      title: "",
      description: "",
      dueDate: "",
      status: "Pending",
      lastAudit: "",
    });

    loadRegulations();
  }

  /* ---------------- DELETE ---------------- */

  async function deleteRegulation(id: string) {
    await api.deleteCompliance(id);

    loadRegulations();
  }

  /* ---------------- METRICS ---------------- */

  const compliant = regulations.filter((r) => r.status === "Compliant").length;
  const pending = regulations.filter((r) => r.status === "Pending").length;
  const non = regulations.filter((r) => r.status === "Non-Compliant").length;

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Compliance & Regulations</h1>

          <p className="text-gray-500">
            Manage regulatory requirements and certifications
          </p>
        </div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Add Regulation
        </button>
      </div>

      {/* METRICS */}

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Metric title="Total Regulations" value={regulations.length} />
        <Metric title="Compliant" value={compliant} />
        <Metric title="Non‑Compliant" value={non} />
        <Metric title="Pending Review" value={pending} />
      </div>

      {/* AI INSIGHTS */}

      <AIRecommendations />

      {/* REGULATION LIST */}

      <div className="space-y-4">
        {regulations.map((reg) => (
          <div
            key={reg.id}
            className="border rounded-lg p-6 flex justify-between items-start bg-white shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {reg.title}
              </h3>

              <p className="text-gray-500 text-sm mt-1">{reg.description}</p>

              <div className="flex gap-12 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p className="font-medium">{reg.dueDate}</p>
                </div>

                <div>
                  <p className="text-gray-500">Last Audit</p>
                  <p className="font-medium">{reg.lastAudit || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* STATUS + DELETE */}

            <div className="flex flex-col items-end gap-3">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  reg.status === "Compliant"
                    ? "bg-green-100 text-green-700"
                    : reg.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {reg.status}
              </span>

              <button
                onClick={() => deleteRegulation(reg.id!)}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD REGULATION MODAL */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add Regulation</h2>

            <input
              placeholder="Title"
              className="border p-2 w-full mb-3 rounded"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              placeholder="Description"
              className="border p-2 w-full mb-3 rounded"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="date"
              className="border p-2 w-full mb-3 rounded"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />

            <select
              className="border p-2 w-full mb-3 rounded"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Regulation["status"],
                })
              }
            >
              <option>Pending</option>
              <option>Compliant</option>
              <option>Non-Compliant</option>
            </select>

            <input
              type="date"
              className="border p-2 w-full mb-4 rounded"
              value={form.lastAudit}
              onChange={(e) => setForm({ ...form, lastAudit: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- METRIC CARD ---------------- */

function Metric({ title, value }: any) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
