import { useNavigate } from "react-router-dom";

function StatCard({ title, value, color, link }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(link)}
      className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color} cursor-pointer hover:shadow-md transition`}
    >
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default StatCard;