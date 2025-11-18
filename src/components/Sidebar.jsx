import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarButton from "./SidebarButton";
import "../styles/Sidebar.css";
import DashboardIcon from "../assets/icons/DashboardIcon.svg";
import ProjectsIcon from "../assets/icons/ProfileIcon.svg";
import ProfileIcon from "../assets/icons/ProfileIcon.svg";
import FindClientsIcon from "../assets/icons/GroupIcon.svg";
import FindDeverlopersIcon from "../assets/icons/GroupIcon.svg";
import MessagesIcon from "../assets/icons/MessageIcon.svg";
import PaymentIcon from "../assets/icons/PaymentIcon.svg";
import SettingsIcon from "../assets/icons/SettingsIcon.svg";
import LogoutIcon from "../assets/icons/LogoutIcon.svg";
import CloseIcon from "../assets/icons/CloseIcon.svg";
import Logo from "./Logo";

const navItems = [
    { to: "/dashboard", icon: DashboardIcon, label: "Dashboard" },
    { to: "/projects", icon: ProjectsIcon, label: "Projects", allowedRoles: ["client"] },
    { to: "/myProjectsDeveloper", icon: ProjectsIcon, label: "My Projects", allowedRoles: ["developer"] },
    { to: "/marketplace", icon: ProjectsIcon, label: "Marketplace", allowedRoles: ["developer"] },
    { to: "/findClients", icon: FindClientsIcon, label: "Find Clients", allowedRoles: ["developer"] },
    { to: "/findDevelopers", icon: FindDeverlopersIcon, label: "Find Developers", allowedRoles: ["client"] },
    { to: "/messages", icon: MessagesIcon, label: "Messages" },
    { to: "/payment", icon: PaymentIcon, label: "Payment", allowedRoles: ["client", "developer"] },
    { to: "/profile", icon: ProfileIcon, label: "Profile" },
    { to: "/logout", icon: LogoutIcon, label: "Logout" },
];

const mobileBreakpointQuery = "(max-width: 1024px)";
const DESKTOP_EXPANDED_WIDTH = 280;
const DESKTOP_COLLAPSED_WIDTH = 88;
const TOGGLE_EDGE_PADDING = 20;

const getIsMobile = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia(mobileBreakpointQuery).matches;
};

export default function Sidebar({ role = "" }) {
    const initialIsMobile = useMemo(getIsMobile, []);
    const [isMobile, setIsMobile] = useState(initialIsMobile);
    const [isExpanded, setIsExpanded] = useState(() => !initialIsMobile);
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        const mediaQuery = window.matchMedia(mobileBreakpointQuery);
        const handleChange = (event) => {
            setIsMobile(event.matches);
            setIsExpanded(event.matches ? false : true);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", handleChange);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsExpanded(false);
        }
    }, [pathname, isMobile]);

    const toggleSidebar = () => setIsExpanded((current) => !current);
    const closeSidebar = () => setIsExpanded(false);

    const visibleItems = navItems.filter(({ allowedRoles }) => {
        if (!allowedRoles || allowedRoles.length === 0) {
            return true;
        }

        return allowedRoles.includes(role);
    });

    const navClassName = ["sidebar-container"];

    if (isMobile) {
        if (isExpanded) {
            navClassName.push("open");
        }
    } else if (!isExpanded) {
        navClassName.push("collapsed");
    }

    const toggleLabel = isExpanded
        ? isMobile
            ? "Close navigation"
            : "Collapse navigation"
        : isMobile
            ? "Open navigation"
            : "Expand navigation";

    const shouldShowBackdrop = isMobile && isExpanded;

    const floatingButtonStyle = !isMobile
        ? {
              left: (isExpanded ? DESKTOP_EXPANDED_WIDTH : DESKTOP_COLLAPSED_WIDTH) - 22 - TOGGLE_EDGE_PADDING,
          }
        : undefined;

    const renderToggleButton = (style) => (
        <button
            type="button"
            className={`sidebar-toggle floating ${isExpanded ? "open" : ""}`}
            aria-controls="app-sidebar"
            aria-expanded={isExpanded}
            aria-label={toggleLabel}
            onClick={toggleSidebar}
            style={style}
        >
            <span className="sr-only">{toggleLabel}</span>
            {isExpanded ? (
                <img src={CloseIcon} alt="" aria-hidden="true" className="sidebar-toggle-close" />
            ) : (
                <span aria-hidden="true" className="sidebar-toggle-bars">
                    <span className="sidebar-toggle-bar" />
                    <span className="sidebar-toggle-bar" />
                    <span className="sidebar-toggle-bar" />
                </span>
            )}
        </button>
    );

    return (
        <>
            {renderToggleButton(floatingButtonStyle)}
            <div
                role="presentation"
                className={`sidebar-backdrop ${shouldShowBackdrop ? "visible" : ""}`}
                onClick={closeSidebar}
            />
            <nav id="app-sidebar" className={navClassName.join(" ")} aria-label="Primary">
                <Logo className="sidebar-logo" />
                {visibleItems.map(({ to, icon, label }) => (
                    <SidebarButton key={to} to={to} icon={icon} label={label} />
                ))}
            </nav>
        </>
    );
}
