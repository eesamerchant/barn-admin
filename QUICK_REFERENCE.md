# Barn Admin Dashboard - Quick Reference

## Login
- URL: `http://localhost:3000/login` (or your domain)
- Credentials: Supabase admin email and password
- Remember: Login page is the only unauthenticated page

## Main Navigation (Sidebar)
- Dashboard (📊) - Overview and statistics
- Bookings (📅) - Manage all bookings
- Availability (🕐) - Set venue hours
- Add-ons (➕) - Manage services
- Discounts (🏷️) - Manage codes
- Payments (💳) - Verify payments
- Settings (⚙️) - Configure everything

## Dashboard (`/`)
**What to check daily:**
- Today's bookings count and list
- Pending payment count
- Monthly revenue
- Upcoming week's bookings

## Bookings (`/bookings`)
**Common tasks:**
1. Filter by space (select space name)
2. Filter by status (pending, confirmed, completed, cancelled)
3. Set date range (From/To date)
4. Click row to see details
5. Change status from dropdown
6. Click "Verify Payment" if payment is confirmed

**Status workflow:**
pending → confirmed → completed (or cancelled at any point)

## Availability (`/availability`)
**To set today's hours:**
1. Select today's date
2. Enter start hour (e.g., 8)
3. Enter end hour (e.g., 22)
4. Toggle "Available" checkbox
5. Add note if needed
6. Click "Save Availability"

**To bulk set next 30 days:**
1. Days from Today: 30
2. Start Hour: 8
3. End Hour: 22
4. Click "Bulk Set"

**Dates not listed = venue closed**

## Add-ons (`/add-ons`)
**To create new:**
1. Click "+ New Add-on"
2. Enter name (e.g., "Sound System")
3. Enter description
4. Enter price
5. Select space (Both Spaces for both venues)
6. Toggle Active
7. Save

**Available for both spaces by default - select space to limit to one venue**

## Discounts (`/discounts`)
**To create code:**
1. Click "+ New Discount Code"
2. Enter code (auto-converted to UPPERCASE)
3. Select type (Percentage or Fixed Amount)
4. Enter value (e.g., 20 for 20%)
5. Set minimum booking amount
6. Set max uses (optional, leave blank for unlimited)
7. Select space
8. Set expiration date (optional)
9. Toggle Active
10. Save

**Example codes:**
- "SAVE20" = 20% off
- "SAVE50" = $50 off
- Available for any space or both spaces

## Payments (`/payments`)
**Daily task:**
1. Check pending payments count
2. View list of unpaid bookings
3. When payment received via e-transfer:
   - Find booking in list
   - Click "Verify"
   - Confirm amount matches
   - Click "Confirm Payment"

**Payment fields shown:**
- Customer name
- Booking date
- E-transfer reference number
- Total amount due
- Deposit amount
- Space name

## Settings (`/settings`)
**Important settings:**
- Event Space Name: "Barnscape Studios"
- Court Name: "The Barn"
- Hourly Rate: Price per hour for each space
- Min Booking Hours: Minimum hours per booking
- Max Booking Hours: Maximum hours per booking
- Deposit Percentage: 50% (collected upfront)
- Business Hours: 8am-10pm
- Booking Advance Days: 90 days max
- Cancellation Hours: 48 hours notice required

**IMAP Configuration (for automated email verification):**
- Email: Gmail account receiving e-transfers
- IMAP Host: imap.gmail.com (default)
- IMAP Port: 993 (default)
- App Password: Gmail app-specific password (not regular password)
- SSL: Keep enabled

## Common Workflows

### Complete a Booking
1. Bookings → filter status "confirmed"
2. Click booking
3. Change status to "completed"
4. Close

### Verify Payment
1. Payments → find pending booking
2. Click "Verify"
3. Check amount matches
4. Click "Confirm Payment"
5. Status auto-updates

### Close Venue for Day
1. Availability
2. Select date
3. Toggle "Available" OFF
4. Add note (e.g., "Closed - Private Event")
5. Save

### Set Hours for Week
1. Availability → Bulk Set
2. Days from Today: 7
3. Start Hour: 8
4. End Hour: 22
5. Click "Bulk Set"

### Create Promotion
1. Discounts → New Discount Code
2. Code: "SPRING20"
3. Type: Percentage
4. Value: 20
5. Space: Both Spaces
6. Max Uses: 50
7. Expiration: End of season date
8. Save

## Time Format
- All times are 24-hour format
- 0 = midnight
- 8 = 8am
- 20 = 8pm
- 22 = 10pm
- 23 = 11pm

## Date Format
- Always YYYY-MM-DD (e.g., 2026-05-01)
- Used consistently throughout

## Quick Numbers
- Standard deposit: 50%
- Typical hours: 8am-10pm (8-22)
- Notice required: 48 hours
- Advance booking: 90 days max
- Min booking: 1 hour (configurable)
- Max booking: 24 hours (configurable)

## Troubleshooting

**Can't login?**
- Check spelling of email
- Verify password is correct
- User account must exist in Supabase

**Settings not saving?**
- Check all required fields filled
- Look for error message at top
- Try again

**Can't verify payment?**
- Check booking status is "pending"
- Check payment_verified is not already true
- Verify amount matches

**Bulk set not working?**
- Check days number is valid
- Check hours are valid (0-23)
- Try setting fewer days first

## Important Reminders

- Both venues share availability (one schedule)
- Availability applies to the venue as a whole
- Deleted items cannot be recovered
- Payments are permanent once verified
- Settings affect all future bookings
- Discount codes are case-insensitive
- Always verify payment amounts match

## Support

For issues not covered here, see:
- README.md - Full feature documentation
- SETUP.md - Technical setup details
- PROJECT_SUMMARY.md - Complete architecture overview
