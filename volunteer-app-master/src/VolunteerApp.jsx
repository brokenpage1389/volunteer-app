import React, { useEffect, useState } from "react";
import Login from "./login";
import SignupPage from "./signup";
import VolunteerDashboard from "./vol_dash";
import ManagerDashboard from "./man_dash";
import Profile from "./profile";

export default function VolunteerApp() {
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("events")) || []);
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem("applications")) || []);

  useEffect(() => localStorage.setItem("events", JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem("applications", JSON.stringify(applications)), [applications]);

  useEffect(() => {
    // --- 1. Initialize Default Manager (with all required profile fields) ---
    const managers = JSON.parse(localStorage.getItem("managers")) || [];
    if (!managers.some((m) => m.email === "manager@example.com")) {
      managers.push({
        name: "Default Manager",
        firstName: "Default",
        lastName: "Manager",
        email: "manager@example.com",
        password: "123456",
        phone: "",
        address: "123 Management Way",
        tags: "Event Planning, Leadership",
        role: "manager"
      });
      localStorage.setItem("managers", JSON.stringify(managers));
    }

    // Initialize sample events if none exist
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
    if (storedEvents.length === 0) {
      const sample = [
        { id: Date.now() + 1, title: "Beach Cleanup", startDate: "2025-02-20", endDate: "2025-02-21", volunteers: 20, description: "Cleaning the shoreline.", createdBy: "manager@example.com" },
        { id: Date.now() + 2, title: "Food Drive", startDate: "2025-02-25", endDate: "2025-02-26", volunteers: 15, description: "Helping collect food.", createdBy: "manager@example.com" },
      ];
      setEvents(sample);
    }
  }, []);

  const handleLogin = (identifier, password) => {
    const volunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
    const managers = JSON.parse(localStorage.getItem("managers")) || [];

    const foundVolunteer = volunteers.find(
        (v) => (v.email === identifier || v.phone === identifier || v.name === identifier) && v.password === password
    );
    if (foundVolunteer) {
      setCurrentUser({ ...foundVolunteer, role: "volunteer" });
      setScreen("volunteer");
      return;
    }

    const foundManager = managers.find(
        (m) => (m.email === identifier || m.phone === identifier || m.name === identifier) && m.password === password
    );
    if (foundManager) {
      setCurrentUser({ ...foundManager, role: "manager" });
      setScreen("manager");
      return;
    }

    alert("No user found with those credentials");
  };

  const handleSignup = (user, role) => {
    const key = role === "volunteer" ? "volunteers" : "managers";
    const users = JSON.parse(localStorage.getItem(key)) || [];

    if (users.some((u) => u.email === user.email)) return alert("Email already used");

    // --- 2. Initialize New Profile Fields on Signup ---
    const newUser = {
      ...user,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      address: "",
      tags: "",
    };

    users.push(newUser);
    localStorage.setItem(key, JSON.stringify(users));
    alert(`${role} created. Please log in.`);
    setScreen("login");
  };

  const handleCreateEvent = (newEvent) => {
    const createdBy = (currentUser && currentUser.role === "manager") ? currentUser.email : (newEvent.createdBy || "unknown");
    setEvents([...events, { ...newEvent, createdBy }]);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setApplications(applications.filter(a => a.eventId !== eventId));
  };

  const handleEndRecruiting = (eventId) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, recruiting: false } : e));
    alert("Recruiting ended for this event.");
  };

  const handleApply = (eventObj) => {
    if (!currentUser || currentUser.role !== "volunteer") return alert("Log in as a volunteer to apply");

    const exists = applications.find((a) => a.eventId === eventObj.id && a.applicant === currentUser.email);
    if (exists && exists.status === "pending") return alert("You already have a pending application");

    if (!eventObj.recruiting) return alert("Recruiting has ended for this event");

    const organizer = eventObj.createdBy || null;
    const filtered = applications.filter((a) => !(a.eventId === eventObj.id && a.applicant === currentUser.email));

    // Adding dateApplied for use in history display
    const applicationDate = new Date().toISOString();

    setApplications([...filtered, {
      eventId: eventObj.id,
      title: eventObj.title,
      status: "pending",
      volunteerType: currentUser.type,
      applicant: currentUser.email,
      organizer,
      dateApplied: applicationDate // Added for history tracking
    }]);
    alert("Applied — waiting for approval");
  };

  const handleUpdateStatus = (eventId, applicant, status) => {
    setApplications(applications.map((a) => (a.eventId === eventId && a.applicant === applicant ? { ...a, status } : a)));
  };

  const handleUpdateUser = (updatedUser) => {
    // 1. Update the current user state
    setCurrentUser(updatedUser);

    // 2. Update the user in Local Storage for persistence
    const key = updatedUser.role === "manager" ? "managers" : "volunteers";
    const users = JSON.parse(localStorage.getItem(key)) || [];

    const updatedUsers = users.map((u) =>
        u.email === updatedUser.email ? updatedUser : u
    );
    localStorage.setItem(key, JSON.stringify(updatedUsers));
  };

  const logout = () => {
    setCurrentUser(null);
    setScreen("login");
  };

  if (screen === "login") return <Login onLogin={handleLogin} onNavigate={setScreen} />;

  // --- 3. PASS APPLICATIONS PROP TO PROFILE ---
  if (screen === "profile") {
    return (
        <Profile
            currentUser={currentUser}
            onNavigate={setScreen}
            onUpdateUser={handleUpdateUser}
            applications={applications} // <--- NEW: required for Volunteer History
        />
    );
  }

  if (screen === "signup") return <SignupPage onSignup={handleSignup} onNavigate={setScreen} />;

   if (screen === "volunteer") {
      // Only show events that are recruiting or where volunteer is accepted
      const visibleEvents = events.filter(
        e => e.recruiting || applications.some(a => a.eventId === e.id && a.applicant === currentUser.email && a.status === "accepted")
      );
  
      return (
        <VolunteerDashboard
          currentUser={currentUser}
          events={visibleEvents}
          applications={applications}
          onApply={handleApply}
          onLogout={logout}
          onNavigate={setScreen}
        />
      );
    }

  if (screen === "manager") {
    return (
        <ManagerDashboard
            currentUser={currentUser}
            events={events}
            applications={applications}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateStatus={handleUpdateStatus}
            onEndRecruiting={handleEndRecruiting}
            onLogout={logout}
            onNavigate={setScreen}
        />
    );
  }

  return null;
}