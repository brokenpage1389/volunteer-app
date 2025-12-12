import React, { useState } from "react";

export default function VolunteerDashboard({ currentUser, events, applications, onApply, onLogout, onNavigate }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const myApps = applications.filter((a) => a.applicant === currentUser.email);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "urgent") {
      matchesFilter = event.volunteers > 5;
    } else if (filterType === "small-team") {
      matchesFilter = event.volunteers <= 5;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Dashboard</h1>
        <div className="relative">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="bg-gray-200 px-3 py-1 rounded">Settings</button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-32 z-10">
              <button onClick={() => { onNavigate("profile"); setSettingsOpen(false); }} className="block w-full text-left px-2 py-1 hover:bg-gray-100">Profile</button>
              <button onClick={onLogout} className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500">Logout</button>
            </div>
          )}
        </div>
      </div>

      <h2 className="font-semibold mb-2">Available Events</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Events</option>
            <option value="urgent">Urgent Needs (5+)</option>
            <option value="small-team">Small Teams (≤5)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 italic col-span-full text-center py-4">No events found matching your search.</p>
        ) : (
          filteredEvents.map((e) => (
            <div key={e.id} className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg">{e.title}</h3>
              <p className="text-sm text-gray-600">Start: {e.startDate} • needed: {e.volunteers}</p>
              <p className="mt-2">{e.description}</p>
              <button onClick={() => onApply(e)} className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                Apply
              </button>
            </div>
          ))
        )}
      </div>

      <h2 className="font-semibold mb-2">My Applications</h2>
      <div className="flex flex-col gap-3">
        {myApps.length === 0 && <p className="text-gray-500">No applications yet.</p>}
        {myApps.map((a, idx) => (
          <div key={idx} className="border p-3 rounded bg-white">
            <p className="font-bold">{a.title}</p>
            <p>Status: {a.status === "accepted" ? "🟢 Accepted" : a.status === "rejected" ? "🔴 Rejected" : "🟡 Pending"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}