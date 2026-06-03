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

---

## 2. Real endpoint test checklist

### Test 1 — Health check

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

---

### Test 2 — Register user

```http
POST http://localhost:5000/api/auth/register
```

Body:

```json
{
  "name": "Krishna",
  "email": "krishna@test.com",
  "password": "123456",
  "role": "creator"
}
```

Notes:
- Allowed roles are `creator` or `promoter`.
- Password must be at least 6 characters.

---

### Test 3 — Login

```http
POST http://localhost:5000/api/auth/login
```

Body:

```json
{
  "email": "krishna@test.com",
  "password": "123456"
}
```

Save the returned JWT token for later tests.

---

### Test 4 — Get logged-in user

```http
GET http://localhost:5000/api/auth/me
```

Headers:

```http
Authorization: Bearer YOUR_TOKEN
```

Expected: your user object from the token.

---

### Test 5 — Create campaign (creator only)

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

---

### Test 6 — Get all campaigns

```http
GET http://localhost:5000/api/campaigns
```

Expected: list of campaigns.

---

### Test 7 — Get my campaigns

```http
GET http://localhost:5000/api/campaigns/my
```

Headers:

```http
Authorization: Bearer CREATOR_TOKEN
```

Expected: campaigns owned by the logged-in creator.

---

### Test 8 — Create submission (promoter only)

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
- `reelUrl` must be a valid YouTube URL.
- `platform` is currently fixed to `youtube`.

---

### Test 9 — Get my submissions

```http
GET http://localhost:5000/api/submissions/my
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: submissions created by the logged-in promoter.

---

### Test 10 — Get wallet

```http
GET http://localhost:5000/api/wallet
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: wallet balance and related wallet data for the logged-in user.

---

### Test 11 — Create withdrawal (promoter only)

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

---

### Test 12 — Get my withdrawals

```http
GET http://localhost:5000/api/withdrawals/my
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: withdrawal history for the logged-in promoter.

---

### Test 13 — Admin: get all users

```http
GET http://localhost:5000/api/admin/users
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

---

### Test 14 — Admin: get all campaigns

```http
GET http://localhost:5000/api/admin/campaigns
```

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
```

---

### Test 15 — Admin: update submission views

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
- `views` must be an integer greater than or equal to 0.

---

### Test 16 — Admin: approve withdrawal

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

---

### Test 17 — Admin: reject withdrawal

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

---

### Test 18 — YouTube connect (promoter only)

```http
GET http://localhost:5000/api/youtube/connect
```

Headers:

```http
Authorization: Bearer PROMOTER_TOKEN
```

Expected: redirect flow for YouTube connection.

---

## 3. What to verify in Postman

For each request, confirm:
- status code is correct (`200`, `201`, `400`, `401`, `403`, `404`)
- JWT auth is enforced
- role restrictions are enforced
- invalid data is rejected by validation
- MongoDB records are actually created/updated
- wallet, earnings, and withdrawal states behave as expected
