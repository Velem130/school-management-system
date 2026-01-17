import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/students", label: "Student Roll" },
    { path: "/ustaads", label: "Ustaads" },
    { path: "/adult-classes", label: "Adult Classes" },
    { path: "/menlist", label: "Men's List" }
  ];

  return (
    <>
      {/* MOBILE TOP BAR with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-emerald-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h1 className="font-bold text-xl">BBIC Management</h1>
        <button 
          onClick={toggleSidebar}
          className="p-3 text-2xl focus:outline-none bg-emerald-800 rounded-lg active:scale-95 transition"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR (mobile) / TOP NAV (desktop) */}
      <div className={`
        bg-emerald-900 text-white
        ${isOpen 
          ? "fixed inset-y-0 left-0 w-72 z-50 translate-x-0 lg:translate-x-0" 
          : "fixed inset-y-0 -left-72 w-72 z-50 -translate-x-full lg:translate-x-0"}
        transition-transform duration-300 ease-in-out lg:transition-none
        lg:static lg:inset-auto lg:w-full lg:h-16 lg:flex lg:items-center lg:justify-start lg:shadow-md
      `}>
        {/* Mobile sidebar header */}
        <div className="lg:hidden p-6 flex justify-between items-center border-b border-emerald-800">
          <h1 className="text-2xl font-bold text-emerald-50">BBIC Management</h1>
          <button onClick={closeSidebar} className="text-3xl text-white">
            <FaTimes />
          </button>
        </div>

        {/* Links - vertical mobile, horizontal desktop */}
        <nav className={`
          flex flex-col lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:py-0
          p-6 lg:p-0 space-y-4 lg:space-y-0 lg:space-x-2
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
                lg:px-6 lg:py-2.5 lg:rounded-md lg:text-base lg:hover:bg-emerald-800/80
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer for mobile top bar */}
      <div className="h-16 lg:h-0" />
    </>
  );
}

export default Sidebar;