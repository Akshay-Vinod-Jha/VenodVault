import React from "react";
import { Link, Outlet, useParams } from "react-router-dom";

const EntryPoint = () => {
  const { farmerId } = useParams();

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 p-4 space-y-6">
        <h2 className="text-xl font-bold">Farmer Panel</h2>
        <nav className="flex flex-col gap-3">
          <Link
            to={`/dashboard/farmer/${farmerId}`}
            className="hover:underline"
          >
            Dashboard
          </Link>
          <Link
            to={`/dashboard/farmer/${farmerId}/control`}
            className="hover:underline"
          >
            Control Panel
          </Link>
          <Link
            to={`/dashboard/farmer/${farmerId}/requests`}
            className="hover:underline"
          >
            Manage Requests
          </Link>
          <Link to={`/request/farmer/${farmerId}`} className="hover:underline">
            Make Requests
          </Link>
        </nav>
      </div>

      {/* Dynamic Content */}
      <div className="w-4/5 p-6 bg-gray-900">
        <Outlet />
      </div>
    </div>
  );
};

export default EntryPoint;
