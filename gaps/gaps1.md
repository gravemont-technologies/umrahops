# UmrahOS Feature Audit & Gap Analysis

> [!NOTE]
> **Executive Summary**: UmrahOS core operational features (Groups, Travelers, Risk Scan) are 85%+ complete. Integration with NUSUK (RPA) and Messaging (WhatsApp) is functional at the backend level but requires UI surfacing and field validation. App is on the verge of MVP-ready (82/100).

## Feature ID CSV (Machine Readable)
feature_id,page,name,completion,vitality,priority
dash-stats,dashboard,Dashboard Stats,87,9.0,10.2
groups-crud,groups,Groups Management,100,9.5,9.5
travelers-crud,group-detail,Travelers CRUD,87,9.5,10.7
risk-scan,group-detail,AI Risk Scan,87,8.5,9.6
nusuk-rpa,jobs,NUSUK RPA Sync,62,8.0,11.0
message-wa,group-detail,WhatsApp Notify,37,7.5,12.2
audit-logs,audit,Security Audit,87,7.0,7.9
hotel-copy,group-detail,Hotel Draft Msg,87,6.5,7.3
objectives-todo,dashboard,Executive TODOs,87,7.0,7.9
hotels-mgt,settings,Hotels CRUD,37,5.5,Deprioritized
bookings-mgt,group-detail,Bookings Mgt,25,5.0,Deprioritized

| Feature ID | Page/Tab | Short Name | Owner (file path) | Functionality Summary | Completion % | Vitality | Metrics used | Missing / Gaps | SLO / Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `dash-stats` | Dashboard | Dashboard Stats | `Dashboard.tsx` | High-level summary of active groups/jobs. | 87 | 9.0 | U:90, C:100, F:80, R:90, Co:80 | 5 | Data persists to SQLite; updates on page load. |
| `groups-crud` | Dashboard/Groups | Groups Management | `GroupsList.tsx` | Create, view, and delete Umrah groups. | 100 | 9.5 | U:100, C:100, F:100, R:100, Co:90 | - | CRUD operations persist; 100% success on valid JSON. |
| `travelers-crud` | Group Detail | Travelers CRUD | `GroupDetail.tsx`, `CsvUploader.tsx` | Bulk import and manage pilgrims. | 87 | 9.5 | U:100, C:100, F:95, R:90, Co:85 | 5 | CSV import handles 1k+ rows; manual add works. |
| `risk-scan` | Group Detail | AI Risk Scan | `aiService.ts` | PII-safe AI assessment of traveler risk. | 87 | 8.5 | U:80, C:90, F:70, R:90, Co:80 | 5 | Returns deterministic mock or OpenAI scores. |
| `nusuk-rpa` | Jobs Queue | NUSUK RPA Sync | `nusuk_rpa_local.ts` | Automates visa status checks via Playwright. | 62 | 8.0 | U:90, C:90, F:80, R:50, Co:60 | 5, 7, 8 | RPA script executes locally; browser state persists. |
| `message-wa` | Group Detail | WhatsApp Notify | `messageService.ts` | Send WhatsApp notifications via link/API. | 37 | 7.5 | U:70, C:70, F:80, R:80, Co:70 | 1, 4, 5, 6, 7 | Messages trigger local WhatsApp redirect. |
| `audit-logs` | Audit Logs | Security Audit | `AuditLogs.tsx`, `storage.ts` | Immutable, hashed activity logs. | 87 | 7.0 | U:40, C:60, F:20, R:100, Co:90 | 5 | Chain verification succeeds on all logs. |
| `hotel-copy` | Group Detail | Hotel Draft Msg | `GroupDetail.tsx` | One-click copy for hotel availability inquiry. | 87 | 6.5 | U:60, C:50, F:70, R:90, Co:95 | 5 | Clipboard contains correct traveler count/msg. |
| `objectives-todo` | Dashboard | Executive TODOs | `ObjectivesPanel.tsx` | Priority tasks/checklists for operators. | 87 | 7.0 | U:60, C:70, F:80, R:90, Co:90 | 5 | Todos persist across sessions. |

### Gap Item Reference
1. UI implemented and matches specification.
2. API endpoint exists and returns correct shape.
3. Persistence hooked up and durable.
4. Error states handled and surfaced.
5. Tests exist (unit/integration).
6. End-to-end happy path works locally.
7. Accessibility/basic UX checks.
8. Instrumentation/logging/SLO hooks.

## Top 5 Technical Risks
1. **Secret Leak (CRITICAL)**: `.env` contains raw API keys and DB credentials. 
   - *Mitigation*: Add `.env` to `.gitignore` (if not already) and rotate keys immediately. Use Vercel Secrets in production.
2. **Selector Fragility (High)**: `nusuk_rpa_local.ts` relies on brittle hardcoded CSS selectors for the NUSUK portal.
   - *Mitigation*: Implement robust multi-strategy selector logic and automated daily health checks.
3. **PWA Offline State (Med)**: App lacks offline sync for traveler data during field ops.
   - *Mitigation*: Implement Service Worker caching and background sync for state updates.
4. **Data Integrity (Med)**: Audit chain verification is implemented in backend but opaque to users.
   - *Mitigation*: Exposed "Verify Chain" button to Audit UI (Action 2 in recom.md).
5. **PII Handling (Low)**: While AI-safe, local storage might contain unencrypted PII.
   - *Mitigation*: Enable SQLCipher encryption for SQLite (env: `SQLITE_ENCRYPTION_KEY`).

## Secret Leak Remediation Checklist
- [ ] Move secrets to environment manager (Azure/Vercel/Supabase Vault).
- [ ] Add `.env` to `.gitignore`.
- [ ] Rotate `OPENAI_API_KEY`.
- [ ] Rotate `DATABASE_URL` credentials.
- [ ] Regenerate `SESSION_SECRET`.

