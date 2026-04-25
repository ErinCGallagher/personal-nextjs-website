# Elasticsearch Engineering Review

## 1. What problem are you trying to solve?

The travel blog has no search functionality. Readers browsing MDX posts have no way to find content by keyword, topic, or tag other than scrolling manually. As the post count grows, discoverability becomes a real problem.

This project also serves an explicit learning goal: building hands-on familiarity with Elasticsearch fundamentals (indexing, querying, aggregations, relevance tuning) in a real-world context.

---

## 2. What is your solution?

Integrate Elasticsearch as a dedicated search layer alongside the existing Express/PostgreSQL backend. The implementation is split into two phases:

**Phase 1 — Full-text blog search**
- Index all published MDX posts into Elasticsearch
- Expose a search API with relevance tuning, typo tolerance, and result highlighting
- Add an autocomplete suggestions endpoint
- Build a search page and SearchBar component on the frontend

**Phase 2 — Tag analytics & faceted navigation**
- Aggregate tag counts across all indexed posts
- Allow filtering by one or more tags (AND logic)
- Render a tag cloud and a filter sidebar on the blog

PostgreSQL remains the source of truth for all transactional data. Elasticsearch is a read-only query layer that can be rebuilt at any time from the MDX filesystem.

---

## 3. Architecture

```
MDX Posts (filesystem)
    │
    ▼
backend/src/scripts/index-blog-posts.ts
    │  (reads frontmatter + strips MDX to plain text)
    ▼
Elasticsearch index: blog_posts
    │
    ▼
backend/src/routes/search.ts
    │  (Express API — search, suggest, tag aggregations)
    ▼
Next.js frontend (via existing /api proxy rewrite)
    │
    ▼
frontend/app/search/page.tsx
frontend/app/components/blog/SearchBar.tsx
frontend/app/components/blog/SearchResults.tsx
```

**Environments:**

| Environment | Elasticsearch |
|---|---|
| Local dev | Docker (Elasticsearch 8.x + Kibana on ports 9200/5601) |
| Production | Elastic Cloud free tier |

**Sync strategy:** Manual reindex script (`pnpm elastic:reindex`). The index is rebuilt from source MDX files on demand. No real-time sync is needed at this scale (16 posts).

**Data flow rule:** The frontend never calls the Elasticsearch or backend APIs directly — all traffic goes through the existing Next.js `/api` proxy rewrite to avoid cross-domain cookie issues.

---

## 4. Models

### Elasticsearch Index: `blog_posts`

```json
{
  "slug": "yellowstone-winter-wildlife-guide",
  "title": "Yellowstone Winter Wildlife Guide",
  "summary": "Complete guide to...",
  "content": "Full MDX content as plain text",
  "author": "Erin Gallagher",
  "publishedAt": "2024-01-15T00:00:00Z",
  "tags": ["National Parks", "Wildlife"],
  "featured": true,
  "readingTime": 12,
  "image": "/images/yellowstone.jpg",
  "suggest": {
    "input": ["Yellowstone Winter Wildlife Guide", "National Parks", "Wildlife"]
  }
}
```

### Mapping Strategy

| Field | Type | Notes |
|---|---|---|
| `slug` | `keyword` | Exact match; used as document ID |
| `title` | `text` + `keyword` subfield | `keyword` subfield enables boosting on exact match |
| `summary` | `text` (English analyser) | Stemming + stopwords |
| `content` | `text` (English analyser) | Stemming + stopwords |
| `author` | `keyword` | Not searched; not analysed |
| `publishedAt` | `date` | Supports date-range queries and sorting |
| `tags` | `keyword` | Used in term aggregations and bool filter clauses |
| `featured` | `boolean` | Can be used in function score queries |
| `readingTime` | `integer` | Available for sorting |
| `image` | `keyword`, `index: false` | Not searched; stored only |
| `suggest` | `completion` | Powers autocomplete suggester |

---

## 5. Endpoints

### Search

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search` | None | Full-text search across posts |
| `GET` | `/api/search/suggest` | None | Autocomplete suggestions |
| `GET` | `/api/tags/aggregations` | None | Tag counts across all posts |

#### `GET /api/search`

Query params:

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | Search query (required) |
| `limit` | integer | 10 | Max results (max 50) |
| `tags[]` | string[] | — | Filter by tags (AND logic) |
| `sortBy` | `relevance` \| `date` | `relevance` | Sort order |

Response:

```json
{
  "query": "yellowstone",
  "filters": { "tags": [] },
  "total": 3,
  "results": [
    {
      "slug": "yellowstone-winter-wildlife-guide",
      "title": "Yellowstone Winter Wildlife Guide",
      "summary": "...",
      "tags": ["National Parks"],
      "publishedAt": "2024-01-15T00:00:00Z",
      "score": 4.23,
      "highlights": {
        "title": ["<mark>Yellowstone</mark> Winter Wildlife Guide"],
        "content": ["...visiting <mark>Yellowstone</mark> in winter..."]
      }
    }
  ]
}
```

**Relevance tuning:**
- `multi_match` across `title` (boost ×3), `summary` (boost ×2), `content` (boost ×1)
- `fuzziness: "AUTO"` for typo tolerance
- `minimum_should_match: "75%"` to require most terms
- Highlights use `<mark>` tags; sanitised before rendering

#### `GET /api/search/suggest`

Query params: `q` (partial query string)

Response:

```json
{
  "query": "yell",
  "suggestions": [
    { "text": "Yellowstone Winter Wildlife Guide", "score": 1.0 }
  ]
}
```

Uses the Elasticsearch completion suggester on the `suggest` field.

#### `GET /api/tags/aggregations`

Response:

```json
{
  "total": 16,
  "tags": [
    { "name": "National Parks", "count": 7 },
    { "name": "Safari", "count": 5 }
  ]
}
```

Uses a terms aggregation on the `tags` keyword field, sorted by count descending, top 20 tags.

---

## 6. Technology List

| Layer | Technology | Notes |
|---|---|---|
| Search engine | Elasticsearch 8.x | Self-hosted via Docker (dev), Elastic Cloud (prod) |
| Kibana | Kibana 8.x | Dev tools for query experimentation and monitoring |
| Node.js client | `@elastic/elasticsearch` | Official client; singleton pattern in `backend/src/services/elasticsearch.ts` |
| Backend | Express.js (existing) | New routes added to existing app |
| Frontend | Next.js + TypeScript + Tailwind (existing) | New components + search page |
| Hosting (prod) | Elastic Cloud free tier | Managed, no self-hosting maintenance |
| Local infra | Docker Compose | Single-node Elasticsearch + Kibana |

---

## 7. Alternative Approaches Considered

### PostgreSQL Full-Text Search

**What it is:** Built-in `tsvector`/`tsquery` support in PostgreSQL, with GIN indices for performance.

**Pros:** No new infrastructure; ACID consistent; free; simple to implement in a few hours.

**Cons:** Limited relevance tuning; no built-in autocomplete; no aggregations; harder to scale horizontally.

**Why not chosen:** The primary goal of this project is *learning Elasticsearch*. PostgreSQL FTS would solve the search problem faster but teaches nothing new. It remains a valid fallback if Elasticsearch adds too much operational overhead long-term.

---

### Client-Side Search (Fuse.js / Lunr.js)

**What it is:** Load all post metadata into the browser and filter with JavaScript.

**Pros:** Zero backend infrastructure; instant results; works offline.

**Cons:** Only practical for very small datasets; no server-side aggregations; large initial payload; no highlighting.

**Why not chosen:** Dataset will grow; no aggregation support; doesn't teach transferable skills.

---

### Algolia

**What it is:** Hosted search-as-a-service with a generous free tier (10k searches/month).

**Pros:** Extremely fast; great developer experience; built-in analytics; no infrastructure management.

**Cons:** Proprietary and creates vendor lock-in; data leaves your servers; limited control over ranking; costs scale quickly.

**Why not chosen:** Vendor lock-in and reduced learning value. The goal is understanding search fundamentals, not delegating them.

---

### Typesense / Meilisearch

**What it is:** Open-source, self-hostable alternatives to Algolia. Simpler to configure than Elasticsearch.

**Pros:** Easy setup; good autocomplete; lower resource requirements; typo tolerance out of the box.

**Cons:** Smaller ecosystems; less sophisticated aggregations (especially Meilisearch); fewer transferable skills to enterprise environments.

**Why not chosen:** Elasticsearch is the industry standard and offers the most transferable knowledge. The additional setup complexity is worth it for the learning goals.

---

### Apache Solr

**What it is:** Mature search engine built on the same Lucene core as Elasticsearch.

**Pros:** Battle-tested; rich feature set.

**Cons:** Steeper learning curve; XML-heavy configuration; less modern API; smaller community than Elasticsearch.

**Why not chosen:** Elasticsearch has a better developer experience, more modern API, and a larger community. Solr would be chosen only in enterprise environments with existing Solr investment.
