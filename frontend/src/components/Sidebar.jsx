import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const baseClass =
    "block px-4 py-2 rounded-md transition hover:bg-emerald-800";
  const activeClass = "bg-emerald-700 font-semibold";

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Navbar */}
      <header className="bg-emerald-900 text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <h1 className="font-bold text-lg">BBIC Management</h1>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-2">
            <NavLink to="/" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/students" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Student Roll
            </NavLink>
            <NavLink to="/ustaads" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Ustaads
            </NavLink>
            <NavLink to="/adult-classes" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Adult Classes
            </NavLink>
            <NavLink to="/menlist" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Men's List
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={toggleSidebar} className="md:hidden text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col space-y-1 px-4 pb-4">
            <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/students" onClick={() => setIsOpen(false)} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Student Roll
            </NavLink>
            <NavLink to="/ustaads" onClick={() => setIsOpen(false)} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Ustaads
            </NavLink>
            <NavLink to="/adult-classes" onClick={() => setIsOpen(false)} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Adult Classes
            </NavLink>
            <NavLink to="/menlist" onClick={() => setIsOpen(false)} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}>
              Men's List
            </NavLink>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Sidebar;
