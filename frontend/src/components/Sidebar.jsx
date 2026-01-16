import { NavLink } from "react-router-dom";

function Sidebar() {
  const baseClass =
    "block p-2 rounded-md transition hover:bg-emerald-800";
  const activeClass =
    "bg-emerald-700 font-semibold";

  return (
    <div
      className="
        bg-emerald-900 text-white
        w-full md:w-64
        h-auto md:h-screen
        md:fixed
        p-4 md:p-6
      "
    >
      <h1 className="text-xl font-bold mb-6 md:mb-8 border-b border-emerald-700 pb-4">
        BBIC Management
      </h1>

      <nav className="space-y-2 md:space-y-4">
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




