import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const baseClass = "block p-2 rounded-md transition hover:bg-emerald-800";
  const activeClass = "bg-emerald-700 font-semibold";

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="md:hidden bg-emerald-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold">BBIC Management</h1>
        <button onClick={toggleSidebar} className="text-2xl focus:outline-none">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`
          bg-emerald-900 text-white
          w-64 fixed h-full z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:h-screen md:p-6 p-4
        `}
      >
        <h1 className="text-xl font-bold mb-6 md:mb-8 border-b border-emerald-700 pb-4 hidden md:block">
          BBIC Management
        </h1>

        <nav className="space-y-2 md:space-y-4">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/students"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            Student Roll
          </NavLink>

          <NavLink
            to="/ustaads"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            Ustaads
          </NavLink>

          <NavLink
            to="/adult-classes"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            Adult Classes
          </NavLink>

          <NavLink
            to="/menlist"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            Men's List
          </NavLink>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;