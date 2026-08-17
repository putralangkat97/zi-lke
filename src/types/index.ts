export type Role = "admin" | "ketua_tim" | "ketua_pokja" | "anggota_pokja" | "tpi" | "pimpinan";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  assigned_pokja?: string[]; // array of pokja codes e.g. ["1", "2"]
}

export type IndicatorStatus = "not_filled" | "filled" | "reviewed_accepted" | "reviewed_revision_required" | "revised";

export interface Indicator {
  id: string;
  code: string;
  area_code: string;
  pokja_code: string;
  pokja_name: string;
  section_path: {
    code: string;
    name: string;
    weight: number;
  }[];
  question: string;
  weight: number;
  answer_input_type: "yes_no" | "single_choice" | "numeric" | "percentage";
  is_answer_required: boolean;
  is_evidence_required: boolean;
  options: {
    id: string;
    label: string;
    criteria: string;
    score_percentage: number;
  }[];
  // unit answers
  selected_option_id?: string;
  answer_notes?: string;
  evidence_documents?: { id: string; name: string; url: string; size?: string; uploadedAt?: string; uploadedBy?: string }[];
  evidence_links?: { id: string; url: string }[];
  // TPI reviews
  reviewed_option_id?: string;
  score_percentage?: number;
  score_value?: number;
  review_notes?: string;
  status: IndicatorStatus;
  last_editor?: string;
  updated_at?: string;
}

export interface Pokja {
  code: string;
  name: string;
  weight: number;
  indicators: Indicator[];
  progress: {
    total: number;
    filled: number;
    revision_required: number;
  }
}

export interface LKE {
  id: string;
  unit_name: string;
  period: string;
  status: "Draft" | "Submitted" | "In Review" | "Need Revision" | "Approved" | "Archived";
  created_at: string;
  pokjas: Pokja[];
}

export interface AuditLog {
  id: string;
  lkeId: string;
  lkePeriod: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: 'fill_answer' | 'submit_lke' | 'review_indicator' | 'status_change' | 'create_template' | 'delete_template' | 'switch_lke';
  details: {
    indicatorId?: string;
    indicatorCode?: string;
    pokjaCode?: string;
    pokjaName?: string;
    previousStatus?: string;
    newStatus?: string;
    previousValue?: string;
    newValue?: string;
    notes?: string;
    description: string;
  };
}

