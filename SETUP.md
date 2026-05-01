# Admin Dashboard Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd barn-admin
npm install
```

### 2. Environment Variables
The `.env.local` file is already configured with Supabase credentials. If you need to update them:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xwlmdiwxaypznwelaqlp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=placeholder_set_in_vercel
```

### 3. Run Development Server
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 4. Login
Visit `/login` and sign in with your Supabase admin credentials.

To create a new admin account:
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Create new user"
4. Enter email and password
5. Confirm email verification

## Pages Overview

### `/` - Dashboard Home
Overview of today's bookings, weekly bookings, revenue, and pending payments.

### `/login` - Login Page
Email/password authentication using Supabase Auth.

### `/bookings` - Bookings Management
- View all bookings with filters (space, status, date range)
- Update booking status
- Verify payments
- View detailed booking information

### `/availability` - Availability Management
- Set/edit availability for specific dates
- Bulk set availability for multiple days
- Configure open hours (start_hour, end_hour)
- Add notes to dates
- Toggle availability on/off

### `/add-ons` - Add-ons Management
- Create new add-on services
- Edit existing add-ons
- Set pricing and availability
- Toggle active/inactive
- Delete add-ons

### `/discounts` - Discount Codes
- Create percentage or fixed amount discounts
- Set usage limits
- Configure expiration dates
- View usage statistics
- Manage by space

### `/payments` - Payment Verification
- View pending payments
- See e-transfer reference numbers
- Manually verify payments
- Track verification history
- View total amounts due

### `/settings` - Admin Settings
- Configure space names and rates
- Set booking hour limits
- Configure business hours
- Set deposit percentage
- Configure IMAP for email verification

## Database Connection

The dashboard connects to Supabase with the following configuration:

- **Project URL**: https://xwlmdiwxaypznwelaqlp.supabase.co
- **Authentication**: Supabase Auth with email/password
- **Real-time**: Uses Supabase client for queries

## Deployment to Vercel

### 1. Prepare for Deployment
```bash
npm run build
```

### 2. Set Environment Variables in Vercel
1. Go to your Vercel project settings
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase project settings)

### 3. Deploy
```bash
vercel deploy
```

Or simply push to your connected Git repository and Vercel will auto-deploy.

## Key Features Implemented

✓ User authentication with Supabase Auth
✓ Dashboard with stats and overview
✓ Complete bookings management
✓ Availability calendar system
✓ Add-ons management
✓ Discount code system
✓ Payment verification tracking
✓ Comprehensive settings panel
✓ Responsive design
✓ Data filtering and sorting
✓ Modal forms for data entry
✓ Real-time Supabase integration

## Styling

The dashboard uses:
- **Tailwind CSS v4** for styling
- **Color Scheme**:
  - Primary: #1e293b (dark slate)
  - Accent: #3b82f6 (blue)
  - Success: #22c55e (green)
  - Warning: #f59e0b (orange)
  - Danger: #ef4444 (red)
  - Background: #f8fafc (light gray)

## Authentication Flow

1. User visits `/` → redirected to `/login` if not authenticated
2. Enters email and password
3. Supabase validates credentials
4. Session is created
5. User is redirected to dashboard
6. AuthGuard component protects all pages except `/login`
7. Logout button in sidebar signs out and redirects to `/login`

## Notes

- All times are in 24-hour format (0-23)
- Dates use ISO format (YYYY-MM-DD)
- Availability is shared across both spaces (one floor at a time)
- Payment verification can be manual or automated via IMAP
- The payment verification API endpoint is a placeholder for server-side IMAP implementation

## Support

For issues or questions, check the README.md file or contact the development team.
