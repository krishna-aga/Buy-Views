# Backend API Postman Test Guide

This file reflects the real routes and request bodies used in the current backend.

## 1. Start the backend

```bash
npm install
npm run dev
```

Or:

```bash
node server.js
```

Expected startup message:

```text
Server running on port 5000
```

## 2. Real endpoint test checklist

### Test 1 - Health check

```http
GET http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "Buy Views backend is running"
}
```

### Test 2 - Register creator

```http
POST http://localhost:5000/api/auth/register
```

Body:

```json
{
  "name": "Krishna Creator",
  "email": "creator@test.com",
  "password": "123456",
  "role": "creator"
}
```

Notes:
- Allowed roles are `creator` or `promoter`.
- Password must be at least 6 characters.

### Test 3 - Register promoter

```http
POST http://localhost:5000/api/auth/register
```

Body:

```json
{
  "name": "Krishna Promoter",
  "email": "promoter@test.com",
  "password": "123456",
  "role": "promoter"
}
```

Save the returned promoter JWT for later tests.

### Test 4 - Login

```http
POST http://localhost:5000/api/auth/login
```

Body:

```json
{
  "email": "creator@test.com",
  "password": "123456"
}
```

Save the returned JWT token for later tests.

### Test 5 - Get logged-in user

```http
GET http://localhost:5000/api/auth/me
```

Headers:

```http
Authorization: Bearer YOUR_TOKEN
```

Expected: your user object from the token.

### Test 6 - Create campaign (creator only)

```http
POST http://localhost:5000/api/campaigns
```

Headers:

```http
Authorization: Bearer CREATOR_TOKEN
```

Body:

```json
{
  "title": "AI Podcast Campaign",
  "description": "Clip my podcast for promotion",
  "clipDriveUrl": "https://drive.google.com/file/d/abc123/view",
  "budget": 10000,
  "payoutPer1000Views": 50,
  "status": "active"
}
```

Notes:
- `clipDriveUrl` must be a valid Google Drive URL.
- `budget` and `payoutPer1000Views` must be positive numbers.

### Test 7 - Get all campaigns

```http
GET http://localhost:5000/api/campaigns
```

Expected: list of campaigns.

### Test 8 - Get my campaigns

```http
GET http://localhost:5000/api/campaigns/my
```

Headers:

```http
Authorization: Bearer CREATOR_TOKEN
```

Expected: campaigns owned by the logged-in creator.

### Test 9 - Connect YouTube account (promoter only)

```http
GET http://localhost:5000/api/youtube/connect
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected:
- redirects to Google OAuth
- after consent, callback saves `youtubeConnected`, `youtubeChannelId`, and `googleId` on the promoter

Notes:
- promoter must already be logged in
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` must be configured

### Test 10 - Confirm promoter YouTube connection

```http
GET http://localhost:5000/api/auth/me
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected:
- `youtubeConnected: true`
- `youtubeChannelId` present after successful OAuth

### Test 11 - Create submission (promoter only, YouTube Shorts only)

```http
POST http://localhost:5000/api/submissions
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Body:

```json
{
  "campaignId": "64f0c2a1b2c3d4e5f6789012",
  "reelUrl": "https://www.youtube.com/shorts/abc123",
  "platform": "youtube"
}
```

Notes:
- `campaignId` must be a valid 24-character MongoDB ObjectId.
- `reelUrl` must be a valid YouTube Shorts or YouTube video URL.
- `platform` is fixed to `youtube`.
- promoter must have connected YouTube first.
- backend verifies the submitted Short belongs to the connected YouTube channel.

### Test 12 - Get my submissions

```http
GET http://localhost:5000/api/submissions/my
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected:
- submission list for the logged-in promoter
- each submission should include `youtubeVideoId`, `views`, `earnings`, `status`, and `lastSyncedAt`

### Test 13 - Get wallet

```http
GET http://localhost:5000/api/wallet
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: wallet balance and related wallet data for the logged-in user.

### Test 14 - Create withdrawal (promoter only)

```http
POST http://localhost:5000/api/withdrawals
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Body:

```json
{
  "amount": 1000
}
```

Notes:
- `amount` must be a positive number.

### Test 15 - Get my withdrawals

```http
GET http://localhost:5000/api/withdrawals/my
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: withdrawal history for the logged-in promoter.

### Test 16 - Admin: get all users

```http
GET http://localhost:5000/api/admin/users
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

### Test 17 - Admin: get all campaigns

```http
GET http://localhost:5000/api/admin/campaigns
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

### Test 18 - Admin: sync submission views from YouTube

```http
POST http://localhost:5000/api/admin/submissions/:id/sync
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

Notes:
- no body required
- backend fetches the latest YouTube `viewCount`
- backend updates `submission.views`, `submission.earnings`, `campaign.totalViews`, `campaign.totalSpent`, and `campaign.remainingBudget`
- if the Short no longer exists, the submission is marked `removed`

### Test 19 - Admin: manual submission view update (fallback)

```http
PUT http://localhost:5000/api/admin/submissions/:id/views
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

Body:

```json
{
  "views": 50000
}
```

Notes:
- this route still exists as a manual fallback
- `views` must be an integer greater than or equal to 0

### Test 20 - Admin: approve withdrawal

```http
PUT http://localhost:5000/api/admin/withdrawals/:id/approve
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

Body:

```json
{
  "notes": "Approved by admin"
}
```

Notes:
- `notes` is optional.

### Test 21 - Admin: reject withdrawal

```http
PUT http://localhost:5000/api/admin/withdrawals/:id/reject
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

Body:

```json
{
  "notes": "Rejected by admin"
}
```

## 3. What to verify in Postman

For each request, confirm:
- status code is correct (`200`, `201`, `400`, `401`, `403`, `404`)
- JWT auth is enforced
- role restrictions are enforced
- invalid data is rejected by validation
- MongoDB records are actually created or updated
- wallet, earnings, and withdrawal states behave as expected
- YouTube OAuth stores the promoter's connected channel correctly
- YouTube submission ownership is rejected if the Short belongs to another channel
- auto-sync updates views using YouTube instead of requiring manual admin entry
