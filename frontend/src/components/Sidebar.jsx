import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const baseClass = "block p-3 rounded-md transition hover:bg-emerald-800 flex items-center gap-3";
  const activeClass = "bg-emerald-700 font-semibold shadow-inner";

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 1. MOBILE TOP BAR: Only visible on small/medium screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-emerald-900 text-white p-4 flex justify-between items-center z-[60] shadow-lg">
        <h1 className="font-bold text-lg">BBIC Management</h1>
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-2xl focus:outline-none bg-emerald-800 rounded-md active:scale-95 transition-transform"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 2. OVERLAY: Black background when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[51] lg:hidden backdrop-blur-sm" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* 3. SIDEBAR: Fixed on mobile, Normal on Laptop */}
      <div
        className={`
          bg-emerald-900 text-white
          fixed lg:sticky top-0 left-0 h-screen z-[55]
          transition-transform duration-300 ease-in-out
          w-64 flex-shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          border-r border-emerald-800
        `}
      >
        <div className="p-6 pt-20 lg:pt-6"> {/* Added padding top for mobile to avoid overlap */}
          <h1 className="text-xl font-bold mb-8 border-b border-emerald-700 pb-4 hidden lg:block text-emerald-50">
            BBIC Management
          </h1>

          <nav className="space-y-2">
            {[
              { path: "/", label: "Dashboard" },
              { path: "/students", label: "Student Roll" },
              { path: "/ustaads", label: "Ustaads" },
              { path: "/adult-classes", label: "Adult Classes" },
              { path: "/menlist", label: "Men's List" }
            ].map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)} // Close menu after clicking
                className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;



