import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Funds from "@/pages/Funds";
import FundDetail from "@/pages/FundDetail";
import AdminFunds from "@/pages/AdminFunds";
import Login from "@/pages/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="funds" element={<Funds />} />
            <Route path="funds/:id" element={<FundDetail />} />
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="admin/funds" element={<AdminFunds />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
