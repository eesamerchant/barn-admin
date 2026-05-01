# Deployment Checklist

## Pre-Deployment Checklist

### Code Quality
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] All imports are correct
- [ ] No hardcoded passwords or secrets
- [ ] Environment variables are set correctly

### Testing
- [ ] Login works with test account
- [ ] Can navigate between all pages
- [ ] Bookings CRUD operations work
- [ ] Availability can be set/edited/deleted
- [ ] Add-ons can be created/edited/deleted
- [ ] Discount codes can be created/edited/deleted
- [ ] Payment verification works
- [ ] Settings can be saved
- [ ] Filters and sorting work
- [ ] Modal forms open/close properly

### Database
- [ ] Supabase project is active
- [ ] All tables exist and have data
- [ ] Foreign keys are configured
- [ ] RLS policies are in place (if needed)
- [ ] Database credentials are current

### Supabase Configuration
- [ ] Authentication enabled with email/password
- [ ] Admin users created
- [ ] Service role key available for server operations
- [ ] CORS configured if needed

## Vercel Deployment Steps

### 1. Prepare Repository
```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit - Barn Admin Dashboard"
```

### 2. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or:
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select barn-admin as root directory

### 3. Environment Variables in Vercel

Add these in Vercel Project Settings > Environment Variables:

**Production:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xwlmdiwxaypznwelaqlp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-settings>
```

**Preview (optional, same values):**
```
Same as Production
```

### 4. Deployment Settings
- **Framework**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 5. Deploy
```bash
vercel --prod
```

## Post-Deployment Verification

### Functionality Tests
- [ ] Home page loads
- [ ] Login page displays
- [ ] Can login with test credentials
- [ ] Sidebar navigation works
- [ ] All menu items accessible
- [ ] Dashboard loads with real data
- [ ] Can view bookings
- [ ] Can filter bookings
- [ ] Can update booking status
- [ ] Can access all other pages

### Data Persistence
- [ ] Changes saved to database
- [ ] Page refresh preserves data
- [ ] Navigation preserves state
- [ ] Forms validate properly

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No 500 errors
- [ ] No console errors
- [ ] Network requests complete
- [ ] Database queries run successfully

### Security
- [ ] Unauthenticated users redirected to /login
- [ ] Session persists across navigation
- [ ] Logout clears session
- [ ] No sensitive data in URLs
- [ ] HTTPS is enforced
- [ ] Environment variables are hidden

## Domain Configuration

### DNS Records (if using custom domain)
```
Type: CNAME
Name: (subdomain)
Value: cname.vercel-dns.com
```

### Vercel Domain Settings
1. Add domain in Project Settings > Domains
2. Update DNS records
3. Wait for verification (usually 5-10 minutes)
4. SSL certificate auto-generates

## First Admin User Setup

### In Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Invite user"
3. Enter admin email
4. Copy invitation link
5. Send to admin

OR manually create:
1. Authentication > Users
2. Click "Create new user"
3. Enter email and password
4. Mark as admin if role system added

## Post-Deployment Admin Tasks

### 1. Configure Settings
- [ ] Set space names (Barnscape Studios, The Barn)
- [ ] Set hourly rates for each space
- [ ] Set business hours
- [ ] Set deposit percentage
- [ ] Set booking advance days
- [ ] Set cancellation hours
- [ ] Configure IMAP (optional)

### 2. Add Availability
- [ ] Bulk set next 30/60/90 days
- [ ] Set appropriate hours
- [ ] Mark any closed dates

### 3. Create Add-ons
- [ ] Add common services
- [ ] Set appropriate prices
- [ ] Assign to spaces

### 4. Create Discount Codes
- [ ] Add any promotional codes
- [ ] Set usage limits
- [ ] Set expiration dates

## Monitoring

### Set Up Alerts
- [ ] Error logging (Sentry optional)
- [ ] Performance monitoring
- [ ] Uptime monitoring

### Regular Checks
- [ ] Daily: Check pending payments
- [ ] Weekly: Review bookings and revenue
- [ ] Monthly: Check settings and configurations

## Troubleshooting Post-Deployment

### 404 Error
- Check Vercel deployment is complete
- Clear browser cache
- Check URL is correct

### Database Connection Error
- Verify Supabase URL in environment variables
- Check Supabase project is active
- Verify network is accessible

### Authentication Issues
- Clear browser cookies
- Check Supabase auth settings
- Verify user exists in Supabase
- Check email verification

### Styling Issues
- Check Tailwind CSS is compiling
- Verify CSS file is imported
- Check no CSS conflicts
- Force refresh browser cache

## Rollback Procedure

If deployment has issues:

### Option 1: Revert Last Deployment
```bash
vercel rollback
```

### Option 2: Deploy Previous Version
```bash
# If using Git
git revert <commit-hash>
git push
# Vercel will auto-deploy
```

### Option 3: Manual Deploy
```bash
npm run build
vercel --prod --confirm
```

## Final Checklist

- [ ] Domain is live and HTTPS works
- [ ] All environment variables set
- [ ] Database connection verified
- [ ] Admin can login
- [ ] All pages load
- [ ] Real data displays
- [ ] CRUD operations work
- [ ] No errors in console
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable
- [ ] Security checks pass
- [ ] Team has login credentials
- [ ] Documentation is accessible
- [ ] Monitoring is configured

## Support

If you encounter issues during deployment:

1. Check Vercel deployment logs
2. Check Supabase project status
3. Verify environment variables
4. Check browser console for errors
5. Review application logs
6. Consult documentation files

## Maintenance

### Regular Tasks
- Daily: Monitor bookings and payments
- Weekly: Check system health
- Monthly: Review statistics
- Quarterly: Backup database

### Updates
- Keep Node.js updated
- Update dependencies monthly
- Monitor security advisories

## Success Indicators

✓ Admin can login successfully
✓ Dashboard displays live data
✓ All CRUD operations work
✓ Payment verification functional
✓ Settings persist across sessions
✓ No 404 or 500 errors
✓ Performance acceptable
✓ Users can complete bookings
✓ No data loss or corruption

Dashboard is production-ready when all these items are checked!
