export interface EvidenceItem {
  source_reference: string;
  field: string;
  source_excerpt: string;
  confidence: string;
}

export interface Incident {
  incident_id: string;
  report_id: string;
  disaster_type: string;
  location_text: string;
  reported_at: string;
  incident_time: string | null;
  severity: string;
  people_trapped: number | null;
  people_injured: number | null;
  source_type: string;
  verification_status: string;
  missing_information: string[];
  uncertainties: {
    field: string;
    status: string;
    reason: string;
    requires_clarification: boolean;
  }[];
  evidence: EvidenceItem[];
}

export interface ResourceRecommendation {
  resource_type: string;
  requested_quantity: number | null;
  available_quantity: number | null;
  proposed_quantity: number | null;
  shortfall_quantity: number | null;
  unit: string;
  planning_assumptions: string[];
  validation_status: string;
}

export interface ResponsePlan {
  plan_id: string;
  incident_id: string;
  inventory_snapshot_id: string;
  recommendations: ResourceRecommendation[];
  plan_status: string;
  dispatch_status: string;
  requires_human_approval: boolean;
}

export interface MessageDraft {
  draft_id: string;
  language: string;
  audience: string;
  message_type: string;
  body: string;
  supporting_source_references: string[];
  warnings: string[];
  status: string;
}

export interface CommunicationsPackage {
  incident_id: string;
  drafts: MessageDraft[];
  delivery_status: string;
  requires_human_approval: boolean;
}

export interface SafetyStatus {
  incident_verified: boolean;
  dispatch_status: string;
  communication_delivery_status: string;
  requires_human_approval: boolean;
}

export interface ShikharResponse {
  status: string;
  data: {
    workflow_status: string;
    incident: Incident;
    response_plan: ResponsePlan;
    communications: CommunicationsPackage;
    safety: SafetyStatus;
  };
}