import React from "react";
import { Link, Outlet, useParams } from "react-router-dom";

const WEntryPoint = () => {
  const { warehouseId } = useParams();

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-800 p-4 space-y-6">
        <h2 className="text-xl font-bold">Warehouse Panel</h2>
        <nav className="flex flex-col gap-3">
          <Link
            to={`/dashboard/warehouse/${warehouseId}`}
            className="hover:underline"
          >
            Dashboard
          </Link>
          <Link
            to={`/dashboard/warehouse/${warehouseId}/control`}
            className="hover:underline"
          >
            Control Panel
          </Link>
          <Link
            to={`/dashboard/warehouse/${warehouseId}/requests`}
            className="hover:underline"
          >
            Manage Requests
          </Link>
          <Link
            to={`/request/warehouse/${warehouseId}`}
            className="hover:underline"
          >
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

export default WEntryPoint;
