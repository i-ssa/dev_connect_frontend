import { formatBudget, formatTimeline } from "../utils/projectMapper";
import "../styles/ProjectCard.css";

export default function ProjectCard({ project }) {
	const getStatusBadge = () => {
		const statusConfig = {
			available: { label: "Available", className: "status-available" },
			"in-progress": { label: "In Progress", className: "status-in-progress" },
			completed: { label: "Completed", className: "status-completed" },
			cancelled: { label: "Cancelled", className: "status-cancelled" },
		};

		const config = statusConfig[project.status] || statusConfig.available;

		return <span className={`status-badge ${config.className}`}>{config.label}</span>;
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return dateString;
		}
	};

	// Handle both backend DTO (projectName) and frontend shape (title)
	const title = project.title || project.projectName || 'Untitled Project';
	const budget = formatBudget(project.budget || project.projectBudget);
	const timeline = formatTimeline(project.timeline);

	return (
		<div className="project-card">
			<div className="project-card-header">
				<h3 className="project-title">{title}</h3>
				{getStatusBadge()}
			</div>

			<p className="project-description">{project.description || 'No description available.'}</p>

			<div className="project-meta">
				<div className="meta-item">
					<span className="meta-label">Budget:</span>
					<span className="meta-value">{budget}</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Timeline:</span>
					<span className="meta-value">{timeline}</span>
				</div>
			</div>

			<div className="project-footer">
				<span className="project-date">Created: {formatDate(project.createdAt)}</span>
				{project.assignedDeveloper && project.assignedDeveloper !== 'null' && (
					<span className="assigned-dev">
						Assigned to: <strong>Dev #{project.assignedDeveloper}</strong>
					</span>
				)}
			</div>

			{project.files && project.files.length > 0 && (
				<div className="project-files">
					<span className="files-label">📎 {project.files.length} file(s) attached</span>
				</div>
			)}
		</div>
	);
}
