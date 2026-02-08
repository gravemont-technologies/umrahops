# Recommended Upgrades (recom.md)

<!-- used: Push to 9/10 Upgrade, First-Principles Elevation, Gap Closure Strategy -->

## Strategic Feature Upgrades

### 1. NUSUK RPA Robustness (Vitality: 8.0)
- **Primary Fix**: Implement dynamic selector recovery for `nusuk_rpa_local.ts`.
- **Secondary Fixes**:
  - Add "Headless" mode toggle in UI.
  - Implement screenshot capture on RPA failure for debugging.
- **Estimate**: Med (8h). Risk: Low.
- **SLO Change**: 90% automation success on stable portal versions.

### 2. WhatsApp Notification UI (Vitality: 7.5)
- **Primary Fix**: Add "Send Confirmation" button to `GroupDetail.tsx` traveler rows.
- **Secondary Fixes**:
  - Implement message templates editor.
  - Hook into `messageService.ts` for automated status updates.
- **Estimate**: Lo (4h). Risk: Low.
- **SLO Change**: < 5s for link generation.

### 3. Comprehensive Test Suite (Vitality: 9.5)
- **Primary Fix**: Add integration tests for `storage.ts` covering edge cases.
- **Secondary Fixes**:
  - Add Playwright E2E tests for the "Happy Path" (Create -> Import -> Scan).
  - Implement CI check for AI Mock fallbacks.
- **Estimate**: Med (12h). Risk: Very Low.

## Phase Plan

### Phase A: Surgical Patches (Execution Time: 4h)
- [ ] Fix `message-wa` UI visibility in `GroupDetail.tsx`.
- [ ] Implement "Verify Chain" button in `AuditLogs.tsx`.
- [ ] Finalize `hotels-mgt` stub page.

### Phase B: Stability & Tests (Execution Time: 12h)
- [ ] 80% coverage for `server/storage.ts`.
- [ ] Playwright E2E happy path.
- [ ] NUSUK RPA error reporting refinement.

### Phase C: Scale & UX (Execution Time: 8h)
- [ ] Supabase production migration.
- [ ] Dark mode refinements.
- [ ] Advanced AI risk modeling.
