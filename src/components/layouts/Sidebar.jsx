import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
    const role = useSelector((state) => state.auth.user?.role);
    
    const links = [
        { to: "/dashboard", label: "Dashboard", roles: ["ADMIN", "RECRUITER"] },
        { to: "/jobs", label: "Jobs", roles: ["ADMIN", "RECRUITER"] },
        { to: "/interviews", label: "Interviews", roles: ["INTERVIEWER"] },
        { to: "/analytics", label: "analytics", roles: ["INTERVIEWER", "ADMIN"] },
    ]

    return (
        <aside className="w-56 bg-white border-r p-4">
            <nav className="flex flex-col gap-2">
                {links
                .filter((link) => link.roles.includes(role))
                .map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => 
                            `px-3 py-2 rounded text-sm ${
                                isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar;