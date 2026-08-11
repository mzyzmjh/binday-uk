export interface Address {
  uprn: string;
  buildingNumber?: string;
  buildingName?: string;
  thoroughfareName?: string;
  singleLineAddress: string;
  postcode: string;
  custodianCode: string;
  councilName: string;
  proprietaryId?: string;
}

export interface BinAlias {
  alias: string;
  color: string;
  icon?: string;
}

export interface CollectionItem {
  type: string;
  date: string; // YYYY-MM-DD
  raw_type?: string;
  display_name?: string;
  color?: string;
  days_until?: number;
  is_today?: boolean;
  is_tomorrow?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  address: Address;
  scheduleKey: string;
  tokens: {
    calendarToken: string;
    apiToken: string;
  };
  customisations: {
    binAliases: Record<string, BinAlias>;
  };
  alertPreferences: {
    enabled: boolean;
    leadTimeHours: number;
    valarmTrigger: string;
  };
  webhooks: Array<{
    id: string;
    url: string;
    enabled: boolean;
    secret?: string;
  }>;
  gdpr: {
    privacyPolicyAccepted: boolean;
    privacyPolicyAcceptedAt: string;
    privacyPolicyVersion: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CouncilConfig {
  custodianCode: string;
  councilName: string;
  scraperModule: string;
  isSupported: boolean;
  status: "operational" | "degraded" | "broken";
  requiredParams: string[];
  requiresProprietaryId: boolean;
  proprietaryIdLabel?: string;
  proprietaryIdHelpUrl?: string;
  lastUpdatedFromAst?: string;
  failureRate24h?: number;
}
