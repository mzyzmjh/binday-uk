import { Request, Response } from "express";
import { DpaAddress, getMockDpaForPostcode } from "../mock/sampleAddresses";

export interface NormalizedAddress {
  uprn: string;
  buildingNumber?: string;
  buildingName?: string;
  thoroughfareName?: string;
  postTown: string;
  postcode: string;
  custodianCode: string;
  councilName: string;
  singleLineAddress: string;
}

export function normalizePostcode(rawPostcode: string): string {
  const clean = rawPostcode.trim().toUpperCase().replace(/\s+/g, "");
  if (clean.length < 5 || clean.length > 7) {
    return rawPostcode.trim().toUpperCase();
  }
  const outward = clean.slice(0, -3);
  const inward = clean.slice(-3);
  return `${outward} ${inward}`;
}

export function sortAddressesNumerically(addresses: NormalizedAddress[]): NormalizedAddress[] {
  return [...addresses].sort((a, b) => {
    const numA = parseInt(a.buildingNumber || "", 10);
    const numB = parseInt(b.buildingNumber || "", 10);

    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) {
        return numA - numB;
      }
    } else if (!isNaN(numA)) {
      return -1;
    } else if (!isNaN(numB)) {
      return 1;
    }

    return a.singleLineAddress.localeCompare(b.singleLineAddress, undefined, {
      numeric: true,
      sensitivity: "base"
    });
  });
}

export function dpaToNormalized(dpa: DpaAddress): NormalizedAddress {
  let line = dpa.ADDRESS;
  if (!line) {
    const parts = [
      dpa.BUILDING_NAME,
      dpa.BUILDING_NUMBER ? `${dpa.BUILDING_NUMBER} ${dpa.THOROUGHFARE_NAME || ""}` : dpa.THOROUGHFARE_NAME,
      dpa.POST_TOWN,
      dpa.POSTCODE
    ].filter(Boolean);
    line = parts.join(", ");
  }

  return {
    uprn: dpa.UPRN,
    buildingNumber: dpa.BUILDING_NUMBER,
    buildingName: dpa.BUILDING_NAME,
    thoroughfareName: dpa.THOROUGHFARE_NAME,
    postTown: dpa.POST_TOWN,
    postcode: dpa.POSTCODE,
    custodianCode: dpa.LOCAL_CUSTODIAN_CODE.toString(),
    councilName: dpa.LOCAL_CUSTODIAN_CODE_DESCRIPTION || "Local Council",
    singleLineAddress: line
  };
}

export async function handleAddressLookup(req: Request, res: Response): Promise<void> {
  try {
    const rawPostcode = (req.query.postcode as string || req.body?.postcode as string || "").trim();
    if (!rawPostcode) {
      res.status(400).json({ error: "Missing required 'postcode' parameter." });
      return;
    }

    const formattedPostcode = normalizePostcode(rawPostcode);
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    if (!ukPostcodeRegex.test(formattedPostcode)) {
      res.status(400).json({ error: "Invalid UK postcode format. Example: LS26 8XX" });
      return;
    }

    const apiKey = process.env.OS_PLACES_API_KEY;
    const forceMock = req.query.mock === "true" || !apiKey;

    let dpaResults: DpaAddress[] = [];

    if (!forceMock && apiKey) {
      const cleanNoSpace = formattedPostcode.replace(/\s+/g, "");
      const osUrl = `https://api.os.uk/search/places/v1/postcode?postcode=${encodeURIComponent(cleanNoSpace)}&key=${apiKey}&dataset=DPA`;
      
      const response = await fetch(osUrl, {
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
          dpaResults = data.results
            .map((item: any) => item.DPA)
            .filter(Boolean);
        }
      } else {
        console.warn(`OS Places API error (${response.status}), falling back to mock response.`);
        dpaResults = getMockDpaForPostcode(formattedPostcode);
      }
    } else {
      dpaResults = getMockDpaForPostcode(formattedPostcode);
    }

    const normalized = dpaResults.map(dpaToNormalized);
    const sorted = sortAddressesNumerically(normalized);

    res.set("Cache-Control", "public, max-age=86400"); // Cache postcode lookup for 24h
    res.status(200).json({
      postcode: formattedPostcode,
      count: sorted.length,
      addresses: sorted
    });
  } catch (error: any) {
    console.error("Address lookup error:", error);
    res.status(500).json({ error: "Internal server error performing address lookup." });
  }
}
