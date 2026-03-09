"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API = "http://localhost:4000/dev/reports";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewReport, setViewReport] = useState<any>(null);
  const [shareReport, setShareReport] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Quarterly",
    status: "Draft",
    generated: "",
  });

  /* LOAD REPORTS */

  async function loadReports() {
    const res = await fetch(API);
    const data = await res.json();

    setReports(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadReports();
  }, []);

  /* CREATE REPORT */

  async function createReport() {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setShowCreate(false);

    setForm({
      title: "",
      type: "Quarterly",
      status: "Draft",
      generated: "",
    });

    loadReports();
  }

  /* EXPORT */

  function exportReports() {
    window.open(`${API}/export`);
  }

  /* DOWNLOAD */

  function downloadReport(id: string) {
    window.open(`${API}/${id}/download`);
  }

  /* DASHBOARD METRICS */

  const totalReports = reports.length;

  const publishedReports = reports.filter(
    (r) => r.status === "Published",
  ).length;

  const totalDownloads = reports.reduce(
    (sum, r) => sum + (r.downloads || 0),
    0,
  );

  const lastGenerated = reports[0]?.generated || "-";

  /* UI */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>

          <p className="text-gray-500">
            Generate and manage sustainability reports
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReports}>
            Export
          </Button>

          <Button
            className="bg-green-600 text-white"
            onClick={() => setShowCreate(true)}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* DASHBOARD */}

      <div className="grid grid-cols-4 gap-4">
        <div className="border p-5 rounded">
          <p className="text-gray-500 text-sm">Total Reports</p>
          <h2 className="text-3xl font-bold">{totalReports}</h2>
        </div>

        <div className="border p-5 rounded">
          <p className="text-gray-500 text-sm">Published</p>
          <h2 className="text-3xl font-bold">{publishedReports}</h2>
        </div>

        <div className="border p-5 rounded">
          <p className="text-gray-500 text-sm">Total Downloads</p>
          <h2 className="text-3xl font-bold">{totalDownloads}</h2>
        </div>

        <div className="border p-5 rounded">
          <p className="text-gray-500 text-sm">Last Generated</p>
          <h2 className="text-3xl font-bold">{lastGenerated}</h2>
        </div>
      </div>

      {/* REPORT LIST */}

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="border p-6 rounded">
            <h3 className="text-lg font-semibold">{report.title}</h3>

            <p className="text-sm text-gray-500">{report.generated}</p>

            <div className="flex gap-6 mt-3 text-sm">
              <p>Type: {report.type}</p>
              <p>Status: {report.status}</p>
              <p>Downloads: {report.downloads}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setViewReport(report)}>
                View
              </Button>

              <Button
                variant="outline"
                onClick={() => downloadReport(report.id)}
              >
                Download
              </Button>

              <Button variant="outline" onClick={() => setShareReport(report)}>
                Share
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* GENERATE REPORT MODAL */}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Generate Report</h2>

            <input
              placeholder="Report Title"
              className="border p-2 w-full mb-3"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <select
              className="border p-2 w-full mb-3"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>Quarterly</option>
              <option>Annual</option>
            </select>

            <select
              className="border p-2 w-full mb-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Draft</option>
              <option>Published</option>
            </select>

            <input
              type="date"
              className="border p-2 w-full mb-4"
              value={form.generated}
              onChange={(e) => setForm({ ...form, generated: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                className="border px-4 py-2"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2"
                onClick={createReport}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW REPORT MODAL */}

      {viewReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Report Details</h2>

            <p>
              <b>Title:</b> {viewReport.title}
            </p>
            <p>
              <b>Type:</b> {viewReport.type}
            </p>
            <p>
              <b>Status:</b> {viewReport.status}
            </p>
            <p>
              <b>Generated:</b> {viewReport.generated}
            </p>
            <p>
              <b>Downloads:</b> {viewReport.downloads}
            </p>

            <div className="flex justify-end mt-4">
              <button
                className="border px-4 py-2"
                onClick={() => setViewReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}

      {shareReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Share Report</h2>

            <input
              className="border p-2 w-full mb-4"
              value={`${window.location.origin}/reports/${shareReport.id}`}
              readOnly
            />

            <button
              className="bg-green-600 text-white px-4 py-2"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/reports/${shareReport.id}`,
                );
                alert("Link copied!");
              }}
            >
              Copy Link
            </button>

            <div className="mt-4">
              <button
                className="border px-4 py-2"
                onClick={() => setShareReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
