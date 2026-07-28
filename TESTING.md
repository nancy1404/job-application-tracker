# Manual Local Testing Checklist

Use this checklist for practical local smoke coverage with `npm run dev`.

## 1) Start Local Dev

1. Install and run:

```bash
npm install
npm run dev
```

2. Open:
- http://localhost:3000

3. Confirm `.env` is pointed to a safe local/dev database before creating test data.

## 2) Dashboard + Weekly Goals

- [ ] Sign in and load dashboard successfully
- [ ] Weekly Goals card loads for the current week
- [ ] Set all 3 goals (add opportunities, apply to opportunities, complete follow-ups)
- [ ] Refresh and confirm weekly goals persist
- [ ] Add one opportunity and confirm add-goal progress increments
- [ ] Mark one opportunity with `appliedDate` and confirm apply-goal progress increments
- [ ] Complete one reminder and confirm follow-up goal progress increments

## 3) Reminder Notification Behavior

Set up at least one overdue or due-today reminder to trigger the dashboard alert.

- [ ] Alert appears with correct overdue/due-today counts
- [ ] Dismiss hides alert for current session view
- [ ] Hide for today persists through refresh on the same day
- [ ] Next day behavior resets as expected

## 4) Applications Page: Card/Table + Filters

- [ ] Create, edit, and delete one opportunity successfully
- [ ] Switch between Card and Table view without data loss
- [ ] Search works in Card view
- [ ] Search works in Table view
- [ ] Type/status/outcome filters work in Card view
- [ ] Type/status/outcome filters work in Table view
- [ ] Clear filters resets controls and results
- [ ] Table view shows Next reminder column per opportunity

## 5) Resume/CV Flow (External Links)

- [ ] Create resume/CV without external link
- [ ] Create resume/CV with external link URL and file name
- [ ] Open file action launches external link in a new tab
- [ ] Edit and remove external link fields successfully
- [ ] Confirm direct upload is not part of the current flow

## 6) Used Resume/CV Per Opportunity

- [ ] Select a resume/CV as Used resume/CV on an opportunity
- [ ] Save and reload; selection persists
- [ ] Update used resume/CV selection and verify it changes correctly

## 7) Feedback Message Behavior

- [ ] Success messages appear after create/update/delete or complete actions
- [ ] Success messages auto-dismiss after their timeout
- [ ] Error messages appear on failed actions
- [ ] Error messages do not auto-dismiss
- [ ] Empty-state messages render when lists have no data

## 8) Profile + Reminders Basics

- [ ] Profile values (display/preferred name and links) save and persist
- [ ] Dashboard greeting reflects preferred name when set
- [ ] Reminders page create/edit/complete flows work

## 9) Dark Mode + Mobile

- [ ] Dark mode toggle works and core pages stay readable (dashboard, applications, resumes, reminders, profile)
- [ ] Mobile width (around 390px) is usable without horizontal overflow
- [ ] Dashboard alert, weekly goals, and applications controls remain usable on mobile

## 10) Optional AI Checks

Only when `OPENAI_API_KEY` is configured.

- [ ] Generate AI match insight from an opportunity + resume pair
- [ ] Insight content renders without runtime errors

If key is not configured:

- [ ] Core app workflows remain fully usable

## 11) Final Verification

```bash
npm run build
git status
```
