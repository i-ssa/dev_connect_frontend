import { useState } from "react";
import ApiService from "../services/ApiService";
import { mapFrontendProjectToBackend } from "../utils/projectMapper";
import "../styles/CreateProjectModal.css";

export default function CreateProjectModal({ isOpen, onClose, onCreateProject }) {
	const [formData, setFormData] = useState({
		title: "",
		budget: "",
		timeline: "",
		description: "",
		files: [],
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	if (!isOpen) {
		return null;
	}

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileChange = (e) => {
		setFormData({ ...formData, files: Array.from(e.target.files) });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
			setLoading(true);
			setError(null);

			// Get user info
			const userStr = localStorage.getItem('devconnect_user');
			if (!userStr) {
				throw new Error('No user logged in. Please login first.');
			}

			const user = JSON.parse(userStr);
			const clientId = user.id || user.userId;

			if (!clientId) {
				throw new Error('User ID not found. Cannot create project.');
			}

			// Map frontend form data to backend DTO
			const projectRequest = mapFrontendProjectToBackend(formData, clientId, null);
			
			console.log('Creating project with data:', projectRequest);
			console.log('User:', user);
			console.log('Token:', localStorage.getItem('token') || localStorage.getItem('devconnect_token'));

			// Create project via API
			const createdProject = await ApiService.createProject(projectRequest);
			console.log('Project created successfully:', createdProject);

			// Upload files if present and backend supports it
			if (formData.files.length > 0) {
				try {
					await ApiService.uploadProjectFiles(createdProject.projectId, formData.files);
				} catch (uploadError) {
					console.warn('File upload failed (endpoint may not exist):', uploadError);
					// Continue even if file upload fails
				}
			}

			// Notify parent with the created project
			if (onCreateProject) {
				onCreateProject(createdProject);
			}

			// Reset form
			setFormData({
				title: "",
				budget: "",
				timeline: "",
				description: "",
				files: [],
			});

			setLoading(false);
			onClose();
		} catch (err) {
			console.error('Failed to create project:', err);
			setError(err.message || 'Failed to create project. Please try again.');
			setLoading(false);
		}
	};

	const handleCancel = () => {
		// Reset form
		setFormData({
			title: "",
			budget: "",
			timeline: "",
			description: "",
			files: [],
		});
		onClose();
	};

	return (
		<div className="create-project-overlay" onClick={handleCancel}>
			<div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Create New Project</h2>
					<p className="modal-subtitle">Fill in the details for your new project</p>
				</div>

				{error && (
					<div className="error-message" style={{
						padding: '10px',
						marginBottom: '15px',
						backgroundColor: '#fee',
						border: '1px solid #fcc',
						borderRadius: '4px',
						color: '#c33'
					}}>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="project-form">
					<div className="form-group">
						<label htmlFor="title">Project Title *</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Enter project name"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="budget">Budget (USD) *</label>
							<input
								type="number"
								id="budget"
								name="budget"
								value={formData.budget}
								onChange={handleChange}
								placeholder="e.g., 2000"
								required
								disabled={loading}
								min="0"
								step="0.01"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="timeline">Timeline (Date) *</label>
							<input
								type="date"
								id="timeline"
								name="timeline"
								value={formData.timeline}
								onChange={handleChange}
								required
								disabled={loading}
							/>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="description">Project Description *</label>
						<textarea
							id="description"
							name="description"
							rows="4"
							value={formData.description}
							onChange={handleChange}
							placeholder="Describe your project in detail"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="files">Upload Files (Optional)</label>
						<input
							type="file"
							id="files"
							multiple
							onChange={handleFileChange}
							className="file-input"
							disabled={loading}
						/>
						{formData.files.length > 0 && (
							<ul className="file-list">
								{formData.files.map((file, index) => (
									<li key={index}>{file.name}</li>
								))}
							</ul>
						)}
					</div>

					<div className="modal-actions">
						<button type="button" onClick={handleCancel} className="cancel-btn" disabled={loading}>
							Cancel
						</button>
						<button type="submit" className="create-btn" disabled={loading}>
							{loading ? 'Creating...' : 'Create Project'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
