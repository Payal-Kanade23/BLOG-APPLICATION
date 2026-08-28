import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="min-h-screen p-12 bg-[#FAF8F4]">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;