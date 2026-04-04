import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import SearchBar from "./SearchBar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar />

      {/* Mobile Search Bar - Only visible on mobile, below navbar */}
      <div className="md:hidden bg-slate-700 border-b border-slate-600 px-4 py-3">
        <SearchBar />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex-1">
            {children}
          </div>
          {/* Footer - Hidden on mobile */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;