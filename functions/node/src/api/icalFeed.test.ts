import { describe, it } from "node:test";
import assert from "node:assert";
import { generateIcalString, IcalEventData } from "./icalFeed";

describe("iCal Feed Generator", () => {
  it("should generate RFC 5545 compliant .ics with VALARM tags", () => {
    const events: IcalEventData[] = [
      {
        uid: "test-uid-1@binday.app",
        summary: "Bin Day: General Waste (Black Bin)",
        description: "Scheduled General Waste collection for 1 Church Street.",
        dateStr: "2026-08-15",
        valarmTrigger: "-PT17H"
      },
      {
        uid: "test-uid-2@binday.app",
        summary: "Bin Day: Dry Recycling (Blue Bin)",
        description: "Scheduled Recycling collection for 1 Church Street.",
        dateStr: "2026-08-22",
        valarmTrigger: "-PT17H"
      }
    ];

    const ics = generateIcalString("Bin Collections - LS26 8XX", events);

    assert.ok(ics.includes("BEGIN:VCALENDAR"));
    assert.ok(ics.includes("VERSION:2.0"));
    assert.ok(ics.includes("X-WR-CALNAME:Bin Collections - LS26 8XX"));
    assert.ok(ics.includes("BEGIN:VEVENT"));
    assert.ok(ics.includes("SUMMARY:Bin Day: General Waste (Black Bin)"));
    assert.ok(ics.includes("DTSTART;VALUE=DATE:20260815"));
    assert.ok(ics.includes("BEGIN:VALARM"));
    assert.ok(ics.includes("TRIGGER:-PT17H"));
    assert.ok(ics.includes("END:VALARM"));
    assert.ok(ics.includes("END:VCALENDAR"));
  });
});
