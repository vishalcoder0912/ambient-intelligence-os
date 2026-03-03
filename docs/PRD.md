# Second Brain OS — Product Requirements Document

**Version**: 2.0  
**Date**: March 3, 2026  
**Classification**: Confidential — Internal / Investor Use  

---

## 1. Executive Summary

Second Brain OS is a **Personal Intelligence Platform** for developers — a unified command center that aggregates GitHub activity, productivity metrics, focus tracking, and AI-generated insights into a single ambient interface. Built with a privacy-first architecture, it transforms scattered developer workflows into actionable intelligence.

**Key Differentiators:**
- Multi-account GitHub integration with encrypted token storage
- AI-powered productivity analysis with burnout detection
- Focus session tracking with flow state analysis
- Enterprise-grade security with RLS-enforced data isolation

---

## 2. Vision & Philosophy

> "Your personal OS should think for you, not make you think."

Second Brain OS follows three core principles:

1. **Ambient Intelligence** — Insights surface automatically; no manual entry required
2. **Privacy by Architecture** — All tokens encrypted server-side; RLS enforces data isolation
3. **Developer-Native** — Built for developers, by developers — GitHub-first, keyboard-driven, minimal UI

---

## 3. Problem Statement

Developers context-switch between 5-10 tools daily. Commit history lives in GitHub, task progress in Linear, listening data in Spotify, focus tracking in separate apps. No tool connects these signals into a unified productivity picture.

**Pain Points:**
- No cross-platform productivity visibility
- Manual tracking creates friction
- Burnout goes undetected until too late
- Multiple GitHub accounts (personal + work) are impossible to unify

---

## 4. Target Users

| Persona | Description | Need |
|---------|-------------|------|
| **Solo Developer** | Indie hacker / freelancer | Track productivity across projects |
| **Staff Engineer** | Multiple org accounts | Unified view across work + personal GitHub |
| **Tech Lead** | Team oversight | Activity visibility, burnout detection |
| **Developer Advocate** | Content + code | Track contributions across accounts |

---

## 5. Feature Breakdown

### 5.1 Multi-Account GitHub Integration
- Connect unlimited GitHub accounts via Personal Access Token
- Account switcher with avatar display
- Per-account commit history sync
- Combined and per-account analytics views
- Encrypted token storage (XOR + base64, server-side only)

### 5.2 Repository Tracking
- CRUD tracked repositories
- Commit history storage (sha, message, author, timestamp)
- Repo stats: total commits, weekly streak, stars, open PRs, activity score
- Incremental sync (deduplication by commit SHA)

### 5.3 Focus Mode
- Start/stop focus sessions with timer
- Duration tracking with auto-calculation
- Daily session count and total minutes
- Session labeling

### 5.4 AI Intelligence Engine
- Weekly productivity report generation
- Peak performance hour detection
- Burnout risk assessment
- Flow state analysis
- Commit type classification (feature, bugfix, refactor, chore)
- Intelligence score calculation

### 5.5 Background Sync
- Per-account sync with logging
- Error tracking and retry
- Sync status indicator
- Cron-ready architecture (6-hour intervals)

### 5.6 Security & Audit
- Security events logging (account added, removed, token updated)
- RLS on all tables
- Role-based access (user, admin)
- Token validation on connect

---

## 6. User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a developer, I can connect multiple GitHub accounts so I see all my activity in one place | P0 |
| US-2 | As a developer, I can switch between GitHub accounts to view per-account activity | P0 |
| US-3 | As a developer, I can start a focus session and track my deep work time | P1 |
| US-4 | As a developer, I can generate AI insights about my weekly productivity | P1 |
| US-5 | As a developer, I can see my commit classification (features vs bugs vs refactors) | P1 |
| US-6 | As a developer, I receive burnout warnings when my commit patterns indicate overwork | P2 |
| US-7 | As a developer, I can see sync status and troubleshoot failed syncs | P2 |
| US-8 | As an admin, I can view security audit logs | P2 |

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Dashboard │  │ AI Intel │  │ Focus Tracker    │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
│  ┌────┴──────────────┴──────────────────┴─────────┐ │
│  │          Service Layer (src/lib/api/)           │ │
│  │  github.ts  │  internal.ts  │  retry logic     │ │
│  └────────────────────┬───────────────────────────┘ │
└───────────────────────┼─────────────────────────────┘
                        │ supabase.functions.invoke()
┌───────────────────────┼─────────────────────────────┐
│              Supabase Edge Functions                 │
│  ┌────────────────┐ ┌───────────────┐ ┌───────────┐│
│  │ github-activity │ │ github-sync   │ │ generate  ││
│  │                │ │               │ │ insights  ││
│  └────────────────┘ └───────────────┘ └───────────┘│
│  ┌────────────────────────────────────────────────┐ │
│  │        github-account-manage                   │ │
│  │  (add / remove / set_default accounts)         │ │
│  └────────────────────────────────────────────────┘ │
└───────────────────────┼─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│              Supabase Postgres + RLS                 │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐│
│  │ profiles │ │ github_accts │ │ tracked_repos    ││
│  │          │ │              │ │                  ││
│  └──────────┘ └──────────────┘ └──────────────────┘│
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐│
│  │ commits  │ │ repo_stats   │ │ focus_sessions   ││
│  └──────────┘ └──────────────┘ └──────────────────┘│
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐│
│  │insights  │ │ prod_metrics │ │ security_events  ││
│  └──────────┘ └──────────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 8. Database Design

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User metadata | user_id, display_name, avatar_url, bio, deleted_at |
| `github_accounts` | Multi-account storage | user_id, username, encrypted_token, is_default |
| `tracked_repos` | Repository tracking | user_id, github_account_id, repo_owner, repo_name |
| `repo_commits` | Commit history | tracked_repo_id, commit_sha, message, author |
| `repo_stats` | Aggregated stats | tracked_repo_id, total_commits, weekly_streak, stars |
| `focus_sessions` | Deep work tracking | user_id, duration_minutes, started_at, ended_at |
| `productivity_metrics` | Daily/weekly scores | user_id, daily_score, weekly_score, streak |
| `ai_insights` | Generated intelligence | user_id, title, content, insight_type, intelligence_score |
| `activity_logs` | Audit trail | user_id, action, entity_type, metadata |
| `security_events` | Security audit | user_id, event_type, entity_id, details |
| `github_sync_logs` | Sync tracking | github_account_id, status, error_message, duration_ms |
| `activity_vectors` | Cross-source weights | user_id, source, weight, recorded_at |
| `user_roles` | RBAC | user_id, role (admin/user) |

### Security Model
- All tables enforce RLS with `auth.uid() = user_id`
- Tokens encrypted before database storage
- Decryption only occurs in edge functions
- Admin operations gated by `has_role()` function

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| Dashboard load time | < 2s |
| API response time | < 500ms |
| Sync duration per account | < 30s |
| React Query stale time | 2 min |
| Refetch interval | 5 min |
| Max concurrent syncs | 20 accounts |

---

## 10. Roadmap

### Phase 1 — Foundation (Current) ✅
- [x] Multi-account GitHub integration
- [x] Encrypted token storage
- [x] Commit history sync
- [x] Focus session tracking
- [x] AI insight generation
- [x] Security events audit
- [x] Sync status monitoring

### Phase 2 — Intelligence (Next)
- [ ] Spotify OAuth integration
- [ ] Listening mood analysis
- [ ] Cross-source activity correlation
- [ ] Contribution heatmap visualization
- [ ] Language distribution charts
- [ ] Code churn estimation
- [ ] Goal alignment engine

### Phase 3 — Platform (Future)
- [ ] Team dashboards
- [ ] Webhook integrations (Linear, Notion)
- [ ] Custom AI model fine-tuning
- [ ] Mobile companion app
- [ ] API access for third-party integrations
- [ ] White-label enterprise offering

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GitHub API rate limiting | High | Medium | Exponential backoff, caching, incremental sync |
| Token compromise | Low | Critical | Server-side encryption, no frontend exposure |
| User data breach | Low | Critical | RLS enforcement, audit logging |
| Sync failures | Medium | Low | Retry logic, error logging, status indicators |
| Burnout false positives | Medium | Low | Configurable thresholds, user feedback loop |

---

## 12. Monetization Strategy

### Free Tier
- 1 GitHub account
- 5 tracked repos
- Basic insights (weekly report)
- 3 focus sessions/day

### Pro ($12/mo)
- Unlimited GitHub accounts
- Unlimited repos
- Full AI intelligence suite
- Unlimited focus sessions
- Priority sync (every 2 hours)
- Export data

### Teams ($25/user/mo)
- Everything in Pro
- Team productivity dashboards
- Cross-team insights
- Admin controls
- SSO integration
- SLA guarantee

---

## 13. KPIs

| Metric | Target (90 days) |
|--------|-----------------|
| WAU (Weekly Active Users) | 500 |
| Avg sessions per user/week | 4 |
| Pro conversion rate | 8% |
| Sync success rate | 99.5% |
| Insight generation rate | 3/user/week |
| NPS score | > 50 |

---

## 14. Future Expansion

- **AI Copilot**: Proactive suggestions based on activity patterns
- **Voice Interface**: "Hey Brain, what did I ship this week?"
- **Wearable Integration**: HRV + focus correlation
- **Knowledge Graph**: Connect commits → PRs → issues → decisions
- **Plugin System**: Community-built integrations

---

*Prepared for engineering review and investor presentation.*  
*Second Brain OS © 2026*
