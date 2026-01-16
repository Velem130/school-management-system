import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const baseClass = "block px-4 py-3 rounded-md transition hover:bg-emerald-800 flex items-center gap-3 text-white";
  const activeClass = "bg-emerald-700 font-semibold shadow-inner";

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Links array - same as before
  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/students", label: "Student Roll" },
    { path: "/ustaads", label: "Ustaads" },
    { path: "/adult-classes", label: "Adult Classes" },
    { path: "/menlist", label: "Men's List" }
  ];

  return (
    <>
      {/* MOBILE: Hamburger button + title at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-emerald-900 text-white p-4 flex justify-between items-center z-50 shadow-lg">
        <h1 className="font-bold text-lg">BBIC Management</h1>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-2xl focus:outline-none bg-emerald-800 rounded-md active:scale-95 transition"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE OVERLAY when sidebar open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR / TOP NAV */}
      <div
        className={`
          bg-emerald-900 text-white
          ${isOpen 
            ? "fixed inset-y-0 left-0 w-64 z-50 transform translate-x-0 lg:translate-x-0" 
            : "fixed inset-y-0 -left-64 w-64 z-50 transform -translate-x-full lg:translate-x-0"}
          transition-transform duration-300 ease-in-out
          lg:relative lg:top-0 lg:left-0 lg:h-auto lg:w-full lg:border-b lg:border-emerald-800
          lg:flex lg:items-center lg:justify-center lg:py-4
        `}
      >
        {/* Mobile sidebar header */}
        <div className="p-6 pt-20 lg:hidden">
          <h1 className="text-xl font-bold mb-8 border-b border-emerald-700 pb-4 text-emerald-50">
            BBIC Management
          </h1>
        </div>

        {/* Links - vertical on mobile, horizontal on desktop */}
        <nav className={`
          flex flex-col lg:flex-row lg:items-center lg:gap-6 lg:space-y-0 space-y-2
          px-6 lg:px-0
        `}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeSidebar} // Close mobile sidebar after click
              className={({ isActive }) => `
                ${baseClass} 
                ${isActive ? activeClass : ""} 
                lg:text-base lg:hover:bg-emerald-800 lg:rounded-lg lg:px-5 lg:py-2.5
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer for mobile - pushes content down when top bar is fixed */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

export default Sidebar;