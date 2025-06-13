import { useNavigate } from "react-router-dom";
const EntrySignUp = () => {
  const navigate = useNavigate();
  const handleNavigate = (role) => {
    // This would normally use navigate(`/signup/${role}`)
    console.log(`Navigating to /signup/${role}`);
    navigate(`/signup/${role}`);
  };

  const roles = [
    {
      id: "farmer",
      title: "Farmer",
      description: "Manage crops, track harvests, and connect with buyers",
      icon: "🌱",
      features: [
        "Crop Management",
        "Order Tracking",
        "Market Access",
        "Harvest Planning",
      ],
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      hoverColor: "hover:bg-green-100",
    },
    {
      id: "retailer",
      title: "Retailer",
      description: "Source products, manage inventory, and serve customers",
      icon: "🏪",
      features: [
        "Product Sourcing",
        "Inventory Management",
        "Customer Orders",
        "Supplier Network",
      ],
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      hoverColor: "hover:bg-blue-100",
    },
    {
      id: "logistic",
      title: "Logistics Provider",
      description: "Provide transportation and delivery services",
      icon: "🚛",
      features: [
        "Route Optimization",
        "Fleet Management",
        "Delivery Tracking",
        "Service Requests",
      ],
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      hoverColor: "hover:bg-yellow-100",
    },
    {
      id: "warehouse",
      title: "Warehouse",
      description: "Offer storage and distribution solutions",
      icon: "🏬",
      features: [
        "Storage Management",
        "Inventory Control",
        "Distribution",
        "Space Optimization",
      ],
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      hoverColor: "hover:bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">🌱</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Vendor's Vault</h1>
        </div>
        <button className="text-green-600 hover:text-green-700 font-medium">
          Back to Login
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Role
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the role that best describes your business to get started
            with a customized experience
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleNavigate(role.id)}
              className={`${role.bgColor} ${role.borderColor} ${role.hoverColor} border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
            >
              {/* Icon */}
              <div className="text-6xl mb-6 text-center">{role.icon}</div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
                {role.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mb-6">
                {role.description}
              </p>

              {/* Key Features */}
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Key Features:
                </h4>
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntrySignUp;
