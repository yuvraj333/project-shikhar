import { ShikharResponse, MessageDraft } from '@/app/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||'https://shikhar-backend-361074642677.us-central1.run.app'

export async function processReport(reportText: string): Promise<ShikharResponse> {
  const response = await fetch(`${API_BASE_URL}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_text: reportText }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json() as Promise<ShikharResponse>;
}

export async function approveDraftApi(draftId: string, incidentId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/review/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      item_id: draftId, 
      incident_id: incidentId, 
      review_type: 'draft', 
      status: 'approved' 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function publishDraftApi(draft: MessageDraft, draftId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/review/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      draft_id: draftId, 
      language: draft.language, 
      audience: draft.audience, 
      body: draft.body 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function fetchPublicBroadcasts(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/public/broadcasts`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}
export async function submitRescueRequest(name: string, need: string, lat: number = 27.7172, lng: number = 85.3240): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/victim/rescue-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, need, latitude: lat, longitude: lng }),
  });
  if (!response.ok) throw new Error('Failed to submit rescue request.');
  return response.json();
}

export async function fetchRescueRequests(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/victim/rescue-requests`);
  if (!response.ok) throw new Error('Failed to fetch rescue requests.');
  return response.json();
}
export async function updateRescueStatusApi(requestId: number, status: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/victim/rescue-request/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update rescue status.');
  return response.json();
}