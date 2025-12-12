import React, { useState, useEffect } from "react";

const ALL_TAGS = [
  "Teaching", "Distributing", "Arrangement", "Manual Labor", 
  "Mentoring", "Administration", "Fundraising", "Transportation", 
  "Skill Sharing", "Logistics", "Cleanup", "Public Outreach"
];

export default function ManagerDashboard({ 
  currentUser, 
  events, 
  applications, 
  onCreateEvent, 
  onUpdateStatus, 
  onLogout, 
  onNavigate, 
  onUpdateEvent, 
  onDeleteEvent,
  onEndRecruiting
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, title: "", start: "", end: "", vol: "", desc: "", selectedTags: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tagFilter, setTagFilter] = useState("all"); 
  const [pendingCount, setPendingCount] = useState(0);
  
  // NEW STATE: Search term for applications
  const [appSearchTerm, setAppSearchTerm] = useState("");

  useEffect(() => {
    const myPending = applications.filter(a => a.organizer === currentUser.email && a.status === "pending");
    setPendingCount(myPending.length);
  }, [applications, currentUser.email]);

  const handleTagToggle = (tag) => {
    setForm(prevForm => {
      const currentTags = prevForm.selectedTags;
      if (currentTags.includes(tag)) {
        return { ...prevForm, selectedTags: currentTags.filter(t => t !== tag) };
      } else if (currentTags.length < 3) {
        return { ...prevForm, selectedTags: [...currentTags, tag] };
      }
      return prevForm;
    });
  };

  const _resetForm = () => {
    setForm({ id: null, title: "", start: "", end: "", vol: "", desc: "", selectedTags: [] });
  };

  const handleCreateOrUpdate = () => {
    if (!form.title || !form.start || !form.end || !form.vol || !form.desc) 
      return alert("Fill all fields");

    const today = new Date().setHours(0,0,0,0);
    if (new Date(form.start).setHours(0,0,0,0) < today) 
      return alert("Start date cannot be in the past");

    if (new Date(form.end) < new Date(form.start)) 
      return alert("End date cannot be before start date");

    const newEventObj = {
      id: form.id || Date.now(),
      title: form.title,
      startDate: form.start,
      endDate: form.end,
      volunteers: Number(form.vol),
      description: form.desc,
      createdBy: currentUser.email,
      tags: form.selectedTags,
      recruiting: form.id ? events.find(e => e.id === form.id)?.recruiting ?? true : true
    };

    if (form.id) {
      onUpdateEvent(newEventObj);
      alert("Event updated");
    } else {
      onCreateEvent(newEventObj);
    }

    _resetForm();
    setShowModal(false);
  };
  
  const _initEditForm = (e) => {
    setForm({ 
      id: e.id, 
      title: e.title, 
      start: e.startDate, 
      end: e.endDate, 
      vol: e.volunteers, 
      desc: e.description,
      selectedTags: e.tags || []
    }); 
    setShowModal(true);
  };
  
  const myEvents = events.filter(e => e.createdBy === currentUser.email);

  const filteredEvents = myEvents.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "high-need") matchesFilter = e.volunteers > 5;
    else if (filterType === "low-need") matchesFilter = e.volunteers <= 5;

    let matchesTag = true;
    if (tagFilter !== "all") {
        matchesTag = e.tags && e.tags.includes(tagFilter);
    }

    return matchesSearch && matchesFilter && matchesTag;
  });

  // NEW FUNCTION: Filters applications by event title and applicant email
  const _filterApplications = (apps, term) => {
      const lowerCaseTerm = term.toLowerCase();
      if (!term) return apps;
      
      return apps.filter(a => 
          a.title.toLowerCase().includes(lowerCaseTerm) || 
          a.applicant.toLowerCase().includes(lowerCaseTerm)
      );
  };

  const allManagerApplications = applications.filter(a => a.organizer === currentUser.email);
  const pendingApplications = _filterApplications(allManagerApplications.filter(a => a.status === "pending"), appSearchTerm);
  const acceptedApplications = _filterApplications(allManagerApplications.filter(a => a.status === "accepted"), appSearchTerm);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>

        <div className="relative flex gap-2">
          <button 
            onClick={() => { _resetForm(); setShowModal(true); }}
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
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              className="p-2 border w-full mb-4 rounded"
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
            
            <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Select Tags (Max 3)</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
                    {ALL_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 text-xs rounded-full border transition duration-150 ease-in-out ${
                                form.selectedTags.includes(tag) 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                            disabled={form.selectedTags.length >= 3 && !form.selectedTags.includes(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={handleCreateOrUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {form.id ? "Update" : "Create"}
              </button>

              <button 
                onClick={() => { _resetForm(); setShowModal(false); }}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        
      <div className="flex flex-wrap gap-4 items-center mb-6 p-3 bg-gray-100 rounded">
        <input 
          type="text"
          placeholder="Search events by title/description..."
          className="p-2 border rounded flex-grow min-w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded"
        >
            <option value="all">Volunteer Need: All</option>
            <option value="high-need">High Need (&gt; 5)</option>
            <option value="low-need">Low Need (&le; 5)</option>
        </select>

        <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="p-2 border rounded"
        >
            <option value="all">Filter by Tag: All</option>
            {ALL_TAGS.map(tag => (
                <option key={`filter-${tag}`} value={tag}>{tag}</option>
            ))}
        </select>
      </div>

      <h2 className="font-semibold mb-2">Your Created Events ({filteredEvents.length})</h2>
      <div className="flex flex-col gap-3 mb-6">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 italic py-4 text-center">No events found matching current filters.</p>
        ) : (
          filteredEvents.map(e => (
            <div key={e.id} className="border p-3 rounded bg-gray-50">
              <p className="font-bold">{e.title}</p>
              
              <div className="flex flex-wrap gap-1 mt-1">
                  {e.tags && e.tags.map(tag => (
                      <span key={`${e.id}-${tag}`} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {tag}
                      </span>
                  ))}
              </div>
              
              <p className="text-sm mt-1">
                Start: {e.startDate} • End: {e.endDate} • Volunteers: {e.volunteers}
              </p>
              <p className="mt-1">{e.description}</p>

              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => _initEditForm(e)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>

                <button 
                  onClick={() => { if (window.confirm(`Are you sure you want to delete event: ${e.title}?`)) onDeleteEvent(e.id); }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>

                {e.recruiting && (
                  <button
                    onClick={() => onEndRecruiting(e.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    End Recruiting
                  </button>
                )}
                {!e.recruiting && (
                  <span className="px-3 py-1 rounded bg-gray-300 text-gray-700 text-sm">Recruiting Ended</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW UI: Application Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search applications by event title or applicant email..."
          value={appSearchTerm}
          onChange={e => setAppSearchTerm(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <h2 className="font-semibold mb-2">Pending Applications ({pendingApplications.length})</h2>
      <div className="flex flex-col gap-3 mb-6">
        {pendingApplications.length === 0 && (
          <p className="text-gray-500">No pending applications matching search criteria.</p>
        )}
        {pendingApplications.map((a, idx) => (
          <div key={idx} className="border p-3 rounded bg-white">
            <p className="font-bold">{a.title}</p>
            <p>Applicant: {a.applicant} ({a.volunteerType})</p>
            <p>Status: {a.status}</p>

            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "accepted")}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Accept
              </button>

              <button 
                onClick={() => onUpdateStatus(a.eventId, a.applicant, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-2">Accepted Applications ({acceptedApplications.length})</h2>
      <div className="flex flex-col gap-3">
        {acceptedApplications.length === 0 && (
          <p className="text-gray-500">No accepted volunteers matching search criteria.</p>
        )}
        {acceptedApplications.map((a, idx) => (
          <div key={idx} className="border p-3 rounded bg-green-50">
            <p className="font-bold">{a.title}</p>
            <p>Volunteer: {a.applicant} ({a.volunteerType})</p>
            <p className="text-green-700 font-semibold">Accepted</p>
          </div>
        ))}
      </div>

    </div>
  );
}