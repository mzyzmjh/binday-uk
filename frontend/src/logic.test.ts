import { describe, it } from "node:test";
import assert from "node:assert";
import { mapCollectionsWithAliases } from "./firebase/firestoreService";
import { CollectionItem, BinAlias } from "./types";

describe("Frontend Core Business Logic", () => {
  it("should map bin aliases and hex colors accurately", () => {
    const rawCollections: CollectionItem[] = [
      { type: "Refuse", date: "2026-08-20" },
      { type: "Recycling", date: "2026-08-27" }
    ];

    const aliases: Record<string, BinAlias> = {
      "Refuse": { alias: "Black Bin (General Waste)", color: "#111827" },
      "Recycling": { alias: "Green Bin (Dry Mixed)", color: "#16a34a" }
    };

    const mapped = mapCollectionsWithAliases(rawCollections, aliases);
    
    assert.strictEqual(mapped.length, 2);
    assert.strictEqual(mapped[0].display_name, "Black Bin (General Waste)");
    assert.strictEqual(mapped[0].color, "#111827");
    assert.strictEqual(mapped[1].display_name, "Green Bin (Dry Mixed)");
    assert.strictEqual(mapped[1].color, "#16a34a");
  });
});
