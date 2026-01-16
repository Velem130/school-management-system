import { NavLink } from "react-router-dom";

function Sidebar() {
  const baseClass =
    "block p-2 md:p-3 rounded-md transition hover:bg-emerald-800 text-sm md:text-base";
  const activeClass =
    "bg-emerald-700 font-semibold";

  return (
    <div className="w-full md:w-64 h-auto md:h-screen bg-emerald-900 text-white p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-bold mb-4 md:mb-8 border-b border-emerald-700 pb-3 md:pb-4">
        BBIC Management
      </h1>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-3 md:space-y-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseClass} whitespace-nowrap ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            `${baseClass} whitespace-nowrap ${isActive ? activeClass : ""}`
          }
        >
          Student Roll
        </NavLink>

        <NavLink
          to="/ustaads"
          className={({ isActive }) =>
            `${baseClass} whitespace-nowrap ${isActive ? activeClass : ""}`
          }
        >
          Ustaads
        </NavLink>

        <NavLink
          to="/adult-classes"
          className={({ isActive }) =>
            `${baseClass} whitespace-nowrap ${isActive ? activeClass : ""}`
          }
        >
          Adult Classes
        </NavLink>

        <NavLink
          to="/menlist"
          className={({ isActive }) =>
            `${baseClass} whitespace-nowrap ${isActive ? activeClass : ""}`
          }
        >
          Men's List
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;


