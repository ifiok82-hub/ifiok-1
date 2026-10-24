export type SearchableListing = { title: string; cat: string };

export function filterListings<T extends SearchableListing>(listings: readonly T[], search: string, category: string): T[] {
  const query = search.trim().toLocaleLowerCase();
  return listings.filter((listing) =>
    (category === "All" || listing.cat === category) &&
    listing.title.toLocaleLowerCase().includes(query),
  );
}