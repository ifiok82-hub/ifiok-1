import { describe, expect, it } from "vitest";
import { filterListings } from "@/lib/marketplace-filters";

const listings = [
  { title: "Fresh Groceries Bundle", cat: "Groceries" },
  { title: "Wireless Bluetooth TWS Headset", cat: "Electronics" },
  { title: "Home Electrical Installation Service", cat: "Services" },
];

describe("marketplace search and category filters", () => {
  it("searches product titles without case sensitivity and ignores surrounding whitespace", () => {
    expect(filterListings(listings, "  BLUETOOTH  ", "All")).toEqual([listings[1]]);
  });
  it("limits results to the selected category", () => {
    expect(filterListings(listings, "", "Groceries")).toEqual([listings[0]]);
  });
  it("combines search and category instead of matching either", () => {
    expect(filterListings(listings, "Bluetooth", "Groceries")).toEqual([]);
  });
  it("returns all available listings when both controls are cleared", () => {
    expect(filterListings(listings, "", "All")).toEqual(listings);
  });
  it("returns no results for an unmatched search or an empty catalogue", () => {
    expect(filterListings(listings, "rice", "All")).toEqual([]);
    expect(filterListings([], "", "All")).toEqual([]);
  });
});