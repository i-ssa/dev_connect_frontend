import { Link, useNavigate } from "react-router-dom";
import "../styles/SidebarButton.css";

export default function SidebarButton({ to, icon, label }) {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (to === "/logout") {
            e.preventDefault();
            // Clear all authentication data
            localStorage.removeItem('devconnect_user');
            localStorage.removeItem('devconnect_token');
            localStorage.removeItem('token');
            localStorage.removeItem('devconnect_refresh_token');
            
            // Redirect to home page
            navigate('/');
            
            // Force page reload to reset all state
            window.location.reload();
        }
    };

    return (
        <div className="sidebar-button-container">
            <Link to={to} className="sidebar-button" title={label} onClick={handleClick}>
                <img src={icon} alt={`${label} icon`} />
                <p>{label}</p>
            </Link>
        </div>
    );
}