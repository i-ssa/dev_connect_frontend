import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DeveloperCard from '../components/DeveloperCard';
import ClientSetup from '../components/ClientSetup';
import '../styles/FindDevelopers.css';

const mockDevelopers = [
	{ id: 11, name: 'Alex Rivera', role: 'Full-Stack Developer', rating: '4.9/5' },
	{ id: 12, name: 'Fatima Khan', role: 'Mobile Engineer', rating: '4.8/5' },
	{ id: 13, name: 'Jun Park', role: 'AI/ML Engineer', rating: '4.7/5' },
	{ id: 14, name: 'Maria Gomez', role: 'Backend Developer', rating: '4.9/5' },
	{ id: 15, name: 'Sam Njoroge', role: 'Frontend Developer', rating: '4.6/5' }
];

export default function FindDevelopers() {
	const location = useLocation();
	const [showSetup, setShowSetup] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const filteredDevelopers = useMemo(() => {
		const normalizedTerm = searchTerm.trim().toLowerCase();
		if (!normalizedTerm) {
			return mockDevelopers;
		}
		return mockDevelopers.filter((developer) => {
			const haystack = [developer.name, developer.role, developer.rating]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(normalizedTerm);
		});
	}, [searchTerm]);

	useEffect(() => {
		if (location.state?.showSetup && location.state?.role === 'client') {
			setShowSetup(true);
		}
	}, [location]);

	const handleSetupComplete = (profileData) => {
		const clientUser = {
			id: 1,
			email: 'john@example.com',
			role: 'client',
			...profileData
		};
		localStorage.setItem('devconnect_user', JSON.stringify(clientUser));
		setShowSetup(false);
	};

	const handleSetupClose = () => {
		setShowSetup(false);
	};

	return (
		<>
			<div className="find-dev-page">
				<header className="find-dev-header">
					<h1>Find Developers</h1>
					<p className="subtitle">Browse vetted developers ready to collaborate on your next project.</p>
				</header>

				<div className="search-row">
					<input
						className="search-input"
						placeholder="Search by skill, stack, or name"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
				</div>

				<div className="filters-card">
					<div className="filters">
						<button className="filter">All Skills</button>
						<button className="filter">Available Now</button>
						<button className="filter">Top Rated</button>
					</div>
					<div className="best-matches">Best matches for you</div>
				</div>

				<section className="results-card">
					{filteredDevelopers.length === 0 ? (
						<div className="empty-state">
							<div className="empty-icon">🔍</div>
							<h3>No matching developers</h3>
							<p>Try a different skill, stack, or name.</p>
						</div>
					) : (
						filteredDevelopers.map((developer) => (
							<DeveloperCard key={developer.id} developer={developer} />
						))
					)}
				</section>
			</div>

			<ClientSetup
				isOpen={showSetup}
				onClose={handleSetupClose}
				onComplete={handleSetupComplete}
			/>
		</>
	);
}
