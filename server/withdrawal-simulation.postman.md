# Withdrawal Payout Simulation Postman Guide

This project uses Razorpay Test Mode for deposits only. Withdrawals are simulated for demo use and do not call RazorpayX or any payout API.

## 1. Create withdrawal request

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

Expected success:

```json
{
  "success": true,
  "message": "Withdrawal request created successfully"
}
```

## 2. Promoter withdrawal history

```http
GET http://localhost:5000/api/withdrawals/my
Authorization: Bearer PROMOTER_TOKEN
```

## 3. Admin pending withdrawals

```http
GET http://localhost:5000/api/admin/withdrawals
Authorization: Bearer ADMIN_TOKEN
```

Returns pending withdrawal requests.

## 4. Admin approve withdrawal

```http
PUT http://localhost:5000/api/admin/withdrawals/WITHDRAWAL_ID/approve
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

```json
{
  "remarks": "Approved for college demo"
}
```

Expected success:

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

- withdrawal status becomes `completed`
- fake payout reference is saved
- promoter `approvedEarnings` decreases
- promoter `totalWithdrawn` increases
- transaction record is created with type `withdrawal`

## 5. Admin reject withdrawal

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

Expected success:

```json
{
  "success": true,
  "message": "Withdrawal rejected successfully"
}
```
