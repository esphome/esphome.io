// Which items of the link-in-bio page's lists are showing at a given moment.
// Shared by the build (src/lib/bio.ts) and the script on the page
// (src/pages/bio.astro), so both apply the same rule. No imports here: this
// file also runs in the browser.
//
// The page is static, so the build can only get the lists right for the
// moment it runs. It also renders, hidden, every item that might show
// later: anything still to start, and anything that would take the place of
// an item that ends. The script runs this rule again with the website's time
// (from the server, not the visitor's clock) and shows or hides items to
// match. Without JavaScript, or if the time can't be read, the page stays as
// it was built.

// An item is open from `starts` (inclusive) until `ends` (exclusive). Either
// can be missing. Values are Dates, ISO strings or milliseconds.
export function isOpen(item, now) {
  const time = (value) => (value === undefined || value === null || value === "" ? null : new Date(value).getTime());
  const starts = time(item.starts);
  const ends = time(item.ends);
  const at = new Date(now).getTime();
  return (starts === null || starts <= at) && (ends === null || ends > at);
}

// Returns, for each of `lists`, the keys of its entries showing at `now`, in
// order. Each list has `entries` (in display order), a `limit` (none means
// every entry) and `claims` (true for Latest, whose links each show only
// once). Each entry has `key` and `url`, and optionally `rank`, `starts`,
// `ends` and `variant`.
//
// A link that several entries share goes to the one with the highest `rank`
// that is up (an item added by hand, then a blog post), and between equals
// to the earlier list, then the earlier entry. So an item added by hand that
// links to a blog post shows instead of the post only while it is up.
export function select(lists, now) {
  const candidates = lists.map((list) => list.entries.filter((entry) => isOpen(entry, now)));

  const owners = new Map();
  candidates.forEach((entries, list) => {
    if (!lists[list].claims) return;
    for (const entry of entries) {
      const rank = entry.rank ?? 0;
      const owner = owners.get(entry.url);
      if (!owner || rank > owner.rank) owners.set(entry.url, { rank, list, key: entry.key });
    }
  });

  return candidates.map((entries, list) => {
    const limit = lists[list].limit ?? Infinity;
    const keys = [];
    for (const entry of entries) {
      if (keys.length >= limit) break;
      // A hero and a row version of the same item share a key.
      if (keys.includes(entry.key)) continue;
      const owner = owners.get(entry.url);
      if (lists[list].claims && (owner.list !== list || owner.key !== entry.key)) continue;
      keys.push(entry.key);
    }
    return keys;
  });
}

// Whether one rendered entry is showing. Latest puts its first item in a
// large card, so an item that might end up first is rendered twice: a `hero`
// version, shown only in first place, and a `row` version, shown anywhere
// else. Entries without a variant show wherever they land.
export function isShowing(entry, keys) {
  const position = keys.indexOf(entry.key);
  if (position === -1) return false;
  if (entry.variant === "hero") return position === 0;
  if (entry.variant === "row") return position > 0;
  return true;
}
