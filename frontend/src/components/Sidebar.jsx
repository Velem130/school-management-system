import { NavLink } from "react-router-dom";

function Sidebar() {
  const baseClass =
    "block px-3 py-2 rounded-md transition hover:bg-emerald-800";
  const activeClass = "bg-emerald-700 font-semibold";

  return (
    <div className="hidden md:block w-64 h-screen bg-emerald-900 text-white fixed p-6">
      <h1 className="text-xl font-bold mb-8 border-b border-emerald-700 pb-4">
        BBIC Management
      </h1>

      <nav className="space-y-3">
        {[
          { to: "/", label: "Dashboard" },
          { to: "/students", label: "Student Roll" },
          { to: "/ustaads", label: "Ustaads" },
          { to: "/adult-classes", label: "Adult Classes" },
          { to: "/menlist", label: "Men's List" },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;



