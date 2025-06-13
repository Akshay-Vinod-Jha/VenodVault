import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommonLogin from "./pages/CommonLogin";
import EntrySignUp from "./signup/EntrySignUp";
import FarmerSignupForm from "./signup/RoleSpecific/FarmerSignUp";
import RetailerSignupForm from "./signup/RoleSpecific/RSignUp";
import LogisticsSignupForm from "./signup/RoleSpecific/LSignUp";
import WarehouseSignupForm from "./signup/RoleSpecific/WSignUp";
import EntryPoint from "./dashboard/farmerdashboard/EntryPoint";
import Dashboard from "./dashboard/farmerdashboard/Dashboard";
import ControlPanel from "./dashboard/farmerdashboard/ControlPanel";
import ManageRequest from "./dashboard/farmerdashboard/ManageRequest";
import REntryPoint from "./dashboard/retailerdashboard/EntryPoint";
import RControlPanel from "./dashboard/retailerdashboard/ControlPanel";
import RDashboard from "./dashboard/retailerdashboard/Dashboard";
import RManageRequest from "./dashboard/retailerdashboard/ManageRequest";
import LEntryPoint from "./dashboard/logisticdashboard/EntryPoint";
import LDashboard from "./dashboard/logisticdashboard/Dashboard";
import LControlPanel from "./dashboard/logisticdashboard/ControlPanel";
import LManageRequest from "./dashboard/logisticdashboard/ManageRequest";
import WEntryPoint from "./dashboard/warehousedashboard/EntryPoint";
import WDashboard from "./dashboard/warehousedashboard/Dashboard";
import WControlPanel from "./dashboard/warehousedashboard/ControlPanel";
import WManageRequest from "./dashboard/warehousedashboard/ManageRequest";
import CommonRequestPage from "./pages/CommonRequestPage";
import VendorsVaultLanding from "./pages/Index";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VendorsVaultLanding />} />
        <Route path="/login" element={<CommonLogin />} />
        <Route path="/signup" element={<EntrySignUp />} />
        <Route path="/signup/farmer" element={<FarmerSignupForm />} />
        <Route path="/signup/warehouse" element={<WarehouseSignupForm />} />
        <Route path="/signup/logistic" element={<LogisticsSignupForm />} />
        <Route path="/signup/retailer" element={<RetailerSignupForm />} />
        <Route path="/dashboard/farmer/:farmerId/*" element={<EntryPoint />}>
          <Route index element={<Dashboard />} />
          <Route path="control" element={<ControlPanel />} />
          <Route path="requests" element={<ManageRequest />} />
          <Route path="make-request" element={<CommonRequestPage />} />
        </Route>
        <Route
          path="/dashboard/retailer/:retailerId/*"
          element={<REntryPoint />}
        >
          <Route index element={<RDashboard />} />
          <Route path="control" element={<RControlPanel />} />
          <Route path="requests" element={<RManageRequest />} />
          <Route path="make-request" element={<CommonRequestPage />} />
        </Route>
        <Route
          path="/dashboard/logistic/:logisticId/*"
          element={<LEntryPoint />}
        >
          <Route index element={<LDashboard />} />
          <Route path="control" element={<LControlPanel />} />
          <Route path="requests" element={<LManageRequest />} />
          <Route path="make-request" element={<CommonRequestPage />} />
        </Route>
        <Route
          path="/dashboard/warehouse/:warehouseId/*"
          element={<WEntryPoint />}
        >
          <Route index element={<WDashboard />} />
          <Route path="control" element={<WControlPanel />} />
          <Route path="requests" element={<WManageRequest />} />
          <Route path="make-request" element={<CommonRequestPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
