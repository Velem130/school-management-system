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
      {/* MOBILE: Fixed top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-emerald-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h1 className="font-bold text-xl">BBIC Management</h1>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-3xl focus:outline-none bg-emerald-800 rounded-full active:scale-95 transition"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE OVERLAY when menu open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" 
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR (mobile) / TOP NAV (desktop) */}
      <div className={`
        bg-emerald-900 text-white
        ${isOpen 
          ? "fixed top-0 left-0 right-0 bottom-0 z-50 overflow-y-auto translate-y-0 lg:translate-y-0" 
          : "fixed top-0 left-0 right-0 -translate-y-full lg:translate-y-0"}
        lg:static lg:top-auto lg:left-auto lg:right-auto lg:bottom-auto lg:z-auto lg:bg-transparent lg:shadow-none
        transition-all duration-300 ease-in-out lg:transition-none
      `}>
        {/* Mobile close button & title */}
        <div className="lg:hidden p-6 flex justify-between items-center border-b border-emerald-800">
          <h1 className="text-2xl font-bold text-emerald-50">BBIC Management</h1>
          <button onClick={closeSidebar} className="text-3xl text-white">
            <FaTimes />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`
          flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-5
          p-6 lg:p-0 space-y-4 lg:space-y-0
        `}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                px-5 py-3 rounded-lg text-lg font-medium transition
                ${isActive 
                  ? "bg-emerald-700 text-white" 
                  : "hover:bg-emerald-800 hover:text-white"}
                lg:px-6 lg:py-2.5 lg:rounded-md lg:text-base
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer for mobile top bar */}
      <div className="h-16 lg:hidden" />
    </>
  );
}

export default Sidebar;