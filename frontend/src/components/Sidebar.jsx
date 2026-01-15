import { NavLink } from "react-router-dom";

function Sidebar() {
  const baseClass =
    "block p-2 rounded-md transition hover:bg-emerald-800";
  const activeClass =
    "bg-emerald-700 font-semibold";

  return (
    <div className="w-64 h-screen bg-emerald-900 text-white fixed p-6">
      <h1 className="text-xl font-bold mb-8 border-b border-emerald-700 pb-4">
        BBIC Management
      </h1>

      <nav className="space-y-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : ""}`
          }
        >
          Student Roll
        </NavLink>

        <NavLink
          to="/ustaads"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : ""}`
          }
        >
          Ustaads
        </NavLink>

        <NavLink
          to="/adult-classes"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : ""}`
          }
        >
          Adult Classes
        </NavLink>

        <NavLink
          to="/menlist"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : ""}`
          }
        >
          Men's List
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;


