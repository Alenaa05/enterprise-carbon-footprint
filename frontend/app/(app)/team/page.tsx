"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const API = "http://localhost:4000/dev/teams";

export default function TeamPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    lead: "",
    members: "",
    responsibilities: "",
    projectsActive: 0,
  });

  /* ---------------- LOAD TEAMS ---------------- */

  async function loadTeams() {
    const res = await fetch(API);

    const data = await res.json();

    setTeams(data);
  }

  useEffect(() => {
    loadTeams();
  }, []);

  /* ---------------- CREATE TEAM ---------------- */

  async function createTeam() {
    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setShowCreate(false);

    setForm({
      name: "",
      lead: "",
      members: "",
      responsibilities: "",
      projectsActive: 0,
    });

    loadTeams();
  }

  /* ---------------- OPEN EDIT ---------------- */

  function openEdit(team: any) {
    setSelectedTeam(team);

    setForm({
      name: team.name || "",
      lead: team.lead || "",
      members: team.members || "",
      responsibilities: team.responsibilities || "",
      projectsActive: team.projectsActive ?? 0,
    });

    setShowEdit(true);
  }

  /* ---------------- UPDATE TEAM ---------------- */

  async function updateTeam() {
    console.log("Updating team:", selectedTeam.id, form);

    const res = await fetch(`${API}/${selectedTeam.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log("Update response:", data);

    setShowEdit(false);

    loadTeams();
  }

  /* ---------------- FILTER ---------------- */

  async function filterTeams(min: number) {
    const res = await fetch(`${API}/filter?projects=${min}`);

    const data = await res.json();

    setTeams(data);

    setShowFilter(false);
  }

  /* ---------------- EXPORT ---------------- */

  function exportTeams() {
    window.open(`${API}/export`);
  }

  /* ---------------- DASHBOARD METRICS ---------------- */

  const activeTeams = teams.length;

  const teamMembers = teams.reduce((sum, t) => {
    if (!t.members) return sum;

    return sum + t.members.split(",").length;
  }, 0);

  const projectsActive = teams.reduce((sum, t) => {
    return sum + (t.projectsActive || 0);
  }, 0);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Collaboration</h1>

          <p className="text-gray-500">
            Manage teams and coordinate sustainability initiatives
          </p>
        </div>

        <div className="flex gap-2">
          {/* FILTER */}

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilter(!showFilter)}
            >
              Filter
            </Button>

            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow w-40">
                <button
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => loadTeams()}
                >
                  All
                </button>

                <button
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => filterTeams(1)}
                >
                  1+ Projects
                </button>

                <button
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => filterTeams(2)}
                >
                  2+ Projects
                </button>

                <button
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                  onClick={() => filterTeams(3)}
                >
                  3+ Projects
                </button>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={exportTeams}>
            Export
          </Button>

          <Button
            className="bg-green-600 text-white"
            onClick={() => setShowCreate(true)}
          >
            Create Team
          </Button>
        </div>
      </div>

      {/* DASHBOARD */}

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-5">
          <p className="text-gray-500 text-sm">Active Teams</p>

          <h2 className="text-3xl font-bold">{activeTeams}</h2>
        </div>

        <div className="border rounded p-5">
          <p className="text-gray-500 text-sm">Team Members</p>

          <h2 className="text-3xl font-bold">{teamMembers}</h2>
        </div>

        <div className="border rounded p-5">
          <p className="text-gray-500 text-sm">Projects Active</p>

          <h2 className="text-3xl font-bold">{projectsActive}</h2>
        </div>
      </div>

      {/* TEAM LIST */}

      <div className="space-y-5">
        {teams.map((team) => {
          const members = team.members?.split(",") || [];
          const responsibilities = team.responsibilities?.split(",") || [];

          return (
            <div key={team.id} className="border p-6 rounded">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>

                  <p className="text-gray-500">Led by {team.lead}</p>
                </div>

                <Button variant="outline" onClick={() => openEdit(team)}>
                  Edit
                </Button>
              </div>

              <div className="mt-4">
                <p className="font-medium mb-2">
                  Team Members ({members.length})
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {members.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="border rounded p-2 flex items-center gap-2"
                    >
                      <div className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center text-sm font-bold">
                        {m.trim()[0]}
                      </div>

                      <span className="text-sm">{m.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {responsibilities.map((r: any, i: number) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {r.trim()}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Projects Active: {team.projectsActive || 0}
              </p>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Create Team</h2>

            <input
              placeholder="Team Name"
              className="border p-2 w-full mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Team Lead"
              className="border p-2 w-full mb-3"
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
            />

            <input
              placeholder="Members"
              className="border p-2 w-full mb-3"
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
            />

            <input
              placeholder="Responsibilities"
              className="border p-2 w-full mb-3"
              value={form.responsibilities}
              onChange={(e) =>
                setForm({ ...form, responsibilities: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Projects Active"
              className="border p-2 w-full mb-4"
              value={form.projectsActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectsActive: Number(e.target.value),
                })
              }
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
                onClick={createTeam}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[420px]">
            <h2 className="text-lg font-semibold mb-4">Edit Team</h2>

            <input
              className="border p-2 w-full mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-3"
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-3"
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-3"
              value={form.responsibilities}
              onChange={(e) =>
                setForm({ ...form, responsibilities: e.target.value })
              }
            />

            <input
              type="number"
              className="border p-2 w-full mb-4"
              value={form.projectsActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectsActive: Number(e.target.value),
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="border px-4 py-2"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2"
                onClick={updateTeam}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
