/**
 * Filings. Every fact here is taken from the project's README, its live site,
 * or its shipped UI. Nothing is estimated. If a number isn't in a source, it isn't here.
 */

export type Img = { src: string; alt: string; w: number; h: number };

/** A numbered callout placed on a figure, in % of the image box. */
export type Callout = { n: number; x: number; y: number; label: string };

export type Figure =
  | { kind: "image"; img: Img; caption: string; callouts?: Callout[] }
  | { kind: "drawing"; drawing: "atlas-crates" | "accounic-arch" | "ved-sheet"; caption: string }
  | { kind: "code"; lang: string; title: string; code: string; caption: string };

export type Decision = { title: string; body: string; code?: { lang: string; code: string } };

export type Filing = {
  slug: string;
  no: number;
  title: string;
  short: string;
  field: string;
  year: string;
  role: string;
  status: string;
  stack: string[];
  links: { label: string; href: string }[];
  plate?: Img;
  facts: { value: string; label: string }[];
  abstract: string;
  background: string;
  figures: Figure[];
  decisions: Decision[];
  claims: string[];
};

const ATLAS_RUN = `$ sb analyze
Snowbros Atlas · analyze
  root: /work/acme-web
  files scanned: 512
  cache: 0 reused, 512 parsed
  frameworks: Next.js 15.1.0, React 19.0.0

HIGH Server-only module imported by a client component [next/server-only-in-client]
  at src/components/Dashboard.tsx · confidence: certain
    - import chain: Dashboard.tsx → lib/metrics.ts → lib/db.ts ("server-only")

✗ 1 finding(s): 1 High
◆ health: 92/100 (security 100, architecture 85, …)`;

const ATLAS_FIX = `$ sb fix --dry-run
○ would apply 2 fix(es):
  package.json remove unused dependency "left-pad" [deps/unused-dependency]
  .env remove unused variable OLD_API_URL [env/unused-env-var]`;

const ACCOUNIC_MODEL = `total_credit           = Σ credit transactions       (not void)
total_debit            = Σ debit transactions        (not void)
settled_in             = Σ settlements direction in  (not void)
settled_out            = Σ settlements direction out (not void)

outstanding_receivable = total_credit - settled_in
outstanding_payable    = total_debit  - settled_out
net_balance            = outstanding_receivable - outstanding_payable`;

const SWIFTDROP_PATH = `phone  -- up to 6 parallel HTTP requests over Wi-Fi -->  PC  -->  disk

sender                            receiver
  read a 1 MiB block
  hash it (xxh64)       ---->       verify the digest
                                    write it in place to .part
                        <----       204, and mark the block in a bitmap
                                    (bitmap saved every second)`;

const SWIFTDROP_BENCH = `MB/s, engine to server    before    after
1,000 × 10 KB               66.5    110.7
10,000 × 50 KB             232.3    313.5`;

const AMR_QUEUE = `-- src/batchdock/queue.py, claim() (trimmed)
update docking.jobs j set status = 'RUNNING', worker_id = %(w)s,
       attempt_count = j.attempt_count + 1, heartbeat_at = now(),
       lease_expires_at = now() + make_interval(secs => %(lease)s)
 where j.id in (
   select q.id from docking.jobs q
     join docking.runs r on r.run_id = q.run_id and r.status = 'RUNNING'
    where q.status = 'QUEUED'
      and (q.not_before is null or q.not_before <= now())
    order by q.priority, q.id
    limit %(n)s
    for update of q skip locked)`;

export const FILINGS: Filing[] = [
  {
    slug: "snowbros-atlas",
    no: 100,
    title: "Snowbros Atlas",
    short: "A deterministic static-analysis engine for JavaScript, TypeScript and Python, written in Rust.",
    field: "Developer tools",
    year: "2026",
    role: "Author. Built under SNOWBROS.",
    status: "v0.4, open source. Published to npm, crates.io, Homebrew and the VS Code Marketplace, with x64 and arm64 binaries for three platforms.",
    stack: ["Rust", "Tree-sitter", "petgraph", "LSP", "VS Code API", "SARIF"],
    links: [
      { label: "Repository", href: "https://github.com/snowbros-labs/atlas" },
      { label: "Case study", href: "https://snowbros.me/#case-atlas" },
    ],
    plate: { src: "/work/atlas-site.webp", alt: "An Atlas HTML report: health 93 overall, 66 architecture, above findings for a server-only module reachable from a client component and a circular import chain.", w: 1440, h: 900 },
    facts: [
      { value: "23", label: "built-in rules" },
      { value: "~230 ms", label: "cold run on axios, 431 files" },
      { value: "~34 ms", label: "after a one-file change, 500-file repo" },
      { value: "340+", label: "tests across a 19-crate Rust workspace" },
    ],
    abstract:
      "Atlas maps a whole project, every import, export, env var and framework boundary, and reports only the problems it can prove. Same codebase in, same findings out, every time.",
    background:
      "Per-file linters see one file at a time. The expensive bugs live between files: a circular import that survives for years, a server-only module that leaks into a client bundle, a dependency nobody uses anymore. Atlas is built for that layer. It runs alongside ESLint or Biome, not instead of them.",
    figures: [
      { kind: "code", lang: "text", title: "sb analyze", code: ATLAS_RUN, caption: "A run from the README. The finding names the rule, the confidence, and the import chain that proves it." },
      { kind: "drawing", drawing: "atlas-crates", caption: "Crate architecture. Dependencies flow one way, from a shared vocabulary up to the CLI and the language server." },
      {
        kind: "image",
        img: { src: "/work/atlas-report.webp", alt: "Snowbros Atlas HTML report: health scores followed by six findings with evidence.", w: 1240, h: 2000 },
        caption: "sb analyze --format html writes a self-contained report: a health scorecard, then every finding with its evidence.",
        callouts: [
          { n: 102, x: 30, y: 16, label: "Health scorecard by category" },
          { n: 104, x: 52, y: 41, label: "Finding with rule id and confidence" },
          { n: 106, x: 44, y: 48.6, label: "Import chain as evidence" },
          { n: 108, x: 30, y: 61, label: "Cycle members, listed" },
        ],
      },
    ],
    decisions: [
      {
        title: "One IR for every language",
        body: "A 19-crate Rust workspace, about 17k lines, parses with Tree-sitter and lowers JavaScript, TypeScript and Python into one shared semantic IR. A rule is either language-agnostic or scoped to a language family in one place, never an if-language branch inside a detector. The same large-function rule runs on a Next.js app and on FastAPI.",
      },
      {
        title: "Evidence or silence",
        body: "Every finding carries the chain that produced it and a confidence level: certain, likely or possible. Anything the resolver cannot prove is reported as unresolved. It is never guessed.",
      },
      {
        title: "A cache that cannot change the answer",
        body: "An incremental cache keyed on xxh3 hashes, file times and a config fingerprint lets a warm run skip work. Tests prove the warm output is byte-identical to a cold run, so the cache can only save time.",
      },
      {
        title: "Fixes that refuse to guess",
        body: "sb fix plans byte-span edits first, then applies them only if the file still matches what the analysis saw. A file that changed in between is skipped, not clobbered. Fixes are idempotent.",
        code: { lang: "text", code: ATLAS_FIX },
      },
      {
        title: "Wherever the developer already is",
        body: "One binary installs as snowbros and sb: analyze, watch, fix, graph, model, explain. sb lsp serves diagnostics to any LSP editor, a TypeScript VS Code extension wraps it, and SARIF 2.1.0 output feeds GitHub code scanning behind a --ci gate. Five CI workflows release it to npm, crates.io, Homebrew and x64/arm64 binaries for three platforms.",
      },
    ],
    claims: [
      "A static analyzer whose findings are a pure function of the code and its configuration.",
      "The analyzer of claim 1, wherein each finding carries the import chain or cycle members that prove it.",
      "The analyzer of claim 1, wherein a warm cached run produces output byte-identical to a cold run.",
      "The analyzer of claim 1, wherein JavaScript, TypeScript and Python share one semantic IR and one set of language-neutral rules.",
      "The analyzer of claim 2, further comprising an auto-fix step that skips any file changed since analysis.",
    ],
  },
  {
    slug: "accounic",
    no: 200,
    title: "Accounic",
    short: "A multi-currency personal ledger. Three clients, one database, and the database does the maths.",
    field: "Finance, cross-platform",
    year: "2026",
    role: "Sole developer.",
    status: "v1.16.1. Windows installer, portable zip, Android APK and a web client.",
    stack: ["Next.js 15", "React 19", "Flutter 3.29", "Riverpod", "PostgreSQL", "Supabase", "Tailwind v4"],
    links: [{ label: "Repository", href: "https://github.com/VED2107/accounic" }],
    plate: { src: "/work/accounic-dash.webp", alt: "Accounic web dashboard: net position, receivable, payable and settled totals, and cash in hand per currency.", w: 1440, h: 900 },
    facts: [
      { value: "3", label: "clients on one schema: web, Android, Windows" },
      { value: "4", label: "CI workflows: web, Flutter, SQL, demo" },
      { value: "82×", label: "faster dashboard at 20,000 entries, 98 s to 1.2 s" },
      { value: "0", label: "floats in the money path" },
    ],
    abstract:
      "Accounic answers four questions and little else: who do I have an account with, how much do they owe me, how much do I owe them, and what has been settled. It runs on the web, Android and Windows from one Supabase schema.",
    background:
      "Money lent between friends, family and small businesses lives in notebooks and chat threads. Currencies mix, partial repayments pile up, and nobody agrees on the balance. Accounic makes the balance a fact the database computes, instead of a number each app adds up for itself.",
    figures: [
      { kind: "drawing", drawing: "accounic-arch", caption: "One PostgreSQL schema owns balances, validated writes and tenant isolation. Three clients read it with the user's JWT." },
      { kind: "code", lang: "text", title: "The accounting model", code: ACCOUNIC_MODEL, caption: "From the README. net_balance above zero means they owe you; below zero, you owe them." },
      {
        kind: "image",
        img: { src: "/work/accounic-dash.webp", alt: "Accounic web dashboard with net position, receivable, payable, settled, and cash in hand split by currency.", w: 1440, h: 900 },
        caption: "The web client's dashboard. Every figure on it is read from the database's views; the page adds nothing up.",
        callouts: [
          { n: 220, x: 33, y: 23, label: "Net position, computed in the database" },
          { n: 222, x: 88, y: 24, label: "Lent less borrowed, last 30 days" },
          { n: 224, x: 60, y: 48, label: "Receivable, payable, settled" },
          { n: 226, x: 29, y: 76, label: "Cash in hand in INR, as entered" },
          { n: 228, x: 29, y: 90, label: "The same, in AED, never re-priced" },
        ],
      },
      {
        kind: "image",
        img: { src: "/work/accounic-activity.webp", alt: "Accounic activity journal: credit, debit and settled totals for 30 days, then entries grouped by day.", w: 1440, h: 900 },
        caption: "The activity journal, day by day. Settlements sit beside the credits they close; neither edits the other.",
      },
      {
        kind: "image",
        img: { src: "/work/accounic-people.webp", alt: "Accounic people list with one account's name redacted, showing a receivable balance and an account that is up to date.", w: 1440, h: 900 },
        caption: "People, each with their own balance. A real counterparty's name is redacted here; it is their data, not mine.",
      },
    ],
    decisions: [
      {
        title: "The database computes every balance",
        body: "No client adds up a column. Balances come from views (person_balances, owner_summary) and every write goes through validated RPCs. money.ts and money.dart only format and parse, and they are mirrored line for line.",
      },
      {
        title: "Integer minor units, per currency",
        body: "₹100.50 is stored as 10050. How many minor units make a major one is a property of the currency: the yen has none, the Kuwaiti dinar has three. There is no float anywhere in the money path.",
      },
      {
        title: "Entries keep the currency they were entered in",
        body: "An amount in another currency is converted at the door, and the row keeps what was actually handed over: the original amount, its currency, the rate, when it was taken and where it came from. A later rate move never touches a recorded transaction. Live rates come from open.er-api.com with the ECB, via Frankfurter, behind it.",
      },
      {
        title: "Settlements never edit history",
        body: "A settlement records money that actually moved and reduces the outstanding side. It never edits or deletes the original transaction. Each transaction's settled or open status is allocated first in, first out, with targeted settlements taking priority.",
      },
      {
        title: "Isolation the client never decides",
        body: "Row-level security is forced on every table and the anon role holds no EXECUTE in public. The demo build is the same binary with one dart-define; a profiles.is_demo flag only changes what the interface offers, never what an account may read.",
      },
      {
        title: "A dashboard that holds at 20,000 entries",
        body: "A benchmark workspace of 20,230 transactions, 50 accounts and 5 currencies took the dashboard 98 seconds: the per-currency breakdown called the FIFO allocator once per entry, each call walking that person's whole ledger. Moving the call to once per person cut it from 98,235 ms to 1,201 ms, 82× faster, and the breakdown test still matches byte for byte.",
      },
      {
        title: "Releases a person approves",
        body: "CI builds a release on a tag and leaves it as a draft. Installed apps check GitHub Releases on launch and only offer published builds. v1.16.1 fixed an updater that could pick the demo installer, because GitHub lists assets alphabetically and the check took the first .exe it saw.",
      },
    ],
    claims: [
      "A ledger in which every balance is computed by the database and no client adds up a column.",
      "The ledger of claim 1, wherein amounts are integer minor units whose scale is a property of the currency.",
      "The ledger of claim 2, wherein each entry keeps its original currency, rate and rate source, and later rate changes never alter it.",
      "The ledger of claim 1, wherein one schema serves a web client, an Android client and a Windows client through the same validated RPCs.",
      "The ledger of claim 4, wherein installed clients only ever offer a release a person has published.",
    ],
  },
  {
    slug: "vinnys-atelier",
    no: 300,
    title: "Vinny's Atelier",
    short: "The retail operating system a working fashion boutique runs its counter on.",
    field: "Retail, point of sale",
    year: "2026",
    role: "Sole developer. Client deployment through SNOWBROS.",
    status: "In daily use at Vinny's Fashion Hub since August 2026, on the web and as a signed Windows app.",
    stack: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Drizzle ORM", "Supabase", "Tauri 2", "Rust", "SQLite", "Razorpay", "Vitest", "Playwright"],
    links: [{ label: "Public storefront", href: "https://atelier.vinnysvogue.in" }],
    plate: { src: "/work/atelier.webp", alt: "Vinny's Atelier till: a new invoice with three garments, a 10% discount and Razorpay dynamic QR selected.", w: 1920, h: 1200 },
    facts: [
      { value: "35", label: "PostgreSQL tables, Drizzle migrations, RLS" },
      { value: "268", label: "Vitest tests, plus Playwright end to end in CI" },
      { value: "1", label: "authority that can settle an invoice: a signed webhook" },
      { value: "0", label: "payment secrets on the till" },
    ],
    abstract:
      "A keyboard-first till that takes garments from the catalogue on a keystroke, applies line and invoice discounts, settles to cash, the shop's UPI QR or a Razorpay dynamic QR, and prints a PDF or a thermal receipt. Behind it: variant-level inventory, customer profiles, staff roles and revenue reporting derived from settled bills.",
    background:
      "A boutique counter is a busy, interrupted place, and its internet is not always there. Staff need to bill fast, take UPI without mistakes, and trust the stock count at the end of the day. The shop runs two rails under one name, occasion and bridal wear at the boutique and everyday pieces at the Fashion Hub, and needed one system that fits both.",
    figures: [
      {
        kind: "image",
        img: { src: "/work/atelier.webp", alt: "The Atelier till with a draft invoice.", w: 1920, h: 1200 },
        caption: "The till. Every action has a key; the command palette reaches the rest.",
        callouts: [
          { n: 302, x: 51.5, y: 3, label: "Command palette, ⌘K" },
          { n: 304, x: 36, y: 47, label: "Line items with per-line discount" },
          { n: 306, x: 87, y: 26.8, label: "Invoice discount" },
          { n: 308, x: 86, y: 57, label: "Razorpay dynamic QR for the exact amount" },
          { n: 310, x: 58, y: 88, label: "Keyboard actions: new, hold, recent bills" },
        ],
      },
      {
        kind: "image",
        img: { src: "/work/atelier-reports.webp", alt: "Atelier trade reports screen.", w: 1920, h: 1200 },
        caption: "Reports, derived from settled bills and net of discounts.",
      },
      {
        kind: "image",
        img: { src: "/work/atelier-inventory.webp", alt: "Atelier inventory screen with variant-level stock.", w: 1920, h: 1200 },
        caption: "Variant-level inventory. Counts come from the same rows the till deducts against.",
      },
    ],
    decisions: [
      {
        title: "Keyboard first",
        body: "⌘K opens the command palette, ⌘N starts an invoice, ⌘F adds an item, H holds a bill, ⌘B shows recent bills and ⌘P prints. A cashier can bill a customer without touching the mouse.",
      },
      {
        title: "Only the webhook can say a bill is paid",
        body: "Razorpay UPI is integrated end to end: QR checkout for the exact net amount, then status, cancel and reconciliation APIs. An HMAC-verified webhook is the sole authority that can settle an invoice, so the point of sale never holds a payment secret and cannot mark a bill paid on its own.",
      },
      {
        title: "A till that keeps selling offline",
        body: "The Tauri desktop till records sales to local SQLite through rusqlite and queues them in a durable outbox. A background sync engine pushes and pulls in both directions and resolves conflicts, so the counter keeps working when the connection doesn't.",
      },
      {
        title: "One guard for every action",
        body: "A 35-table PostgreSQL schema with Drizzle migrations and row-level security policies in the database, plus a single server-side guard that every Server Action passes through. Authorization never lives in the UI layer.",
      },
      {
        title: "Money is integer paise",
        body: "Amounts are a Money type in integer paise from the database to the receipt, so no float ever touches a rupee and discounts never drift by a paisa.",
      },
      {
        title: "Tested like it handles money",
        body: "268 Vitest tests and a Playwright end-to-end suite run in CI on every push, and the same codebase ships to the web and as a signed Windows build.",
      },
    ],
    claims: [
      "A point-of-sale system in which every amount is an integer number of paise.",
      "The system of claim 1, wherein an invoice can be settled only by an HMAC-verified webhook from the payment provider.",
      "The system of claim 1, wherein the desktop till records sales to local SQLite and syncs them through a durable outbox.",
      "The system of claim 1, wherein every Server Action passes one server-side authorization guard, backed by row-level security.",
      "The system of claim 1, delivered as a web app and as a signed Windows app from one codebase.",
    ],
  },
  {
    slug: "vinnys-vogue",
    no: 400,
    title: "Vinny's Vogue",
    short: "Online store for Indian bridal and festive couture.",
    field: "E-commerce",
    year: "2026",
    role: "Sole developer.",
    status: "Live at vinnysvogue.in.",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS"],
    links: [
      { label: "Live store", href: "https://www.vinnysvogue.in" },
      { label: "Repository", href: "https://github.com/VED2107/vinnys-vogue" },
    ],
    plate: { src: "/work/vogue-home.webp", alt: "Vinny's Vogue storefront: 'Where Fashion Meets Elegance'.", w: 1440, h: 900 },
    facts: [
      { value: "7", label: "collections by occasion, bridal to stock clearing" },
      { value: "RLS", label: "role-based access enforced in Postgres" },
    ],
    abstract:
      "A production storefront with catalogue, cart, checkout and order tracking, run from a role-based admin dashboard by the boutique itself.",
    background:
      "A family boutique selling bridal and festive wear needed to sell online without losing the feel of the shop. Customers shop by occasion, not by category, and the owners wanted to run products and orders themselves.",
    figures: [
      {
        kind: "image",
        img: { src: "/work/vogue-home.webp", alt: "Vinny's Vogue home page.", w: 1440, h: 900 },
        caption: "The storefront.",
      },
      {
        kind: "image",
        img: { src: "/work/vogue-scroll.webp", alt: "Collections by occasion and the Festive Grace collection.", w: 1440, h: 900 },
        caption: "Collections by occasion: bridal, festive, haldi, reception, mehendi, sangeet.",
      },
    ],
    decisions: [
      {
        title: "Shop by occasion",
        body: "The catalogue is organised the way a wedding is: bridal, festive, haldi, reception, mehendi ceremony and sangeet, plus a stock-clearing rail. Navigation follows the event, not the garment type.",
      },
      {
        title: "Stock that holds under concurrent checkout",
        body: "Cart changes run as single atomic database operations and inventory is tracked through checkout, so two customers buying the last piece at once can't both succeed.",
      },
      {
        title: "Roles in the database",
        body: "Customers and admins are separated by Supabase row-level security, not only by what the UI hides. Order tracking, product management and checkout all sit behind the same policies.",
      },
      {
        title: "An admin the owners actually use",
        body: "The dashboard covers products, orders, abandoned carts, reviews and analytics such as revenue and orders by status, with weekly sales exports, so the shop runs without a developer in the loop.",
      },
    ],
    claims: [
      "A storefront whose catalogue is organised by occasion.",
      "The storefront of claim 1, wherein cart changes are single atomic database operations.",
      "The storefront of claim 1, wherein roles are enforced by row-level security in the database.",
    ],
  },
  {
    slug: "stc-academy",
    no: 500,
    title: "STC Academy",
    short: "An academy platform for CBSE and GSEB students, from primary to JEE and NEET.",
    field: "Education",
    year: "2026",
    role: "Sole developer, system architect.",
    status: "Live at stc.vercel.app.",
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS"],
    links: [
      { label: "Live site", href: "https://stc.vercel.app" },
      { label: "Repository", href: "https://github.com/VED2107/STC" },
    ],
    plate: { src: "/work/stc-home.webp", alt: "STC Academy home page: 'Cultivating the Intellect of Tomorrow.'", w: 1440, h: 900 },
    facts: [
      { value: "100+", label: "students, teachers and staff on it" },
      { value: "2", label: "boards, CBSE and GSEB, plus JEE and NEET tracks" },
    ],
    abstract:
      "A public site for admissions and curriculum, and an admin command center that runs the institute: students, teachers, subjects, attendance, QR codes, syllabus, reports and audit logs.",
    background:
      "A tuition academy in Gujarat teaching two boards and two competitive exams ran on paper logs and spreadsheets. It needed one place where parents understand what is offered, and one place where staff run the day.",
    figures: [
      { kind: "image", img: { src: "/work/stc-home.webp", alt: "STC Academy home page.", w: 1440, h: 900 }, caption: "The public site." },
      { kind: "image", img: { src: "/work/stc-scroll.webp", alt: "STC Academy academic pathways: primary and middle departments.", w: 1440, h: 900 }, caption: "Academic pathways, from primary upward." },
    ],
    decisions: [
      {
        title: "Two pathways, one catalogue",
        body: "Board-aligned coursework and competitive-exam tracks live in one course system, filterable by academic level, so a parent can find the right batch in a few clicks.",
      },
      {
        title: "An admin command center",
        body: "Staff manage students, teachers, subjects, academic structures, attendance, syllabus, assets and reports from one dashboard, with QR code generation and a scanner module.",
      },
      {
        title: "Privacy and tallies in the database",
        body: "A normalized relational schema where database triggers keep attendance tallies up to date and row-level security enforces per-student privacy at the data layer. Students, teachers and administrators each get a role-restricted dashboard over secured API routes.",
      },
    ],
    claims: [
      "An academy platform in which board coursework and competitive-exam preparation share one course system.",
      "The platform of claim 1, further comprising an admin dashboard with attendance, QR codes and audit logs.",
    ],
  },
  {
    slug: "swiftdrop",
    no: 600,
    title: "SwiftDrop",
    short: "Photos, videos and files straight between phones and a PC over your own Wi-Fi. No cloud, no cable, no account.",
    field: "Networking, cross-platform",
    year: "2026",
    role: "Sole developer. Built under SNOWBROS.",
    status: "v1.1.0 for Windows and Android. iPhone joins by QR, no app needed.",
    stack: ["TypeScript", "Node.js", "React", "Flutter", "Dart", "Vitest", "Playwright"],
    links: [
      { label: "Website", href: "https://swiftdrop.snowbros.me" },
      { label: "Repository", href: "https://github.com/VED2107/swiftdrop" },
    ],
    plate: { src: "/work/swiftdrop-site.webp", alt: "The SwiftDrop website: 'Send anything. Directly.' beside a transfer console showing 32.0 MB/s from an iPhone to a PC.", w: 1440, h: 900 },
    facts: [
      { value: "232 → 314", label: "MB/s, 10,000 × 50 KB files, loopback" },
      { value: "66 → 111", label: "MB/s, 1,000 × 10 KB files, loopback" },
      { value: "1 MiB", label: "blocks, each hashed and verified on arrival" },
      { value: "0", label: "bytes through the internet" },
    ],
    abstract:
      "The PC is the endpoint. Phones send in parallel, resumable chunks over the local network, every block is verified on arrival, and an interrupted transfer resumes where it stopped instead of starting again.",
    background:
      "Moving a phone's videos to a PC usually means a cable, a cloud upload or a messaging app that recompresses everything. On the same Wi-Fi the bytes only need to cross the room. SwiftDrop moves them there, at the speed of the network rather than the speed of an upload.",
    figures: [
      {
        kind: "image",
        img: { src: "/work/swiftdrop-site.webp", alt: "The SwiftDrop website with a transfer console: 32.0 MB/s, iPhone to PC.", w: 1440, h: 900 },
        caption: "The SwiftDrop website. The console is the product's own transfer readout, from phone to PC.",
        callouts: [
          { n: 602, x: 30, y: 27, label: "One line: what it does" },
          { n: 604, x: 57, y: 28, label: "Live throughput readout" },
          { n: 606, x: 25, y: 54, label: "Windows installer and Android APK" },
        ],
      },
      { kind: "code", lang: "text", title: "The data path", code: SWIFTDROP_PATH, caption: "From the architecture record. Every 1 MiB block carries its xxh64 digest; the receiver checks it before the write lands." },
      { kind: "code", lang: "text", title: "Loopback benchmark: contiguous batch frames", code: SWIFTDROP_BENCH, caption: "Two processes, as in real use. Loopback is the software ceiling, not Wi-Fi: on a real network the radio is the limit." },
    ],
    decisions: [
      {
        title: "Why not WebRTC",
        body: "Safari's DataChannel tops out far below Wi-Fi speed, burns CPU, and can only save received data from an in-memory Blob, which dies on multi-gigabyte videos. Plain HTTP to the PC gets kernel congestion control, six parallel connections and positional writes straight to disk.",
      },
      {
        title: "Measure first, then change one thing",
        body: "A benchmark that ran sender and receiver in one Node process was measuring its own shared event loop. Splitting them into two processes, as in real use, is the rule now: every change is kept only if it wins beyond a ±5% noise band, with the JSON results committed.",
      },
      {
        title: "Small files were the hard case",
        body: "Many small files were serialized behind a naming lock and sent as multi-part bodies that arrived five times slower in Node. Atomic name reservation and one readdir per folder instead of one stat per file fixed the disk side; sending each batch as one contiguous buffer alone took 10,000 × 50 KB from 232 to 314 MB/s.",
      },
      {
        title: "Resume, never restart",
        body: "Receive state is a bitmap of verified blocks, persisted every second. A dropped connection or a restarted receiver resends only the missing blocks, and a file changed on disk after it was picked is refused rather than sent stale.",
      },
      {
        title: "One engine, ported to native",
        body: "The transfer engine was ported to a pure-Dart core that the Flutter Android and Windows apps share, kept byte-compatible with the TypeScript engine through shared test vectors for digests, bitmaps and batch frames.",
      },
    ],
    claims: [
      "A file transfer in which every 1 MiB block is verified on arrival and a damaged block is sent again.",
      "The transfer of claim 1, wherein an interrupted transfer resumes from a bitmap of verified blocks.",
      "The transfer of claim 1, wherein no byte leaves the local network.",
      "The transfer of claim 1, wherein the TypeScript and Dart engines are held byte-compatible by shared test vectors.",
    ],
  },
  {
    slug: "amr-drug-repurposing",
    no: 700,
    title: "AMR Drug Repurposing",
    short: "Screening 1,761 approved medicines against four drug-resistant bacteria, with every result tied to its evidence.",
    field: "Scientific computing",
    year: "2026",
    role: "Led the software with Yash Prajapati. Client project through SNOWBROS.",
    status: "Research prototype, live. Predictions for the lab, not clinical evidence. Recognised with a Letter of Appreciation from Ganpat University's pharmacy college.",
    stack: ["Python", "RDKit", "scikit-learn", "AutoDock Vina", "PostgreSQL", "Supabase", "Docker", "Next.js"],
    links: [
      { label: "Live site", href: "https://amr-drug-repurposing.vercel.app" },
      { label: "Repository", href: "https://github.com/VED2107/amr-drug-repurposing" },
    ],
    plate: { src: "/work/amr-site.webp", alt: "The AMR Drug Repurposing overview: 'Old medicines, new questions.' beside the molecular dataset and the 1,761-medicine library.", w: 1440, h: 900 },
    facts: [
      { value: "7,044", label: "docking jobs: 1,761 medicines × 4 targets" },
      { value: "4", label: "drug-resistant bacteria, one protein target each" },
      { value: "1,761", label: "medicines checked against ClinicalTrials.gov" },
      { value: "0", label: "results called a cure" },
    ],
    abstract:
      "Repurposing asks whether a medicine already approved for something else could act against a drug-resistant superbug. This system ingests real bioactivity and regulatory data, ranks candidates with models, checks molecular fit by docking, and shows what clinical history already exists for each one.",
    background:
      "Antimicrobial resistance outpaces new antibiotic discovery. An approved medicine already has known pharmacology and human safety data, so a credible lead from the existing library shortens the road to the lab. The engineering problem is to run the screen at full scale and to never let a prediction read like a proof.",
    figures: [
      {
        kind: "image",
        img: { src: "/work/amr-site.webp", alt: "AMR Drug Repurposing overview with the 20K-structure dataset and the 1,761-medicine library.", w: 1440, h: 900 },
        caption: "The live overview. Every count on it is read from the database and carries its source.",
        callouts: [
          { n: 702, x: 30, y: 21, label: "The question, in plain words" },
          { n: 704, x: 58, y: 19, label: "Dataset with ChEMBL provenance" },
          { n: 706, x: 80, y: 57, label: "1,761 medicines checked" },
        ],
      },
      { kind: "code", lang: "text", title: "The docking queue", code: AMR_QUEUE, caption: "From src/batchdock/queue.py. Any number of workers on any number of machines, and no two ever claim the same job." },
    ],
    decisions: [
      {
        title: "A queue that can't double-book",
        body: "Every (medicine, target, configuration) is one row in a Postgres queue. Workers claim with FOR UPDATE SKIP LOCKED, hold a lease that a heartbeat extends, and complete in one statement that only succeeds if they still hold it. A result can't be written twice, and a vanished worker's job returns to the queue.",
      },
      {
        title: "Inputs prepared once, checked everywhere",
        body: "1,761 ligand files and 4 receptor files are prepared once and stored with their SHA-256. A worker on any machine fetches what it lacks and refuses a file whose checksum differs, so every docking run starts from identical inputs.",
      },
      {
        title: "Leakage is a critical failure",
        body: "Scaffold-aware splits keep similar molecules out of both training and test. An audit found enantiomer pairs straddling the split because scaffolds carried stereochemistry; scaffolds are now stereo-free, and leakage across splits is a critical check that fails the pipeline.",
      },
      {
        title: "A percentage always says what it means",
        body: "A probability is shown only for the four modelled pathogens, and labels that imply clinical benefit raise an error in code. The interface keeps 'no evidence found', 'not yet checked' and 'no effect' apart, and a registered trial is never presented as a successful one.",
      },
    ],
    claims: [
      "A screening system in which every docking score is a recorded AutoDock Vina run with its inputs, configuration and command.",
      "The system of claim 1, wherein a Postgres queue with leases guarantees each job is completed at most once.",
      "The system of claim 1, wherein no prediction is presented as evidence that a medicine treats an infection.",
    ],
  },
  {
    slug: "nova",
    no: 900,
    title: "NOVA",
    short: "A calm, honest media player for Windows, now on Android. No account, no telemetry, works offline.",
    field: "Desktop media",
    year: "2026",
    role: "Author. Built under SNOWBROS.",
    status: "v0.3.0 for Windows x64, tested on Windows 11. Android 8+ as a pre-release that updates itself.",
    stack: ["Rust", "Tauri 2", "React 19", "TypeScript", "Tailwind CSS 4", "libmpv", "SQLite", "Expo"],
    links: [
      { label: "Website", href: "https://nova.snowbros.me" },
      { label: "Repository", href: "https://github.com/VED2107/nova" },
    ],
    plate: { src: "/work/nova-player.webp", alt: "NOVA playing Tears of Steel with subtitles: H.264, 1280×534, hardware decoding, with the timeline and control deck below.", w: 960, h: 600 },
    facts: [
      { value: "55/55", label: "compatibility samples play, in software and hardware decoding" },
      { value: "100 ms", label: "exact seeking, measured in the test harness" },
      { value: "0", label: "accounts, telemetry or network needed" },
    ],
    abstract:
      "NOVA plays local video like a professional tool would, ProRes, DNxHR, HDR and 8K included, and remembers where you were even after a crash. The interface only ever shows what the playback engine confirms.",
    background:
      "Desktop players either look modern and fake their state, or tell the truth and look like 2005. NOVA puts native video from libmpv under a transparent React interface in a Tauri shell, with the rules of playback kept in plain Rust crates that know nothing about the engine.",
    figures: [
      {
        kind: "image",
        img: { src: "/work/nova-player.webp", alt: "NOVA's player showing Tears of Steel with subtitles and the control deck.", w: 960, h: 600 },
        caption: "The player. The title bar reports what libmpv decoded: H.264, 1280×534, hardware decoding. Tears of Steel © Blender Foundation, CC BY 3.0.",
      },
      {
        kind: "image",
        img: { src: "/work/nova-home.webp", alt: "NOVA's Home in Daylight: Continue with Tears of Steel and a Resume button, Recently added, and Your shelf.", w: 960, h: 600 },
        caption: "Home in the Daylight theme. Continue picks up where you stopped, even after a crash or a renamed file.",
      },
    ],
    decisions: [
      {
        title: "Engine-confirmed state only",
        body: "The UI shows what libmpv reports, never what it hopes happened. A queue only advances when the engine confirms the end of the media.",
      },
      {
        title: "Native video under a web interface",
        body: "libmpv renders through D3D11 with hardware decoding and a software fallback; the React interface sits transparently on top in a Tauri 2 window.",
      },
      {
        title: "Resume that survives crashes and renames",
        body: "Progress lives in local SQLite and is tied to the media's identity, so a moved or renamed file keeps its place across restarts and crashes, with a Start over option.",
      },
      {
        title: "A contract the engine can't leak through",
        body: "Playback is a backend-neutral API and a pure state reducer with no engine dependencies; libmpv is one backend behind it, loaded at runtime.",
      },
      {
        title: "Licensing stated plainly",
        body: "The code is MIT or Apache-2.0. The first installer bundles a libmpv build with GPL parts, so the installer ships under the GPL with its source; later releases move to an LGPL engine built from source.",
      },
    ],
    claims: [
      "Every limitation is listed before anyone asks: Windows x64 tested on one Windows 11 machine, Android still a pre-release.",
      "Exact seeking within 100 ms, measured on 55 synthetic samples, once in software and once with hardware decoding.",
      "Updates only ever install signed releases.",
    ],
  },
  {
    slug: "ved-exe",
    no: 800,
    title: "VED.EXE",
    short: "This site. A plain, fast portfolio where every number traces back to a repository or a live product.",
    field: "Interface",
    year: "2026",
    role: "Designer and developer.",
    status: "Live. You're reading it.",
    stack: ["Next.js 16", "React 19", "TypeScript", "View Transitions API", "GitHub GraphQL API"],
    links: [{ label: "Repository", href: "https://github.com/VED2107/portfolio" }],
    facts: [
      { value: "1", label: "typeface, two weights doing the work" },
      { value: "⌘K", label: "reaches every page, project and link" },
    ],
    abstract:
      "The work is the interface. Each project leads with a real screenshot and the one number that proves it, then a case study for anyone who wants the engineering.",
    background:
      "Earlier versions were a retro arcade, a patent filing and a record shop. Each was fun to build and each put a costume between a visitor and the work. This one takes the costume off.",
    figures: [],
    decisions: [
      {
        title: "Show the working thing first",
        body: "Every project opens on its own screenshot, from the product itself, never a mockup. The number beside it comes from the project's README or its live site.",
      },
      {
        title: "Content first, motion second",
        body: "Every page is complete HTML before any script runs. Entrances are opacity and a short rise, staggered, and with reduced motion they are simply absent.",
      },
      {
        title: "Live, with a fallback",
        body: "GitHub activity is fetched on the server and revalidated hourly. If the API is slow or down, the section falls back to a committed snapshot instead of an empty box.",
      },
      {
        title: "Keyboard complete",
        body: "⌘K or / opens a command menu that reaches every section, project, link and the theme. It opens instantly, because something used this often should not animate.",
      },
    ],
    claims: [
      "Every number on the site is traceable to a repository or a live product.",
      "Every page can be reached from the keyboard.",
      "No testimonial was invented.",
    ],
  },
];

export type ArchiveItem = {
  title: string;
  field: string;
  stack: string;
  year: string;
  href: string;
  preview?: Img;
};

export const ARCHIVE: ArchiveItem[] = [
  {
    title: "SNOWBROS",
    field: "Studio site",
    stack: "Vite, TypeScript, canvas, GSAP",
    year: "2026",
    href: "https://snowbros.me",
    preview: { src: "/work/snowbros-home.webp", alt: "The SNOWBROS studio site: the name formed from frost crystals above the headline 'Software that holds its shape.'", w: 1440, h: 900 },
  },
  {
    title: "Lunora Studio",
    field: "E-commerce, handmade bouquets",
    stack: "Next.js, Supabase, GSAP, shadcn/ui",
    year: "2026",
    href: "https://lunorastudio.vercel.app",
    preview: { src: "/work/lunora-home.webp", alt: "Lunora Studio: 'Flowers Fade. Memories Don't.'", w: 1440, h: 900 },
  },
  {
    title: "Mentor",
    field: "AI orchestration skill, MIT",
    stack: "Claude Code, routes work across ten capability modules",
    year: "2026",
    href: "https://github.com/snowbros-labs/mentor-skill",
  },
  {
    title: "Creative Engineering",
    field: "AI skill and TypeScript motion toolkit",
    stack: "TypeScript, scroll choreography, interactive 3D",
    year: "2026",
    href: "https://github.com/snowbros-labs/creative-engineering",
  },
  {
    title: "Cipher Clash",
    field: "Realtime multiplayer game",
    stack: "Expo, Supabase Realtime, Zustand, Turborepo",
    year: "2026",
    href: "https://github.com/VED2107/guesser",
  },
  {
    title: "Filmica",
    field: "Camera app with shader effects",
    stack: "Flutter, Dart, GLSL, Supabase, Firebase",
    year: "2026",
    href: "https://github.com/VED2107/filmica",
  },
];

export function getFiling(slug: string) {
  return FILINGS.find((f) => f.slug === slug);
}

export function filingTitle(slug: string) {
  return getFiling(slug)?.title ?? slug;
}

export function filingNo(slug: string) {
  return getFiling(slug)?.no ?? 0;
}

/**
 * The home page's selected work, in order, each led by the one number that proves it.
 * The number is one of the filing's own facts; nothing here is new.
 */
export const FEATURED: { slug: string; proof: number }[] = [
  { slug: "vinnys-atelier", proof: 1 },
  { slug: "accounic", proof: 2 },
  { slug: "amr-drug-repurposing", proof: 0 },
  { slug: "snowbros-atlas", proof: 1 },
  { slug: "swiftdrop", proof: 0 },
  { slug: "nova", proof: 0 },
];

/** Smaller client builds shown as a pair under the featured work. */
export const ALSO = ["vinnys-vogue", "stc-academy"];

/** The case-study reading order: featured first, then the rest. */
export const ORDER = [...FEATURED.map((f) => f.slug), ...ALSO, "ved-exe"];

/** How many projects each technology shipped on, counted from their stacks. */
export function equipment() {
  const count = new Map<string, number>();
  const norm = (s: string) => s.replace(/\s+\d[\d.]*$/, "").replace(/^Tailwind( CSS)?$/, "Tailwind CSS").trim();
  for (const f of FILINGS) for (const s of f.stack) count.set(norm(s), (count.get(norm(s)) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* ------------------------------------------------------------------ pressing */

/**
 * How each project is pressed: sleeve colour, the ink printed on it, the centre label, and the
 * line etched in the run-out groove. Packaging only; no new facts.
 */
export type Pressing = { cat: string; sleeve: string; ink: string; label: string; labelInk: string; runout: string };

export const PRESSING: Record<string, Pressing> = {
  "vinnys-atelier": { cat: "VED 300", sleeve: "#c9a46a", ink: "#1c140b", label: "#f6efe2", labelInk: "#1c140b", runout: "only the webhook says paid" },
  accounic: { cat: "VED 200", sleeve: "#dfe6d6", ink: "#0f3d2a", label: "#16865c", labelInk: "#f2fbf6", runout: "zero floats in the money path" },
  "amr-drug-repurposing": { cat: "VED 700", sleeve: "#e7efee", ink: "#0b3f45", label: "#127c86", labelInk: "#effafb", runout: "a prediction, not a cure" },
  "snowbros-atlas": { cat: "VED 100", sleeve: "#1f6f6a", ink: "#f3ead8", label: "#e3a72f", labelInk: "#1d1712", runout: "same code in, same findings out" },
  swiftdrop: { cat: "VED 600", sleeve: "#d8392b", ink: "#fff4ec", label: "#16130f", labelInk: "#ffb4a8", runout: "resume, never restart" },
  nova: { cat: "VED 900", sleeve: "#0f1115", ink: "#e9ecf2", label: "#e9ecf2", labelInk: "#0f1115", runout: "only what the engine confirms" },
  "vinnys-vogue": { cat: "VED 400", sleeve: "#5b1328", ink: "#f6e6dd", label: "#a3355f", labelInk: "#fff0f5", runout: "one lehenga left, two buyers" },
  "stc-academy": { cat: "VED 500", sleeve: "#14213d", ink: "#efe6cf", label: "#efe6cf", labelInk: "#14213d", runout: "two boards, one catalogue" },
  "ved-exe": { cat: "VED 800", sleeve: "#1d1712", ink: "#f3ead8", label: "#9b2316", labelInk: "#f3ead8", runout: "the work is the interface" },
};

/** Side A takes the first half of the decisions, side B the rest, like a real LP. */
export function trackNo(i: number, total: number) {
  const half = Math.ceil(total / 2);
  return i < half ? `A${i + 1}` : `B${i - half + 1}`;
}

/** Liner credits: each tool, how many records it played on, and which ones. */
export function credits(limit = 16) {
  const norm = (s: string) => s.replace(/\s+\d[\d.]*$/, "").replace(/^Tailwind( CSS)?$/, "Tailwind CSS").trim();
  const map = new Map<string, string[]>();
  for (const f of FILINGS) {
    if (f.slug === "ved-exe") continue;
    for (const s of new Set(f.stack.map(norm))) map.set(s, [...(map.get(s) ?? []), f.title]);
  }
  return [...map.entries()]
    .map(([name, records]) => ({ name, count: records.length, records }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
