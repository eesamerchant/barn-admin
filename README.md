# Barn Admin Dashboard

A comprehensive Next.js admin dashboard for managing bookings across two venues: Barnscape Studios (event space) and The Barn (basketball court).

## Features

- **User Authentication**: Secure login with Supabase Auth
- **Dashboard Home**: Overview of bookings, revenue, and pending payments
- **Bookings Management**: Create, view, filter, and manage all bookings
- **Availability Management**: Set venue availability with bulk operations
- **Add-ons Management**: Create and manage add-on services
- **Discount Codes**: Create and manage discount codes with usage tracking
- **Payment Verification**: Track and verify e-transfer payments
- **Settings**: Configure space names, rates, business hours, and IMAP for payment verification

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase for database and authentication
- date-fns for date utilities

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Authentication

Users must log in with their Supabase credentials. New admin accounts are created in the Supabase dashboard.

Default credentials should be set up through Supabase Console.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind CSS configuration
│   ├── layout.tsx           # Root layout with auth guard
│   ├── page.tsx             # Dashboard home
│   ├── login/               # Login page
│   ├── bookings/            # Bookings management
│   ├── availability/        # Availability management
│   ├── add-ons/             # Add-ons management
│   ├── discounts/           # Discount codes management
│   ├── payments/            # Payment verification
│   ├── settings/            # Admin settings
│   └── api/
│       └── verify-payment/  # Payment verification endpoint
├── components/
│   ├── AuthGuard.tsx        # Authentication guard component
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── StatsCard.tsx        # Statistics card component
│   └── DataTable.tsx        # Reusable data table
└── lib/
    └── supabase.ts          # Supabase client initialization
```

## Key Features

### Dashboard Home
- Today's bookings count
- This month's bookings and revenue
- Pending payment count
- Recent bookings list

### Bookings Management
- View all bookings with filters (space, status, date range)
- Update booking status (pending → confirmed → completed/cancelled)
- Verify payments
- View customer details and booking information

### Availability Management
- Set availability for individual dates
- Bulk set availability for multiple days
- Configure start/end hours
- Mark dates as available or unavailable
- Add notes for special dates

### Add-ons Management
- Create/edit/delete add-on services
- Set pricing per add-on
- Assign to specific space or both spaces
- Toggle active/inactive status

### Discount Codes
- Create percentage or fixed amount discounts
- Set minimum booking amounts
- Track usage with max uses limit
- Configure expiration dates
- Assign to specific space or both spaces

### Payment Verification
- View pending payments
- See e-transfer reference numbers
- Manually verify payments
- Track payment verification history
- Show total amount and deposits due

### Settings
- Configure space names and hourly rates
- Set minimum/maximum booking hours per space
- Set deposit percentage
- Configure business hours
- Set booking advance days limit
- Set cancellation notice hours
- Configure IMAP settings for e-transfer verification

## Database Schema

The dashboard works with the following Supabase tables:

- `spaces`: Venue information
- `bookings`: Booking records
- `availability`: Venue availability by date
- `add_ons`: Available add-on services
- `booking_add_ons`: Add-ons linked to bookings
- `discount_codes`: Discount code records
- `settings`: Application settings
- `etransfer_verifications`: E-transfer verification records
- `imap_config`: IMAP configuration for email verification

## Color Scheme

- Primary: #1e293b (dark slate)
- Accent: #3b82f6 (blue)
- Success: #22c55e (green)
- Warning: #f59e0b (orange)
- Danger: #ef4444 (red)
- Background: #f8fafc (light gray)

## Deployment

Deploy to Vercel:

```bash
npm run build
# Then deploy the build to Vercel
```

Make sure to set the environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## Notes

- All pages except `/login` require authentication
- The sidebar navigation is only shown to authenticated users
- The payment verification API endpoint is a placeholder for IMAP implementation
- Manual payment verification is supported through the admin UI

## Support

For issues or feature requests, contact the development team.
