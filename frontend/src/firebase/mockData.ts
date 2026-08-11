import { CouncilConfig, CollectionItem } from "../types";

export const MOCK_COUNCILS_REGISTRY: Record<string, CouncilConfig> = {
  "4720": {
    custodianCode: "4720",
    councilName: "Leeds City Council",
    scraperModule: "LeedsCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  },
  "240": {
    custodianCode: "240",
    councilName: "Manchester City Council",
    scraperModule: "ManchesterCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  },
  "114": {
    custodianCode: "114",
    councilName: "Bristol City Council",
    scraperModule: "BristolCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn"],
    requiresProprietaryId: false
  },
  "5990": {
    custodianCode: "5990",
    councilName: "City of Westminster",
    scraperModule: "WestminsterCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn"],
    requiresProprietaryId: false
  },
  "4605": {
    custodianCode: "4605",
    councilName: "Birmingham City Council",
    scraperModule: "BirminghamCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  },
  "2372": {
    custodianCode: "2372",
    councilName: "Sheffield City Council",
    scraperModule: "SheffieldCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn"],
    requiresProprietaryId: false
  },
  "1780": {
    custodianCode: "1780",
    councilName: "Liverpool City Council",
    scraperModule: "LiverpoolCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  },
  "3825": {
    custodianCode: "3825",
    councilName: "Newcastle City Council",
    scraperModule: "NewcastleCityCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["uprn"],
    requiresProprietaryId: false
  },
  "1005": {
    custodianCode: "1005",
    councilName: "Cheshire East Council",
    scraperModule: "CheshireEastCouncil",
    isSupported: true,
    status: "degraded",
    requiredParams: ["uprn", "postcode"],
    requiresProprietaryId: false
  },
  "9999": {
    custodianCode: "9999",
    councilName: "Example Proprietary Council",
    scraperModule: "ExampleProprietaryCouncil",
    isSupported: true,
    status: "operational",
    requiredParams: ["web_id"],
    requiresProprietaryId: true,
    proprietaryIdLabel: "Council Property Reference ID",
    proprietaryIdHelpUrl: "https://example.gov.uk/find-my-bin-id"
  },
  "8888": {
    custodianCode: "8888",
    councilName: "Unsupported Glen Council",
    scraperModule: "UnsupportedCouncil",
    isSupported: false,
    status: "broken",
    requiredParams: ["uprn"],
    requiresProprietaryId: false
  }
};

export function generateMockSchedule(startDate: Date = new Date()): CollectionItem[] {
  const dates: CollectionItem[] = [];
  
  // Calculate coming Tuesday and Friday
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);

  const getOffset = (days: number) => {
    const d = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  };

  dates.push(
    { type: "Refuse", date: getOffset(2) },
    { type: "Food Waste", date: getOffset(2) },
    { type: "Recycling", date: getOffset(9) },
    { type: "Food Waste", date: getOffset(9) },
    { type: "Garden Waste", date: getOffset(9) },
    { type: "Refuse", date: getOffset(16) },
    { type: "Food Waste", date: getOffset(16) },
    { type: "Recycling", date: getOffset(23) },
    { type: "Food Waste", date: getOffset(23) },
    { type: "Refuse", date: getOffset(30) },
    { type: "Food Waste", date: getOffset(30) }
  );

  return dates;
}
