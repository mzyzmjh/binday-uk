export interface DpaAddress {
  UPRN: string;
  BUILDING_NUMBER?: string;
  BUILDING_NAME?: string;
  THOROUGHFARE_NAME?: string;
  POST_TOWN: string;
  POSTCODE: string;
  LOCAL_CUSTODIAN_CODE: number;
  LOCAL_CUSTODIAN_CODE_DESCRIPTION: string;
  ADDRESS: string;
}

export const MOCK_DPA_RECORDS: Record<string, DpaAddress[]> = {
  "W1T4JZ": [
    {
      UPRN: "100023337001",
      BUILDING_NUMBER: "10",
      THOROUGHFARE_NAME: "Tottenham Mews",
      POST_TOWN: "London",
      POSTCODE: "W1T 4JZ",
      LOCAL_CUSTODIAN_CODE: 5060,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Camden London Borough Council",
      ADDRESS: "10, Tottenham Mews, London, W1T 4JZ"
    },
    {
      UPRN: "100023337002",
      BUILDING_NUMBER: "12",
      THOROUGHFARE_NAME: "Tottenham Mews",
      POST_TOWN: "London",
      POSTCODE: "W1T 4JZ",
      LOCAL_CUSTODIAN_CODE: 5060,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Camden London Borough Council",
      ADDRESS: "12, Tottenham Mews, London, W1T 4JZ"
    },
    {
      UPRN: "100023337003",
      BUILDING_NUMBER: "14",
      THOROUGHFARE_NAME: "Tottenham Mews",
      POST_TOWN: "London",
      POSTCODE: "W1T 4JZ",
      LOCAL_CUSTODIAN_CODE: 5060,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Camden London Borough Council",
      ADDRESS: "14, Tottenham Mews, London, W1T 4JZ"
    }
  ],
  "LS268XX": [
    {
      UPRN: "100051234501",
      BUILDING_NUMBER: "1",
      THOROUGHFARE_NAME: "Church Street",
      POST_TOWN: "Leeds",
      POSTCODE: "LS26 8XX",
      LOCAL_CUSTODIAN_CODE: 4720,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Leeds City Council",
      ADDRESS: "1, Church Street, Rothwell, Leeds, LS26 8XX"
    },
    {
      UPRN: "100051234502",
      BUILDING_NUMBER: "2",
      THOROUGHFARE_NAME: "Church Street",
      POST_TOWN: "Leeds",
      POSTCODE: "LS26 8XX",
      LOCAL_CUSTODIAN_CODE: 4720,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Leeds City Council",
      ADDRESS: "2, Church Street, Rothwell, Leeds, LS26 8XX"
    },
    {
      UPRN: "100051234510",
      BUILDING_NUMBER: "10",
      THOROUGHFARE_NAME: "Church Street",
      POST_TOWN: "Leeds",
      POSTCODE: "LS26 8XX",
      LOCAL_CUSTODIAN_CODE: 4720,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Leeds City Council",
      ADDRESS: "10, Church Street, Rothwell, Leeds, LS26 8XX"
    },
    {
      UPRN: "100051234512",
      BUILDING_NUMBER: "12",
      THOROUGHFARE_NAME: "Church Street",
      POST_TOWN: "Leeds",
      POSTCODE: "LS26 8XX",
      LOCAL_CUSTODIAN_CODE: 4720,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Leeds City Council",
      ADDRESS: "12, Church Street, Rothwell, Leeds, LS26 8XX"
    },
    {
      UPRN: "100051234524",
      BUILDING_NUMBER: "24",
      THOROUGHFARE_NAME: "Church Street",
      POST_TOWN: "Leeds",
      POSTCODE: "LS26 8XX",
      LOCAL_CUSTODIAN_CODE: 4720,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Leeds City Council",
      ADDRESS: "24, Church Street, Rothwell, Leeds, LS26 8XX"
    }
  ],
  "M11AA": [
    {
      UPRN: "200052345601",
      BUILDING_NUMBER: "5",
      BUILDING_NAME: "Flat 1",
      THOROUGHFARE_NAME: "Piccadilly",
      POST_TOWN: "Manchester",
      POSTCODE: "M1 1AA",
      LOCAL_CUSTODIAN_CODE: 240,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Manchester City Council",
      ADDRESS: "Flat 1, 5, Piccadilly, Manchester, M1 1AA"
    },
    {
      UPRN: "200052345602",
      BUILDING_NUMBER: "5",
      BUILDING_NAME: "Flat 2",
      THOROUGHFARE_NAME: "Piccadilly",
      POST_TOWN: "Manchester",
      POSTCODE: "M1 1AA",
      LOCAL_CUSTODIAN_CODE: 240,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Manchester City Council",
      ADDRESS: "Flat 2, 5, Piccadilly, Manchester, M1 1AA"
    },
    {
      UPRN: "200052345610",
      BUILDING_NUMBER: "15",
      THOROUGHFARE_NAME: "Piccadilly",
      POST_TOWN: "Manchester",
      POSTCODE: "M1 1AA",
      LOCAL_CUSTODIAN_CODE: 240,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Manchester City Council",
      ADDRESS: "15, Piccadilly, Manchester, M1 1AA"
    }
  ],
  "BS15AH": [
    {
      UPRN: "300053456701",
      BUILDING_NUMBER: "8",
      THOROUGHFARE_NAME: "College Green",
      POST_TOWN: "Bristol",
      POSTCODE: "BS1 5AH",
      LOCAL_CUSTODIAN_CODE: 114,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Bristol City Council",
      ADDRESS: "8, College Green, Bristol, BS1 5AH"
    },
    {
      UPRN: "300053456702",
      BUILDING_NUMBER: "14",
      THOROUGHFARE_NAME: "College Green",
      POST_TOWN: "Bristol",
      POSTCODE: "BS1 5AH",
      LOCAL_CUSTODIAN_CODE: 114,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Bristol City Council",
      ADDRESS: "14, College Green, Bristol, BS1 5AH"
    }
  ],
  "SW1A1AA": [
    {
      UPRN: "100023336956",
      BUILDING_NAME: "Buckingham Palace",
      THOROUGHFARE_NAME: "The Mall",
      POST_TOWN: "London",
      POSTCODE: "SW1A 1AA",
      LOCAL_CUSTODIAN_CODE: 5990,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "City of Westminster",
      ADDRESS: "Buckingham Palace, The Mall, London, SW1A 1AA"
    }
  ],
  "EX11ID": [
    {
      UPRN: "9000999901",
      BUILDING_NUMBER: "42",
      THOROUGHFARE_NAME: "Proprietary Way",
      POST_TOWN: "Exeter",
      POSTCODE: "EX1 1ID",
      LOCAL_CUSTODIAN_CODE: 9999,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Example Proprietary Council",
      ADDRESS: "42, Proprietary Way, Exeter, EX1 1ID"
    }
  ],
  "ZZ999ZZ": [
    {
      UPRN: "888800001",
      BUILDING_NUMBER: "1",
      THOROUGHFARE_NAME: "Remote Glen",
      POST_TOWN: "Highlands",
      POSTCODE: "ZZ99 9ZZ",
      LOCAL_CUSTODIAN_CODE: 8888,
      LOCAL_CUSTODIAN_CODE_DESCRIPTION: "Unsupported Glen Council",
      ADDRESS: "1, Remote Glen, Highlands, ZZ99 9ZZ"
    }
  ]
};

export function getMockDpaForPostcode(normalizedPostcode: string): DpaAddress[] | null {
  const cleanPostcode = normalizedPostcode.replace(/\s+/g, "").toUpperCase();
  if (MOCK_DPA_RECORDS[cleanPostcode]) {
    return MOCK_DPA_RECORDS[cleanPostcode];
  }
  return null;
}
