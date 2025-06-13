import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  FileText,
  Send,
  Tractor,
  User,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const EntryPoint = () => {
  const { farmerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Function to check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      to: `/dashboard/farmer/${farmerId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: `/dashboard/farmer/${farmerId}/control`,
      label: "Control Panel",
      icon: Settings,
    },
    {
      to: `/dashboard/farmer/${farmerId}/requests`,
      label: "Manage Requests",
      icon: FileText,
    },
    {
      to: `/dashboard/farmer/${farmerId}/make-request`,
      label: "Make Requests",
      icon: Send,
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-teal-100">
      <button
        onClick={() => navigate("/signup")}
        className="absolute top-4 z-50 cursor-pointer right-4 flex items-center text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-md transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">Back</span>
      </button>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <div className="w-1/5 min-w-64 bg-white/80 backdrop-blur-sm border-r border-emerald-100 shadow-2xl relative z-10">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-emerald-100">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Tractor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Farmer Panel</h2>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Farmer</p>
                <p className="text-xs text-gray-600">ID: {farmerId}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-emerald-600"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => navigate("/")}
            className="w-full text-center cursor-pointer right-4 flex justify-center items-center bg-emerald-500 text-white hover:text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-md transition-colors"
          >
            <span className="hidden sm:inline">Sign Out</span>
          </button>
          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-emerald-100">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-gray-800">
                  System Status
                </p>
              </div>
              <p className="text-xs text-gray-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 relative z-10">
        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EntryPoint;
