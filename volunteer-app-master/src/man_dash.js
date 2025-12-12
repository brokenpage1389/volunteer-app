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
  
  // Search term for applications
  const [appSearchTerm, setAppSearchTerm] = useState("");
  
  // Get Manager Name for the welcome message
  const managerName = currentUser.name || currentUser.email.split('@')[0];

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

  // Filters applications by event title and applicant email
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
    // Main container: Subtle cream background.
    <div className="min-h-screen bg-gray-100 text-gray-800">
      
      {/* STICKY HEADER (Marine Blue, Full Width) */}
      <div className="sticky top-0 z-20 w-full bg-blue-800 border-b border-blue-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            {/* Company Name + Manager Tag (Lively Blue) */}
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white tracking-wider">VOLUNTEER</h1>
              {/* Previous change retained: smaller Manager tag */}
              <span className="text-xs text-cyan-400 px-2 py-0.5 rounded-full shadow-lg border-2 border-cyan-300 font-semibold">
                Manager
              </span>
            </div>


            <div className="relative flex gap-3 items-center">
              {/* Primary Button: Create Event */}
              <button 
                onClick={() => { _resetForm(); setShowModal(true); }}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-600 transition transform hover:scale-[1.02] font-semibold"
              >
                Create Event
              </button>

              {/* Secondary Button: Settings */}
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)} 
                className="bg-blue-700 text-white px-3 py-2 rounded-lg border border-blue-600 shadow-md hover:bg-blue-600 transition"
              >
                Settings
              </button>

              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold ring-2 ring-blue-900">
                  {pendingCount}
                </div>
              )}

              {settingsOpen && (
                // Dropdown Menu
                <div className="absolute right-0 mt-12 bg-white border border-gray-200 rounded-lg shadow-xl w-32 z-30 text-gray-800">
                  <button 
                    onClick={() => { onNavigate("profile"); setSettingsOpen(false); }} 
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-t-lg"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={onLogout} 
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
          {/* Modal Container: Restored max-h-[90vh] and overflow-y-auto, reduced max-w to lg */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header Area */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex flex-col w-full">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800 text-center">
                    {form.id ? "EDIT EVENT" : "CREATE EVENT"}
                  </h2>
                  <div className="flex justify-center mt-2">
                    <div className="h-0.5 w-16 bg-orange-600 rounded-full"></div>
                  </div>
              </div>
              <button 
                onClick={() => { _resetForm(); setShowModal(false); }}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                {/* Close X icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body (Form Fields) - Reduced padding */}
            <div className="p-4">
                
                {/* Input Fields - Reduced padding (p-2) and margin (mb-3) */}
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Event Title</label>
                    <input 
                    className="p-2 border border-gray-300 w-full rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-150 text-sm"
                    placeholder="E.g., Park Cleanup Drive"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div className="mb-3 flex gap-3">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input 
                        type="date"
                        className="p-2 border border-gray-300 w-full rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-150 text-sm"
                        value={form.start}
                        onChange={(e) => setForm({ ...form, start: e.target.value })}
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input 
                        type="date"
                        className="p-2 border border-gray-300 w-full rounded-lg bg-white text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-150 text-sm"
                        value={form.end}
                        onChange={(e) => setForm({ ...form, end: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Volunteers Needed</label>
                    <input 
                    type="number"
                    className="p-2 border border-gray-300 w-full rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-150 text-sm"
                    placeholder="Number of volunteers"
                    value={form.vol}
                    onChange={(e) => setForm({ ...form, vol: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <textarea 
                    className="p-2 border border-gray-300 w-full rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-150 text-sm"
                    placeholder="Detailed description of the event and tasks."
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    rows="2" // Reduced rows for compactness
                    />
                </div>
                
                <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-sm text-gray-600">Select Tags (Max 3)</h3>
                    {/* Reduced padding in tag container */}
                    <div className="flex flex-wrap gap-2 border border-gray-200 p-2 rounded-lg bg-gray-50">
                        {ALL_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-2 py-0.5 text-xs rounded-full border transition duration-150 ease-in-out shadow-sm ${
                                    form.selectedTags.includes(tag) 
                                        ? 'bg-red-500 text-white border-orange-200'
                                        : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                                }`}
                                disabled={form.selectedTags.length >= 3 && !form.selectedTags.includes(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer and Buttons - Reduced padding */}
                <div className="flex gap-3 justify-center pt-3 border-t border-gray-100">
                
                  {/* Primary Button: Orange/Brown theme */}
                  <button 
                    onClick={handleCreateOrUpdate}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-orange-700 transition font-bold uppercase tracking-wide text-sm"
                  >
                    {form.id ? "Update Event" : "Add Event"}
                  </button>

                  {/* Secondary Button: Gray theme */}
                  <button 
                    onClick={() => { _resetForm(); setShowModal(false); }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-400 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper - Limited Width and Left Aligned */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Welcome Message */}
        <h2 className="text-4xl font-bold mb-1 text-blue-900">
            Welcome, <span className="text-cyan-600">{managerName}</span>!
        </h2>
        <h2 className="text-1xl px-1 mb-6 text-gray-600">Manage events and applications efficiently!</h2>
        
        {/* STICKY SEARCH/FILTER BAR - Adjusted top position and context */}
        <div className="sticky top-[95px] z-10 flex flex-wrap gap-4 items-center p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-lg">
          <input 
            type="text"
            placeholder="Search events by title/description..."
            className="p-3 border border-gray-300 rounded-lg flex-grow min-w-[200px] bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
              <option value="all">Volunteer Need: All</option>
              <option value="high-need">High Need (&gt; 5)</option>
              <option value="low-need">Low Need (&le; 5)</option>
          </select>

          <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
              <option value="all">Filter by Tag: All</option>
              {ALL_TAGS.map(tag => (
                  <option key={`filter-${tag}`} value={tag}>{tag}</option>
              ))}
          </select>
        </div>
        
        {/* EVENT LISTS */}

        <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2 border-gray-200">Your Created Events ({filteredEvents.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 italic py-6 text-center border border-gray-200 rounded-lg bg-white col-span-full">
              No events found matching current filters.
            </p>
          ) : (
            filteredEvents.map(e => (
              // Event Card: White background, subtle shadow
              <div 
                  key={e.id} 
                  className="border border-gray-200 p-4 rounded-xl bg-white shadow-lg hover:shadow-blue-200 transition duration-300"
              >
                <p className="text-lg font-bold text-gray-900 mb-2">{e.title}</p>
                
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                    {e.tags && e.tags.map(tag => (
                        <span key={`${e.id}-${tag}`} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-inner">
                            {tag}
                        </span>
                    ))}
                </div>
                
                <p className="text-sm text-gray-500">
                  Start: {e.startDate} • End: {e.endDate} • Volunteers Needed: <span className="font-semibold text-blue-600">{e.volunteers}</span>
                </p>
                <p className="mt-2 text-gray-700 line-clamp-3">{e.description}</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  {/* Button: Edit (Yellow) */}
                  <button 
                    onClick={() => _initEditForm(e)}
                    className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-yellow-600 transition text-sm"
                  >
                    Edit
                  </button>

                  {/* Button: Delete (Red) */}
                  <button 
                    onClick={() => { if (window.confirm(`Are you sure you want to delete event: ${e.title}?`)) onDeleteEvent(e.id); }}
                    className="flex-1 bg-red-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>

                  {e.recruiting && (
                    <button
                      onClick={() => onEndRecruiting(e.id)}
                      className="flex-2 bg-gray-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-gray-600 transition text-sm"
                    >
                      End Recruiting
                    </button>
                  )}
                  {!e.recruiting && (
                    <span className="px-3 py-1 rounded-lg bg-gray-300 text-gray-700 text-sm font-medium">Recruiting Ended</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Application Search Input */}
        <div className="mb-6 border-t pt-4 border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Application Management</h3>
          <input
            type="text"
            placeholder="Search applications by event title or applicant email..."
            value={appSearchTerm}
            onChange={e => setAppSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
          />
        </div>
        
        {/* APPLICATIONS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2 border-gray-200">Pending Applications ({pendingApplications.length})</h2>
                <div className="flex flex-col gap-4">
                  {pendingApplications.length === 0 && (
                    <p className="text-gray-500 italic py-6 text-center border border-gray-200 rounded-lg bg-white">
                      No pending applications matching search criteria.
                    </p>
                  )}
                  {pendingApplications.map((a, idx) => (
                    // Pending App Card: Yellow/Amber accent on a light background
                    <div 
                        key={idx} 
                        className="border border-yellow-400 p-4 rounded-xl bg-yellow-50 text-gray-800 shadow-md"
                    >
                      <p className="font-bold text-gray-900 text-lg">{a.title}</p>
                      <p className="text-sm">Applicant: <span className="font-medium text-yellow-800">{a.applicant}</span> ({a.volunteerType})</p>
                      <p className="text-sm">Status: <span className="font-semibold text-yellow-800">{a.status}</span></p>

                      <div className="mt-3 flex gap-3">
                        {/* Button: Accept (Green) */}
                        <button 
                          onClick={() => onUpdateStatus(a.eventId, a.applicant, "accepted")}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg shadow-md hover:bg-green-700 transition text-sm"
                        >
                          Accept
                        </button>

                        {/* Button: Reject (Red) */}
                        <button 
                          onClick={() => onUpdateStatus(a.eventId, a.applicant, "rejected")}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg shadow-md hover:bg-red-700 transition text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2 border-gray-200">Accepted Volunteers ({acceptedApplications.length})</h2>
                <div className="flex flex-col gap-4">
                  {acceptedApplications.length === 0 && (
                    <p className="text-gray-500 italic py-6 text-center border border-gray-200 rounded-lg bg-white">
                      No accepted volunteers matching search criteria.
                    </p>
                  )}
                  {acceptedApplications.map((a, idx) => (
                    // Accepted App Card: Green accent on a light background
                    <div 
                        key={idx} 
                        className="border border-green-400 p-4 rounded-xl bg-green-50 text-gray-800 shadow-md"
                    >
                      <p className="font-bold text-lg text-gray-900">{a.title}</p>
                      <p className="text-sm">Volunteer: <span className="font-medium text-green-800">{a.applicant}</span> ({a.volunteerType})</p>
                      <p className="text-sm text-green-700 font-semibold">Accepted</p>
                    </div>
                  ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}