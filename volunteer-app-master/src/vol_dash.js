import React, { useState } from "react";

const ALL_TAGS = [
  "Teaching", "Distributing", "Arrangement", "Manual Labor", 
  "Mentoring", "Administration", "Fundraising", "Transportation", 
  "Skill Sharing", "Logistics", "Cleanup", "Public Outreach"
];

export default function VolunteerDashboard({ currentUser, events, applications, onApply, onLogout, onNavigate }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  
  // NEW STATE: Search term for applications
  const [appSearchTerm, setAppSearchTerm] = useState("");

  // Filter applications of the current user
  const allMyApps = applications.filter(a => a.applicant === currentUser.email);
  
  // NEW LOGIC: Filter applications by event title
  const myApps = allMyApps.filter(a => 
      a.title.toLowerCase().includes(appSearchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === "urgent") matchesFilter = event.volunteers > 5;
    else if (filterType === "small-team") matchesFilter = event.volunteers <= 5;

    let matchesTag = true;
    if (tagFilter !== "all") {
        matchesTag = event.tags && event.tags.includes(tagFilter);
    }

    const userAccepted = applications.some(a => a.eventId === event.id && a.applicant === currentUser.email && a.status === "accepted");
    const isVisible = event.recruiting || userAccepted;

    return matchesSearch && matchesFilter && isVisible && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Volunteer Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {currentUser.name}</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)} 
              className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>Settings</span>
              <svg className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {settingsOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-xl w-48 z-20 overflow-hidden ring-1 ring-black ring-opacity-5">
                <button onClick={() => { onNavigate("profile"); setSettingsOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Profile</button>
                <div className="border-t border-slate-100"></div>
                <button onClick={onLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Available Opportunities</h2>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
                <div className="flex-grow relative">
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                    type="text"
                    placeholder="Search events by title or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                </div>
            
                <div className="flex gap-4 flex-col sm:flex-row">
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="sm:w-48 px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                        <option value="all">Needs: All</option>
                        <option value="urgent">Urgent (5+)</option>
                        <option value="small-team">Small Teams (≤5)</option>
                    </select>
                    
                    <select
                        value={tagFilter}
                        onChange={e => setTagFilter(e.target.value)}
                        className="sm:w-48 px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                        <option value="all">Tags: All</option>
                        {ALL_TAGS.map(tag => (
                            <option key={`filter-${tag}`} value={tag}>{tag}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* EVENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-lg">No events found matching your search and filters.</p>
                <button onClick={() => {setSearchTerm(""); setTagFilter("all"); setFilterType("all")}} className="mt-2 text-indigo-600 font-medium hover:underline">Clear Filters</button>
            </div>
          ) : (
            filteredEvents.map(e => {
              const userApp = applications.find(a => a.eventId === e.id && a.applicant === currentUser.email);
              const userAccepted = userApp && userApp.status === "accepted";
              const userPending = userApp && userApp.status === "pending";
              const userRejected = userApp && userApp.status === "rejected";

              const applyDisabled = !e.recruiting || userAccepted || userPending;

              let buttonText = "Apply Now";
              let buttonClass = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg";
              
              if (userAccepted) {
                  buttonText = "Accepted";
                  buttonClass = "bg-green-600 text-white cursor-default shadow-sm";
              } else if (userPending) {
                  buttonText = "Application Pending";
                  buttonClass = "bg-amber-500 text-white cursor-default shadow-sm";
              } else if (!e.recruiting) {
                  buttonText = "Recruiting Ended";
                  buttonClass = "bg-slate-300 text-slate-500 cursor-not-allowed";
              } else if (userRejected) {
                  buttonText = "Re-Apply";
                  buttonClass = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md";
              }

              return (
                <div key={e.id} className={`flex flex-col h-full bg-white border rounded-xl overflow-hidden transition-all duration-200 ${userAccepted ? "ring-2 ring-green-500 border-transparent shadow-md" : "border-slate-200 shadow-sm hover:shadow-md"}`}>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl text-slate-800 leading-tight">{e.title}</h3>
                        {e.recruiting ? (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Open
                             </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                Closed
                             </span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {e.tags && e.tags.map(tag => (
                            <span key={`${e.id}-${tag}`} className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">{e.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>{e.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span>{e.volunteers} needed</span>
                        </div>
                    </div>

                    <button
                      onClick={() => onApply(e)}
                      disabled={applyDisabled && !userRejected}
                      className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${buttonClass}`}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MY APPLICATIONS SECTION */}
        <div className="border-t border-slate-200 pt-10">
            <h2 className="text-xl font-bold text-slate-800 mb-6">My Applications <span className="text-slate-400 font-normal text-lg">({myApps.length})</span></h2>
            
            <div className="mb-6 max-w-md">
                <input
                    type="text"
                    placeholder="Search your applications..."
                    value={appSearchTerm}
                    onChange={e => setAppSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
            </div>

            <div className="grid gap-4">
                {myApps.length === 0 && <p className="text-slate-500 italic">No applications matching search criteria.</p>}
                
                {myApps.map((a, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                            <div className={`w-2 h-12 rounded-full ${
                                a.status === "accepted" ? "bg-green-500" : 
                                a.status === "rejected" ? "bg-red-500" : "bg-amber-400"
                            }`}></div>
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{a.title}</p>
                                <p className="text-slate-500 text-sm">Applied as: {currentUser.email}</p>
                            </div>
                        </div>
                        
                        <div>
                            {a.status === "accepted" && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                                    Accepted
                                </span>
                            )}
                            {a.status === "rejected" && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
                                    Rejected
                                </span>
                            )}
                            {a.status === "pending" && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                    <span className="w-2 h-2 mr-2 bg-amber-500 rounded-full"></span>
                                    Pending Review
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}