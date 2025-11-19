/**
 * Utility functions to map between backend ProjectResponseDTO and frontend project shape
 */

/**
 * Map backend status enum to frontend status string
 */
export const mapBackendStatusToFrontend = (backendStatus) => {
  const statusMap = {
    'PENDING': 'available',
    'IN_PROGRESS': 'in-progress',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  };
  return statusMap[backendStatus] || 'available';
};

/**
 * Map frontend status string to backend status enum
 */
export const mapFrontendStatusToBackend = (frontendStatus) => {
  const statusMap = {
    'available': 'PENDING',
    'in-progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED'
  };
  return statusMap[frontendStatus] || 'PENDING';
};

/**
 * Convert backend ProjectResponseDTO to frontend project object
 */
export const mapBackendProjectToFrontend = (backendProject) => {
  if (!backendProject) return null;

  const rawClaimState = backendProject?.isClaimed ?? backendProject?.claimed ?? backendProject?.claimStatus;
  const normalizedClaimState = (() => {
    if (typeof rawClaimState === 'string') {
      return rawClaimState.toLowerCase() === 'true' || rawClaimState.toLowerCase() === 'claimed';
    }
    return Boolean(rawClaimState);
  })();

  return {
    id: backendProject.projectId,
    title: backendProject.projectName,
    description: backendProject.description,
    budget: backendProject.projectBudget,
    timeline: backendProject.timeline,
    status: mapBackendStatusToFrontend(backendProject.status),
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
    devId: backendProject.devId,
    clientId: backendProject.clientId,
    assignedDeveloper: backendProject.devId, // Will be used for display; can fetch dev name separately
    isClaimed: normalizedClaimState,
    files: [] // Files will be managed separately if backend supports file endpoints
  };
};

/**
 * Convert frontend project form data to backend ProjectRequestDTO
 */
export const mapFrontendProjectToBackend = (frontendProject, clientId, devId = null) => {
  return {
    projectName: frontendProject.title || frontendProject.projectName,
    description: frontendProject.description,
    projectBudget: parseFloat(frontendProject.budget) || 0,
    timeline: frontendProject.timeline ? new Date(frontendProject.timeline).toISOString() : null,
    clientId: clientId,
    devId: devId // Can be null if developer not assigned yet
  };
};

/**
 * Format budget for display
 */
export const formatBudget = (budget) => {
  if (typeof budget === 'number') {
    return `$${budget.toFixed(2)}`;
  }
  return budget;
};

/**
 * Format timeline for display
 */
export const formatTimeline = (timeline) => {
  if (!timeline) return 'Not specified';
  
  try {
    const date = new Date(timeline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return timeline;
  }
};
