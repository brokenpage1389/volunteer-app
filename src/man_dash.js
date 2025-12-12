import React, { useState, useEffect } from "react";

export default function ManagerDashboard({ 
  currentUser, 
  events, 
  applications, 
  onCreateEvent, 
  onUpdateStatus, 
  onLogout, 
  onNavigate, 
  onUpdateEvent, 
  onDeleteEvent 
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, title: "", start: "", end: "", vol: "", desc: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const myPending = applications.filter(a => a.organizer === currentUser.email && a.status === "pending");
    setPendingCount(myPending.length);
  }, [applications, currentUser.email]);

  const handleCreateOrUpdate = () => {
    if (!form.title || !form.start || !form.end || !form.vol || !form.desc) 
      return alert("Fill all fields");

    const today = new Date().setHours(0,0,0,0);
    if (new Date(form.start).setHours(0,0,0,0) < today) 
      return alert("Start date cannot be in the past");

    if (new Date(form.end) < new Date(form.start)) 
      return alert("End date cannot be before start date");

    if (form.id) {
      onUpdateEvent({
        id: form.id,
        title: form.title,
        startDate: form.start,
        endDate: form.end,
        volunteers: Number(form.vol),
        description: form.desc,
        createdBy: currentUser.email
      });
      alert("Event updated");
    } else {
      onCreateEvent({
        id: Date.now(),
        title: form.title,
        startDate: form.start,
        endDate: form.end,
        volunteers: Number(form.vol),
        description: form.desc,
        createdBy: currentUser.email
      });
    }

    setForm({ id: null, title: "", start: "", end: "", vol: "", desc: "" });
    setShowModal(false);
  };

  const myEvents = events.filter(e => e.createdBy === currentUser.email);

  const filteredEvents = myEvents.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "high-need") matchesFilter = e.volunteers > 5;
    else if (filterType === "low-need") matchesFilter = e.volunteers <= 5;

    return matchesSearch && matchesFilter;
  });

  const actionableApplications = applications.filter(a => 
    a.organizer === currentUser.email && a.status !== "rejected"
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>

        <div className="relative flex gap-2">
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Create Event
          </button>

          <button 
            onClick={() => setSettingsOpen(!settingsOpen)} 
            className="bg-gray-200 px-3 py-1 rounded"
          >
            Settings
          </button>

          {pendingCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
              {pendingCount}
            </div>
          )}

          {settingsOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-32 z-10">
              <button 
                onClick={() => { onNavigate("profile"); setSettingsOpen(false); }} 
                className="block w-full text-left px-2 py-1 hover:bg-gray-100"
              >
                Profile
              </button>
              <button 
                onClick={onLogout} 
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {form.id ? "Edit Event" : "Create Event"}
            </h2>

            <input 
              className="p-2 border w-full mb-2 rounded"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input 
              type="date"
              className="p-2 border w-full mb-2 rounded"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />

            <input 
              type="date"
              className="p-2 border w-full mb-2 rounded"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />

            <input 
              type="number"
              className="p-2 border w-full mb-2 rounded"
              placeholder="Volunteers Needed"
              value={form.vol}
              onChange={(e) => setForm({ ...form, vol: e.target.value })}
            />

            <textarea 
              className="p-2 border w-full mb-2 rounded"
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />

            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={handleCreateOrUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {form.id ? "Update" : "Create"}
              </button>

              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-2">Your Created Events</h2>
      <div className="flex flex-col gap-3 mb-6">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 italic py-4 text-center">No events found.</p>
        ) : (
          filteredEvents.map(e => (
            <div key={e.id} className="border p-3 rounded bg-gray-50">
              <p className="font-bold">{e.title}</p>
              <p className="text-sm">
                Start: {e.startDate} • End: {e.endDate} • Volunteers: {e.volunteers}
              </p>
              <p className="mt-1">{e.description}</p>

              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => { 
                    setForm({ 
                      id: e.id, 
                      title: e.title, 
                      start: e.startDate, 
                      end: e.endDate, 
                      vol: e.volunteers, 
                      desc: e.description 
                    }); 
                    setShowModal(true);
                  }}
                  className="bg-yellow-400 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button 
                  onClick={() => onDeleteEvent(e.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="font-semibold mb-2">Applications For Your Events</h2>
      <div className="flex flex-col gap-3">
        {actionableApplications.length === 0 && (
          <p className="text-gray-500">No applications pending or accepted for your events.</p>
        )}

        {actionableApplications.map((a, idx) => (
          <div key={idx} className="border p-3 rounded bg-white">
            <p className="font-bold">{a.title}</p>
            <p>Applicant: {a.applicant} ({a.volunteerType})</p>
            <p>Status: {a.status}</p>

            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "accepted")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>

              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
