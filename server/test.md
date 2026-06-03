# Backend API Postman Test Guide

This guide reflects the current backend routes and demo flow.

Base URL:

```text
http://localhost:5000/api
```

## 1. Start The App

From the project root:

```bash
npm install
npm run dev
```

Or backend only from `server/`:

```bash
npm install
npm run dev
```

Expected backend message:

```text
Server running on port 5000
```

## 2. Health Check

```http
GET http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "CeatorReach backend is running"
}
```

## 3. Auth

### Register Creator

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Krishna Creator",
  "email": "creator@test.com",
  "password": "123456",
  "role": "creator"
}
```

Save `token` as `CREATOR_TOKEN`.

### Register Promoter

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Krishna Promoter",
  "email": "promoter@test.com",
  "password": "123456",
  "role": "promoter"
}
```

Save `token` as `PROMOTER_TOKEN`.

### Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "creator@test.com",
  "password": "123456"
}
```

### Get Logged-In User

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN
```

## 4. Admin Setup

Create admin from `server/`:

```bash
node scripts/create-admin.js "Admin" "admin@example.com" "Admin@12345"
```

Then login:

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

Save `token` as `ADMIN_TOKEN`.

## 5. Creator Wallet Deposit

Deposits use Razorpay Test Mode. For frontend testing, use the creator dashboard and Razorpay Checkout popup.

### Create Wallet Order

```http
POST http://localhost:5000/api/wallet/create-order
Authorization: Bearer CREATOR_TOKEN
Content-Type: application/json
```

```json
{
  "amount": 1000
}
```

Expected:

```json
{
  "success": true,
  "order": {
    "orderId": "order_xxx",
    "amount": 1000,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  }
}
```

### Verify Wallet Payment

Normally called by the frontend after Razorpay Checkout succeeds.

```http
POST http://localhost:5000/api/wallet/verify-payment
Authorization: Bearer CREATOR_TOKEN
Content-Type: application/json
```

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_from_checkout"
}
```

Expected:

```json
{
  "success": true,
  "wallet": {
    "walletBalance": 1000
  }
}
```

## 6. Creator Campaigns

Creator must have enough `walletBalance` before creating a campaign.

```http
POST http://localhost:5000/api/campaigns
Authorization: Bearer CREATOR_TOKEN
Content-Type: application/json
```

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

- `clipDriveUrl` must be a Google Drive URL.
- `budget` and `payoutPer1000Views` must be positive.
- Campaign budget is deducted from creator wallet and stored as `campaign.remainingBudget`.

### Get All Campaigns

```http
GET http://localhost:5000/api/campaigns
Authorization: Bearer PROMOTER_TOKEN
```

### Get Creator Campaigns

```http
GET http://localhost:5000/api/campaigns/my
Authorization: Bearer CREATOR_TOKEN
```

## 7. Promoter YouTube OAuth

Frontend flow is recommended because browsers cannot send `Authorization` headers during Google redirects.

From frontend:

```text
Promoter Dashboard -> Connect YouTube
```

Direct route:

```http
GET http://localhost:5000/api/youtube/connect?token=PROMOTER_TOKEN
```

Expected after Google consent:

- user has `youtubeConnected: true`
- user has `youtubeChannelId`

Confirm:

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer PROMOTER_TOKEN
```

## 8. Promoter Submission

Promoter must connect YouTube first.

```http
POST http://localhost:5000/api/submissions
Authorization: Bearer PROMOTER_TOKEN
Content-Type: application/json
```

```json
{
  "campaignId": "64f0c2a1b2c3d4e5f6789012",
  "reelUrl": "https://www.youtube.com/shorts/abc123",
  "platform": "youtube"
}
```

What happens:

- backend extracts YouTube video ID
- backend verifies the Short belongs to the promoter's connected channel
- backend creates submission
- backend immediately syncs current YouTube views

### Get My Submissions

```http
GET http://localhost:5000/api/submissions/my
Authorization: Bearer PROMOTER_TOKEN
```

## 9. Admin View Sync

YouTube views may increase slowly, so use manual view update for demos.

### Auto Sync From YouTube

```http
POST http://localhost:5000/api/admin/submissions/SUBMISSION_ID/sync
Authorization: Bearer ADMIN_TOKEN
```

### Manual View Update

```http
PUT http://localhost:5000/api/admin/submissions/SUBMISSION_ID/views
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "views": 50000
}
```

Example:

```text
views = 50000
rate = Rs. 50 per 1000 views
earnings = 50 * Rs. 50 = Rs. 2500
```

Manual update affects:

- submission `views`
- submission `earnings`
- campaign `totalViews`
- campaign `totalSpent`
- campaign `remainingBudget`
- promoter `approvedEarnings`

## 10. Wallet

```http
GET http://localhost:5000/api/wallet
Authorization: Bearer PROMOTER_TOKEN
```

Expected fields:

```json
{
  "walletBalance": 0,
  "pendingEarnings": 0,
  "approvedEarnings": 2500,
  "withdrawableBalance": 2500,
  "totalWithdrawn": 0,
  "pendingWithdrawals": 0
}
```

`withdrawableBalance` subtracts pending withdrawal requests.

## 11. Promoter Withdrawal Request

```http
POST http://localhost:5000/api/withdrawals
Authorization: Bearer PROMOTER_TOKEN
Content-Type: application/json
```

```json
{
  "amount": 1000
}
```

Expected:

```json
{
  "success": true,
  "message": "Withdrawal request created successfully"
}
```

Notes:

- `amount` must be greater than `0`
- promoter must have enough `withdrawableBalance`
- request starts as `pending`
- no real payout API is called

### Promoter Withdrawal History

```http
GET http://localhost:5000/api/withdrawals/my
Authorization: Bearer PROMOTER_TOKEN
```

## 12. Admin Withdrawal Simulation

Withdrawals are simulated for Razorpay Test Mode college/demo use.

### Get Pending Withdrawals

```http
GET http://localhost:5000/api/admin/withdrawals
Authorization: Bearer ADMIN_TOKEN
```

### Approve Withdrawal

```http
PUT http://localhost:5000/api/admin/withdrawals/WITHDRAWAL_ID/approve
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "remarks": "Approved for demo payout"
}
```

Expected:

```json
{
  "success": true,
  "message": "Withdrawal completed successfully",
  "data": {
    "payoutReference": "TEST_PAYOUT_174889999"
  }
}
```

Approval effects:

- withdrawal `status` becomes `completed`
- fake `payoutReference` is saved
- promoter `approvedEarnings` decreases
- promoter `totalWithdrawn` increases
- transaction with type `withdrawal` is created

### Reject Withdrawal

```http
PUT http://localhost:5000/api/admin/withdrawals/WITHDRAWAL_ID/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "remarks": "Rejected during review"
}
```

Expected:

```json
{
  "success": true,
  "message": "Withdrawal rejected successfully"
}
```

## 13. Admin Tables

### Users

```http
GET http://localhost:5000/api/admin/users
Authorization: Bearer ADMIN_TOKEN
```

### Campaigns

```http
GET http://localhost:5000/api/admin/campaigns
Authorization: Bearer ADMIN_TOKEN
```

## 14. Verification Checklist

Confirm:

- auth tokens are required
- creator-only and promoter-only route restrictions work
- creator cannot create campaign without wallet balance
- Razorpay deposit credits creator wallet only after signature verification
- YouTube OAuth stores connected channel
- submission is rejected if video is not from connected channel
- manual views update creates promoter approved earnings
- pending withdrawals reduce `withdrawableBalance`
- admin approval creates `TEST_PAYOUT_<timestamp>`
- admin approval deducts promoter `approvedEarnings`
- admin approval increases promoter `totalWithdrawn`
