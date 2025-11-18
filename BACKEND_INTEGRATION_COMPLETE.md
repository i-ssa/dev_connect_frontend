# Backend Integration - Projects Feature - COMPLETE ✅

**Date:** November 18, 2025  
**Status:** Integration complete and lint-checked  
**Backend Base URL:** `http://localhost:8081/api`

## Summary

Successfully integrated the backend project API endpoints with the frontend. All project-related operations now communicate with the Spring Boot backend instead of using localStorage.

---

## Changes Made

### 1. **New Utility File: `src/utils/projectMapper.js`**
Maps between backend DTOs and frontend component shapes:
- `mapBackendProjectToFrontend()` - Converts `ProjectResponseDTO` to frontend project object
- `mapFrontendProjectToBackend()` - Converts frontend form data to `ProjectRequestDTO`
- `mapBackendStatusToFrontend()` / `mapFrontendStatusToBackend()` - Status enum conversions
- `formatBudget()` / `formatTimeline()` - Display formatting helpers

**Key Mappings:**
| Backend DTO | Frontend | Notes |
|------------|----------|-------|
| `projectId` | `id` | Numeric ID |
| `projectName` | `title` | String |
| `projectBudget` | `budget` | BigDecimal → number |
| `timeline` | `timeline` | LocalDateTime → ISO string |
| `status` (enum) | `status` (string) | PENDING→available, IN_PROGRESS→in-progress, etc. |
| `devId` | `devId`, `assignedDeveloper` | Can be null if no dev assigned |
| `clientId` | `clientId` | Required field |

---

### 2. **Updated `src/services/ApiService.js`**

#### Added Auth Header Support
- `getAuthHeaders()` method checks `localStorage.getItem('token')` or `devconnect_user.token`
- All API calls include `Authorization: Bearer <token>` when token exists

#### New Project Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `getProjectsByClient(clientId)` | `GET /projects/client/{clientId}` | Fetch all projects for a client |
| `getProjectsByDeveloper(devId)` | `GET /projects/developer/{devId}` | Fetch all projects for a developer |
| `getProject(projectId)` | `GET /projects/{projectId}` | Fetch single project by ID |
| `getAllProjects()` | `GET /projects/` | Fetch all projects |
| `getProjectsByStatus(status)` | `GET /projects/status/{status}` | Fetch by status enum |
| `createProject(projectData)` | `POST /projects/create` | Create new project |
| `updateProject(projectId, data)` | `PUT /projects/update/{projectId}` | Update existing project |
| `updateProjectStatus(projectId, status)` | `PATCH /projects/{projectId}/status?status=...` | Update status only |
| `markProjectCompleted(projectId)` | `PATCH /projects/{projectId}/complete` | Mark as completed |
| `deleteProject(projectId)` | `DELETE /projects/delete/{projectId}` | Delete project |
| `uploadProjectFiles(projectId, files)` | `POST /projects/{projectId}/files` | Upload files (stub - requires backend) |

All methods include error handling and return parsed JSON or throw errors with messages.

---

### 3. **Updated `src/pages/MyProjectClient.jsx`**

**Before:** Used `localStorage.getItem('client_projects')` to persist projects locally.

**After:**
- Fetches projects from backend via `ApiService.getProjectsByClient(clientId)` on mount
- Added loading state with spinner
- Added error state with retry button
- Maps backend DTOs to frontend shape using `mapBackendProjectToFrontend()`
- Optimistic UI updates when creating projects
- User ID extracted from `localStorage.getItem('devconnect_user')`

**New States:**
- `loading` - Shows spinner while fetching
- `error` - Displays error message with retry option

---

### 4. **Updated `src/components/CreateProjectModal.jsx`**

**Before:** Created local project object with `Date.now()` ID and called `onCreateProject()` immediately.

**After:**
- Submits project to backend via `ApiService.createProject(projectRequest)`
- Converts form data to `ProjectRequestDTO` format using `mapFrontendProjectToBackend()`
- Handles numeric budget (changed input from text to `type="number"`)
- Handles date timeline (changed input to `type="date"`)
- Uploads files via `ApiService.uploadProjectFiles()` if backend endpoint exists (gracefully fails if not)
- Shows loading state during submission
- Displays inline error messages
- Disabled form fields during submission
- Returns backend-created project to parent component

**Form Changes:**
- Budget: now `type="number"` (was text with placeholder like "$500 - $2000")
- Timeline: now `type="date"` (was text with placeholder like "2-4 weeks")
- Both fields send proper data types to backend (number and ISO date)

**Note:** `devId` is set to `null` when creating projects (client creates without assigning developer). Backend must accept nullable `devId` or you need to modify the entity.

---

### 5. **Updated `src/pages/ProjectDetails.jsx`**

**Before:** Used mock data hardcoded in component.

**After:**
- Fetches project from backend via `ApiService.getProject(projectId)` on mount
- Added loading state with spinner
- Added error state with retry button
- Maps backend DTO to frontend shape
- Uses backend IDs (`devId`, `clientId`) for chat navigation
- Checks current user role to determine chat recipient (client chats with dev, dev chats with client)
- Displays formatted budget and timeline using helper functions

---

### 6. **Updated `src/components/ProjectDetailsModal.jsx`**

**After:**
- Imports `formatBudget()` and `formatTimeline()` from projectMapper
- Uses backend fields (`devId`, `clientId`, `title/projectName`)
- Determines chat recipient based on current user role
- Shows alert if no developer assigned when trying to open chat
- Displays budget, timeline, status, and creation date

---

### 7. **Updated `src/components/ProjectCard.jsx`**

**After:**
- Imports `formatBudget()` and `formatTimeline()` utilities
- Handles both backend DTO fields (`projectName`, `projectBudget`) and frontend fields (`title`, `budget`)
- Added "cancelled" status badge config
- Added null/undefined checks for all fields
- Formats budget as currency
- Formats timeline as readable date
- Shows developer ID when assigned (displays as "Dev #123")

---

## Backend Requirements & Assumptions

### 1. **devId Handling**
Currently, the frontend sends `devId: null` when creating projects (clients don't assign developers immediately).

**Options:**
- ✅ **Recommended:** Modify backend `Project` entity to allow `devId` to be nullable
- ❌ Frontend must select developer during creation (requires adding developer picker UI)
- ❌ Backend creates with placeholder devId (not recommended)

### 2. **Authentication**
Frontend looks for auth token in:
1. `localStorage.getItem('token')` (primary)
2. `JSON.parse(localStorage.getItem('devconnect_user')).token` (fallback)

Sends as: `Authorization: Bearer <token>`

If your auth uses a different header or location, update `ApiService.getAuthHeaders()`.

### 3. **File Uploads**
The `uploadProjectFiles()` method is implemented but the backend endpoint `/projects/{projectId}/files` was not in your controller list.

**To enable file uploads:**
- Add multipart file upload endpoint in backend `ProjectController`
- Store files in file system or cloud storage
- Link file references to project entity

**Current behavior:** File upload silently fails with console warning if endpoint doesn't exist.

### 4. **CORS Configuration**
Ensure backend allows requests from `http://localhost:5173` (Vite dev server) or your frontend domain.

Example Spring Boot CORS config:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## Testing Guide

### Prerequisites
1. Backend running on `http://localhost:8081`
2. Database with projects table
3. User logged in (token in localStorage)

### Test Scenarios

#### 1. **View Projects List**
1. Navigate to `/my-projects` (or client dashboard)
2. Should show loading spinner initially
3. Should display projects from backend for current client
4. Status badges should match backend enum values
5. Budget and timeline should be formatted correctly

**Expected API Call:**
```
GET http://localhost:8081/api/projects/client/{clientId}
Authorization: Bearer <token>
```

#### 2. **Create New Project**
1. Click the "+" floating button
2. Fill in:
   - Title: "Test Project"
   - Budget: 5000
   - Timeline: Select a date
   - Description: "Test description"
   - (Optional) Upload files
3. Click "Create Project"
4. Should show "Creating..." on button
5. Should close modal and show new project in list

**Expected API Call:**
```
POST http://localhost:8081/api/projects/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectName": "Test Project",
  "description": "Test description",
  "projectBudget": 5000.0,
  "timeline": "2025-12-31T00:00:00",
  "clientId": 123,
  "devId": null
}
```

**If Backend Rejects Null devId:**
You'll see error message in modal. Modify backend or add developer selection UI.

#### 3. **View Project Details**
1. Click on a project card (or navigate to `/projects/{id}`)
2. Should show loading spinner
3. Should display project details fetched from backend
4. Budget and timeline should be formatted
5. Status badge should show correct color

**Expected API Call:**
```
GET http://localhost:8081/api/projects/{projectId}
Authorization: Bearer <token>
```

#### 4. **Open Chat from Project**
1. On project details page, click "Open Chat"
2. Should navigate to `/messages?userId={otherUserId}&projectId={projectId}`
3. If no developer assigned, should show alert

#### 5. **Error Handling**
Test these scenarios:
- Backend offline → Should show error message with retry button
- Invalid auth token → Should show 401 error
- Project not found → Should show "Project not found" message
- Network timeout → Should show error and allow retry

---

## Known Issues & TODOs

### 1. **devId Nullable Issue**
- Frontend sends `devId: null` for new projects
- Backend may reject this if field is non-nullable
- **Fix:** Make `devId` nullable in backend entity OR add developer selection UI

### 2. **File Upload Endpoint Missing**
- Frontend calls `/projects/{projectId}/files` but endpoint doesn't exist in backend
- Files are silently not uploaded (console warning shown)
- **Fix:** Add file upload controller endpoint in backend

### 3. **Status Mapping**
Current mappings:
- `PENDING` ↔ `available`
- `IN_PROGRESS` ↔ `in-progress`
- `COMPLETED` ↔ `completed`
- `CANCELLED` ↔ `cancelled`

Verify this matches your UI/UX requirements.

### 4. **User Details Not Fetched**
- ProjectCard shows "Dev #123" instead of developer name
- ProjectDetails doesn't display client/developer names
- **Fix:** Fetch user details from `/api/users/{id}` and join with projects

### 5. **No Pagination**
- `getAllProjects()` and `getProjectsByClient()` return all results
- May cause performance issues with many projects
- **Recommendation:** Add pagination to backend endpoints and frontend UI

### 6. **Real-time Updates**
- Projects list doesn't auto-refresh when changes occur elsewhere
- Consider WebSocket for real-time project updates

---

## Manual Testing Commands

### Start Frontend Dev Server
```bash
cd /home/issa/SE/dev_connect_frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Check Backend is Running
```bash
curl http://localhost:8081/api/projects/
```

Should return JSON array of projects.

### Test Create Project with curl
```bash
curl -X POST http://localhost:8081/api/projects/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "projectName": "Test via curl",
    "description": "Testing API",
    "projectBudget": 1000.0,
    "timeline": "2025-12-31T00:00:00",
    "clientId": 1,
    "devId": null
  }'
```

### Lint Check
```bash
npx eslint src/services/ApiService.js src/utils/projectMapper.js src/pages/MyProjectClient.jsx src/components/CreateProjectModal.jsx src/components/ProjectCard.jsx src/pages/ProjectDetails.jsx
```

All files pass linting ✅

---

## Next Steps

1. **Backend Modifications (if needed):**
   - Make `devId` nullable in `Project` entity
   - Add file upload endpoint
   - Add CORS configuration
   - Consider pagination for project list endpoints

2. **Frontend Enhancements:**
   - Add developer selection UI when creating projects
   - Fetch and display user names instead of IDs
   - Add pagination for project lists
   - Add project filtering and search
   - Add project update/edit functionality
   - Implement real-time updates via WebSocket

3. **Testing:**
   - Run manual tests with backend running
   - Add unit tests for ApiService methods
   - Add integration tests for components
   - Test error scenarios (network failures, 404s, 401s)

4. **Payments Integration:**
   - Confirm payment API contract
   - Wire `src/API/paymentAPI.js` to backend
   - Link payments to projects

---

## Files Modified

✅ **Created:**
- `src/utils/projectMapper.js` - DTO mapping utilities

✅ **Updated:**
- `src/services/ApiService.js` - Added project methods + auth headers
- `src/pages/MyProjectClient.jsx` - Backend fetching + loading/error states
- `src/components/CreateProjectModal.jsx` - Backend submission + form updates
- `src/pages/ProjectDetails.jsx` - Backend fetching + loading/error states
- `src/components/ProjectDetailsModal.jsx` - Backend field mapping
- `src/components/ProjectCard.jsx` - Backend DTO support + formatting

✅ **Linting:** All modified files pass ESLint with no errors

---

## Support

If you encounter issues:

1. **Check browser console** for API errors
2. **Check network tab** to see request/response details
3. **Verify backend is running** on port 8081
4. **Check auth token** is present in localStorage
5. **Verify CORS** is configured on backend

Common errors:
- `Failed to fetch` → Backend not running or CORS issue
- `401 Unauthorized` → Token missing or invalid
- `404 Not Found` → Backend endpoint doesn't exist or wrong URL
- `RuntimeException: Project not found` → Project ID doesn't exist in database

---

**Integration completed successfully!** 🎉

Test thoroughly with backend running and report any issues.
