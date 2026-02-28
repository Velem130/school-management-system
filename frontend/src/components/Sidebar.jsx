import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Added the PDF link to this array
  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/students", label: "Student Roll" },
    { path: "/ustaads", label: "Ustaads" },
    { path: "/adult-classes", label: "Ladies Classes" },
    { path: "/menlist", label: "Community's List" },
    { path: "/students-pdf", label: "Download PDF" } // <--- Added this line
  ];

  return (
    <>
      {/* MOBILE TOP BAR with hamburger - UNCHANGED */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-emerald-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h1 className="font-bold text-xl">BBIC Management</h1>
        <button 
          onClick={toggleSidebar}
          className="p-3 text-2xl focus:outline-none bg-emerald-800 rounded-lg active:scale-95 transition"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE OVERLAY - UNCHANGED */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR CONTAINER - Adjusted for Side Layout on Desktop */}
      <div className={`
        bg-emerald-900 text-white
        ${isOpen 
          ? "fixed inset-y-0 left-0 w-72 z-50 translate-x-0" 
          : "fixed inset-y-0 -left-72 w-72 z-50 -translate-x-full lg:translate-x-0"}
        transition-transform duration-300 ease-in-out lg:transition-none
        lg:static lg:inset-auto lg:w-64 lg:min-h-screen lg:flex lg:flex-col lg:justify-start lg:shadow-md
      `}>
        {/* Mobile & Desktop sidebar header */}
        <div className="p-6 flex justify-between items-center border-b border-emerald-800">
          <h1 className="text-2xl font-bold text-emerald-50">BBIC Management</h1>
          <button onClick={closeSidebar} className="text-3xl text-white lg:hidden">
            <FaTimes />
          </button>
        </div>

        {/* Links - vertical for BOTH mobile and desktop side-bar */}
        <nav className={`
          flex flex-col lg:gap-2 lg:px-4 lg:py-6
          p-6 space-y-4 lg:space-y-0
        `}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                px-5 py-3 rounded-lg text-base font-medium transition
                ${isActive 
                  ? "bg-emerald-700 text-white" 
                  : "hover:bg-emerald-800 hover:text-white"}
                lg:px-6 lg:py-3 lg:rounded-md lg:text-base
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer for mobile top bar - UNCHANGED */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

export default Sidebar;