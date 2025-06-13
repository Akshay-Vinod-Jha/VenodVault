import { useNavigate } from "react-router-dom";
const VendorsVaultLanding = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    console.log("Get Started clicked");
    // Add your navigation logic here
    navigate("/login");
  };

  const handleJoinPlatform = () => {
    console.log("Join Our Platform clicked");
    // Add your navigation logic here
    navigate("/login");
  };

  const handleSignUp = () => {
    console.log("Sign Up / Login clicked");
    // Add your navigation logic here
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-200 opacity-10 blur-3xl rounded-full"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-2xl border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Vendor's Vault
              </span>
            </div>
            <button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform"
            >
              Sign Up / Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Revolutionizing Supply Chain Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect farmers, retailers, logistics providers, and warehouses in
            one comprehensive platform. Streamline your supply chain operations
            and boost efficiency across the entire network.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Our platform connects all key players in the supply chain
              ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Farmers */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Farmers
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Manage crops, track orders, connect with retailers and logistics
                providers to expand your market reach.
              </p>
            </div>

            {/* Retailers */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Retailers
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Source fresh produce directly from farmers, manage inventory,
                and coordinate with logistics partners.
              </p>
            </div>

            {/* Logistics */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Logistics
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Optimize delivery routes, manage transportation requests, and
                provide reliable shipping services.
              </p>
            </div>

            {/* Warehouse */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Warehouse
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Provide storage solutions, manage inventory, and facilitate
                smooth distribution operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gradient-to-r from-teal-50 to-green-50 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Vendor's Vault?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Real-time Coordination */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Real-time Coordination
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instant updates and notifications keep all parties informed and
                synchronized.
              </p>
            </div>

            {/* Data-Driven Insights */}
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Data-Driven Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced analytics and reporting to optimize your supply chain
                operations.
              </p>
            </div>

            {/* Seamless Collaboration */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Seamless Collaboration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Connect and collaborate with partners across the entire supply
                chain network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <footer className="bg-gray-800 py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">
              Vendor's Vault
            </span>
          </div>
          <p className="text-gray-400 mb-8 text-lg">
            Transforming supply chain management through technology
          </p>
          <button
            onClick={handleJoinPlatform}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform shadow-lg"
          >
            Join Our Platform
          </button>
        </div>
      </footer>
    </div>
  );
};

export default VendorsVaultLanding;
