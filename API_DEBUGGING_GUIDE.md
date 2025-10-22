# API Integration Debugging Guide

**Phase 2 Enhancement** - Added debugging features to verify API integration

---

## Quick Visual Indicators

### 1. API Status Badge (In Header)

The app now displays a status indicator next to the title showing the current data source:

| Indicator | Status | Meaning |
|-----------|--------|---------|
| 🟢 **Live API** | Green | Connected to RentCast API, showing real data |
| 🟡 **Mock Data** | Yellow | Using mock data (API key not configured) |
| 🟠 **Partial API** | Orange | Some API calls succeeded, others failed |
| 🔴 **API Error** | Red | API request failed, showing fallback data |

**How to check**: Look at the header next to "Housing Market Data" title

---

## Console Logging

### Enhanced Logging Features

The app now includes color-coded, structured console logging to track:
- API configuration status
- Each API call attempt
- Success/failure of requests
- Data source for market information

### How to View Console Logs

1. **Open Browser DevTools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K`
   - Safari: Enable Developer Menu first, then `Cmd+Option+C`

2. **Navigate to Console tab**

3. **Look for colored log messages**:

#### Example Log Output (Mock Data Mode):
```
[useMarketData] API Configuration Check { configured: false }
[useMarketData] Using MOCK DATA - API key not configured in .env file
[useMarketData] Generated mock markets {
  count: 5,
  markets: ["Detroit, MI", "Anaheim, CA", "Austin, TX", "Miami, FL", "Seattle, WA"]
}
```

#### Example Log Output (Live API Mode):
```
[useMarketData] API Configuration Check { configured: true }
[useMarketData] Attempting to fetch REAL API data
[API] Fetching market stats {
  location: "Detroit",
  params: { city: "Detroit" },
  endpoint: "/markets/statistics"
}
[API] ✓ Success { location: "Detroit", data: {...} }
...
[useMarketData] API Response Summary {
  requested: 5,
  received: 5,
  markets: [...]
}
[useMarketData] ✓ Successfully loaded REAL API data
```

#### Example Log Output (API Error):
```
[useMarketData] Attempting to fetch REAL API data
[API] Fetching market stats { location: "Detroit", ... }
[API] ✗ Failed { location: "Detroit", error: APIError {...} }
[useMarketData] No valid API data - Falling back to MOCK DATA
```

---

## Network Tab Verification

### How to Check API Calls in Network Tab

1. **Open DevTools → Network tab**

2. **Filter by XHR/Fetch** (shows API calls only)

3. **Reload the page**

#### What to Look For:

**With Mock Data** (API key not configured):
- ✅ **NO requests** to `api.rentcast.io`
- Page loads instantly (no API delays)

**With Live API** (API key configured):
- ✅ **Multiple requests** to `api.rentcast.io/v1/markets/statistics`
- Each request shows parameters (city/zipCode)
- Status codes:
  - `200 OK` = Success
  - `401 Unauthorized` = Invalid API key
  - `429 Too Many Requests` = Rate limit exceeded

---

## Testing Scenarios

### Scenario 1: Verify Mock Data Mode (No API Key)

**Setup**:
1. Ensure `.env` has: `VITE_RENTCAST_API_KEY=your_api_key_here`
2. Restart dev server: `npm run dev`

**Expected Behavior**:
- ✅ Header shows 🟡 **Mock Data**
- ✅ Console shows: `[useMarketData] Using MOCK DATA`
- ✅ Network tab shows NO requests to `api.rentcast.io`
- ✅ Markets display instantly
- ✅ Prices match mock values ($225k, $875k, $550k, $625k, $825k)

---

### Scenario 2: Test with Real API Key

**Setup**:
1. Sign up at https://www.rentcast.io/api (free tier)
2. Update `.env`: `VITE_RENTCAST_API_KEY=<your_actual_key>`
3. **IMPORTANT**: Restart dev server (Vite must reload .env)
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

**Expected Behavior**:
- ✅ Header shows 🟢 **Live API** (if successful) or 🔴 **API Error** (if failed)
- ✅ Console shows: `[useMarketData] Attempting to fetch REAL API data`
- ✅ Console shows: `[API] Fetching market stats` for each market
- ✅ Network tab shows requests to `api.rentcast.io`
- ✅ If successful:
  - Console shows: `[API] ✓ Success` with data
  - Prices may differ from mock values (real market data)
- ✅ If failed:
  - Console shows: `[API] ✗ Failed` with error details
  - Header shows 🔴 **API Error**
  - App falls back to mock data gracefully

---

### Scenario 3: Test Rate Limiting

**Setup**:
1. Make many API calls quickly (search multiple markets)
2. RentCast free tier: 50 calls/month

**Expected Behavior**:
- After hitting rate limit:
  - ✅ Console shows: `API rate limit exceeded`
  - ✅ Header shows 🔴 **API Error**
  - ✅ Yellow warning banner appears
  - ✅ App continues working with cached/mock data

---

### Scenario 4: Test Search Functionality

**With Mock Data**:
1. Type "Detroit" in search box
2. Console should show search filtering mock data
3. Dropdown shows matching mock markets

**With Live API**:
1. Type "Detroit" in search box
2. Console shows: `[API] Fetching` with search query
3. Network tab shows request to `/properties` endpoint
4. Dropdown shows results from API

---

## Troubleshooting

### Issue: Status shows Mock Data despite having API key

**Possible Causes**:
1. ❌ `.env` file not saved
2. ❌ Dev server not restarted after changing `.env`
3. ❌ API key value still contains `your_api_key_here`
4. ❌ Typo in `.env` variable name (must be exactly `VITE_RENTCAST_API_KEY`)

**Solution**:
1. Check `.env` file content
2. Restart dev server: Stop (`Ctrl+C`) → `npm run dev`
3. Check console for configuration status

---

### Issue: Status shows API Error

**Possible Causes**:
1. ❌ Invalid API key
2. ❌ Rate limit exceeded
3. ❌ Network connectivity issues
4. ❌ RentCast API down

**Solution**:
1. Check console for specific error message
2. Verify API key at RentCast dashboard
3. Check Network tab for HTTP status code:
   - `401` = Invalid API key
   - `429` = Rate limit (wait or upgrade plan)
   - `500/502/503` = API server issue
4. App automatically falls back to mock data

---

### Issue: Prices don't match expected values

**This is NORMAL behavior**:
- Mock data: Predefined prices ($225k, $875k, etc.)
- Live API: Real market prices (will differ)
- Prices from RentCast reflect actual market conditions

**To Verify Data Source**:
1. Check status indicator in header
2. Check console logs
3. If showing 🟢 **Live API**, prices are real

---

## Advanced Debugging

### Custom API Test Script

Add this to browser console to manually test API:

```javascript
// Test API configuration
const apiKey = import.meta.env.VITE_RENTCAST_API_KEY;
console.log('API Key configured:', apiKey !== 'your_api_key_here');

// Manual API test
fetch('https://api.rentcast.io/v1/markets/statistics?city=Detroit', {
  headers: { 'X-Api-Key': apiKey }
})
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

### Enable Verbose Logging

All API-related logs are already enabled. To filter:

1. In Console tab, use filter: `[useMarketData]` or `[API]`
2. To see only errors: Click "Errors" filter button
3. To see timestamps: Enable in Console settings

---

## Performance Metrics

### Expected Load Times

**Mock Data Mode**:
- Initial load: < 100ms
- No network requests
- Instant UI updates

**Live API Mode** (depends on RentCast API):
- Initial load: 500ms - 2s (5 parallel API calls)
- Each search: 200ms - 500ms
- Cached in browser session

### API Usage Tracking

Free Tier Limits (RentCast):
- **50 API calls/month**

Current App Usage:
- Initial load: 5 calls (one per featured market)
- Each search: 1 call
- **Total for typical session**: 5-10 calls

**Tip**: Monitor usage in RentCast dashboard to avoid hitting limits

---

## Summary Checklist

Before testing, verify:
- [ ] `.env` file exists in `housing-data-poc/` directory
- [ ] `VITE_RENTCAST_API_KEY` variable is set
- [ ] Dev server was restarted after changing `.env`
- [ ] Browser DevTools Console tab is open
- [ ] Browser DevTools Network tab is open (optional)

During testing, look for:
- [ ] Status indicator in header (🟢 🟡 🟠 or 🔴)
- [ ] Console log messages with data source info
- [ ] Network requests (if API configured)
- [ ] Graceful fallback behavior on errors

---

**Last Updated**: 2025-10-19 (Phase 2 Debugging Enhancement)
