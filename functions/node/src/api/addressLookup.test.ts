import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizePostcode,
  sortAddressesNumerically,
  NormalizedAddress
} from "./addressLookup";

describe("Address Lookup & Sorting Logic", () => {
  it("should normalize valid UK postcodes correctly", () => {
    assert.strictEqual(normalizePostcode("ls268xx"), "LS26 8XX");
    assert.strictEqual(normalizePostcode("m1 1aa"), "M1 1AA");
    assert.strictEqual(normalizePostcode("sw1a1aa"), "SW1A 1AA");
  });

  it("should strictly sort addresses numerically by house number", () => {
    const mockAddresses: NormalizedAddress[] = [
      {
        uprn: "100",
        buildingNumber: "24",
        postTown: "Leeds",
        postcode: "LS26 8XX",
        custodianCode: "4720",
        councilName: "Leeds City Council",
        singleLineAddress: "24, Church Street, Rothwell, Leeds, LS26 8XX"
      },
      {
        uprn: "101",
        buildingNumber: "2",
        postTown: "Leeds",
        postcode: "LS26 8XX",
        custodianCode: "4720",
        councilName: "Leeds City Council",
        singleLineAddress: "2, Church Street, Rothwell, Leeds, LS26 8XX"
      },
      {
        uprn: "102",
        buildingNumber: "10",
        postTown: "Leeds",
        postcode: "LS26 8XX",
        custodianCode: "4720",
        councilName: "Leeds City Council",
        singleLineAddress: "10, Church Street, Rothwell, Leeds, LS26 8XX"
      },
      {
        uprn: "103",
        buildingNumber: "1",
        postTown: "Leeds",
        postcode: "LS26 8XX",
        custodianCode: "4720",
        councilName: "Leeds City Council",
        singleLineAddress: "1, Church Street, Rothwell, Leeds, LS26 8XX"
      }
    ];

    const sorted = sortAddressesNumerically(mockAddresses);
    const sortedNumbers = sorted.map((a) => a.buildingNumber);
    assert.deepStrictEqual(sortedNumbers, ["1", "2", "10", "24"]);
  });
});
