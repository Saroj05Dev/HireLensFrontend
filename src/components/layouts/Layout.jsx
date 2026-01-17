import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

const Layout = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            { /* Top Navbar */ }
            <Navbar />

            { /* Body */ }
            <div className="flex flex-1 overflow-hidden">
                { /* Sidebar */ }
                <Sidebar />

                { /* Main content */ }
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout;