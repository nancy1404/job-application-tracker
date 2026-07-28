# Manual Local Testing Checklist

Use this checklist when running the app locally with `npm run dev`.

## 1) Start Local Dev

1. Open terminal in project root.
2. Install dependencies if needed:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

4. Open app at:
- http://localhost:3000

## 2) Important Data Safety Warning

Before creating test data, confirm which database is connected.

- Check `.env` and confirm `DATABASE_URL` points to your intended local/dev database.
- Do not create test data if `DATABASE_URL` appears to point to production.
- If unsure, stop and verify database host/project name first.

Quick check example:

```bash
cat .env
```

## 3) Suggested Sample Resume/CV Data

Create at least 2 to 3 resumes:

- Resume A: "General SWE Resume"
- Resume B: "Frontend Focused Resume"
- Resume C: "Research/Lab CV"

For each resume, verify:

- Title saves correctly
- Content saves correctly
- One resume can be set as default
- Editing updates content
- Delete works safely

## 4) Suggested Sample Opportunity Data

Create at least 6 opportunities covering multiple types.

Suggested mix:

1. Job
- Title: Frontend Engineer Intern
- Company: Example Labs
- Status: INTERESTED
- Outcome: ACTIVE

2. Job
- Title: Full-Stack Developer
- Company: Acme Tech
- Status: APPLIED
- Outcome: ACTIVE
- Applied date set

3. Internship
- Title: Product Design Intern
- Company: Pixel Studio
- Status: SAVED
- Outcome: ACTIVE

4. Research / Lab
- Title: NLP Research Assistant
- Company: University Lab
- Status: INTERVIEW
- Outcome: ACTIVE

5. Other Outreach
- Title: Fellowship Outreach
- Company: Community Org
- Status: OFFER
- Outcome: ACTIVE

6. Final/Archive case
- Title: Backend Role (Old)
- Company: Legacy Corp
- Outcome: REJECTED or ARCHIVED

Optional fields to test:

- Contact name
- Contact email
- Job URL
- Notes
- Outcome notes
- Resume/CV used

## 5) Suggested Sample Reminder Data

Create reminders with all timing states:

1. Overdue
- Due date: yesterday
- Status: PENDING

2. Due today
- Due date: today
- Status: PENDING

3. Future
- Due date: 7 days later
- Status: PENDING

4. Completed
- Any date
- Status: COMPLETED

Also test reminders linked to opportunities and reminders not linked.

## 6) Dashboard Checks

- [ ] Greeting, date, and quote render correctly
- [ ] Greeting uses preferred name when set
- [ ] Greeting falls back safely when preferred name is empty
- [ ] Top reminder alert appears only when overdue or due-today reminders exist
- [ ] Alert message counts are correct (overdue and due today)
- [ ] Alert link opens Reminders page
- [ ] Alert Dismiss hides notification for current session
- [ ] Alert Hide for today persists through refresh for the same day
- [ ] Status summary donut shows only workflow statuses:
  - INTERESTED, SAVED, APPLIED, INTERVIEW, OFFER
- [ ] Donut center count matches active opportunities count
- [ ] Donut legend counts match actual data
- [ ] Outcome summary still shows final/archive outcomes
- [ ] Progress section updates week/month metrics based on data

## 6.1) Weekly Goals Smoke Tests

- [ ] Set weekly goals for all goal types:
  - Add opportunities
  - Apply to opportunities
  - Complete follow-ups
- [ ] Refresh the page and confirm weekly goals persist
- [ ] Create an opportunity and confirm "Add opportunities" progress updates
- [ ] Set `appliedDate` on an opportunity and confirm "Apply to opportunities" progress updates
- [ ] Complete a reminder and confirm "Complete follow-ups" progress updates
- [ ] Confirm Weekly Goals card empty state appears when goals are not set
- [ ] Confirm Weekly Goals card is readable and usable in dark mode
- [ ] Confirm Weekly Goals card layout and inline goal editing work on mobile widths

## 7) Applications/Opportunities Page Checks

- [ ] Create opportunity works
- [ ] Edit opportunity works
- [ ] Delete opportunity works
- [ ] Active / Ongoing vs Final / Archive split is based on outcome
- [ ] Status select shows normal statuses only:
  - INTERESTED, SAVED, APPLIED, INTERVIEW, OFFER
- [ ] Legacy statuses remain viewable if old records already use them
- [ ] Search filters by title, company, contact name, contact email
- [ ] Filters work for opportunity type, status, outcome
- [ ] Clear filters resets all filter controls
- [ ] Empty filtered result message appears when no matches
- [ ] Add follow-up reminder action works

## 7.1) Applications Table View Smoke Tests

- [ ] Switch between Cards and Table views without data loss
- [ ] Search works in both Cards and Table views
- [ ] Type/status/outcome filters work in both Cards and Table views
- [ ] Next reminder column shows nearest pending reminder per opportunity
- [ ] New opportunity flow still works from table mode

## 8) Resume/CV Page Checks

- [ ] Create resume works
- [ ] Edit resume works
- [ ] Delete resume works
- [ ] Default resume behavior is correct
- [ ] Resume can be selected as "Resume/CV used" on opportunities

## 8.1) External Resume/CV Link Smoke Tests

- [ ] Create resume without external file link
- [ ] Create resume with external file link
- [ ] Open file action opens external link in a new tab
- [ ] Clear/remove an existing external file link and save successfully

## 9) Profile Page Checks

- [ ] Open Profile page from the dashboard navigation
- [ ] Email is visible and read-only
- [ ] Edit display name and save successfully
- [ ] Edit preferred name and save successfully
- [ ] Save GitHub URL successfully
- [ ] Save LinkedIn URL successfully
- [ ] Save portfolio URL successfully
- [ ] Reload the page and confirm all saved values persist
- [ ] Return to dashboard and confirm greeting uses preferred name

## 10) Reminders Page Checks

- [ ] Create reminder works
- [ ] Edit reminder works
- [ ] Mark completed works
- [ ] Linked opportunity info displays when present
- [ ] Timing labels are correct (overdue, due today, upcoming, completed)
- [ ] Sorting/visibility feels correct for pending vs completed

## 10.1) Message Consistency Checks

- [ ] Success messages appear after create/update/complete/delete actions and auto-dismiss
- [ ] Error messages appear on failed actions and do not auto-dismiss

## 11) Dark Mode Checks

- [ ] Toggle works on dashboard layout
- [ ] Dashboard remains readable in dark mode
- [ ] Applications page controls and cards are readable
- [ ] Profile page form and read-only email field remain readable
- [ ] Reminders page is readable
- [ ] Auth and resume pages remain readable

## 12) Mobile/Responsive Checks

Use browser responsive mode (for example 390px width):

- [ ] Dashboard cards stack cleanly
- [ ] Donut and legend remain readable
- [ ] Reminder alert banner wraps cleanly
- [ ] Applications search/filter controls stack without overlap
- [ ] Profile page form fields stack cleanly without horizontal scrolling
- [ ] Forms are usable without horizontal scrolling

## 13) Optional AI Match Insights Checks

Only if `OPENAI_API_KEY` is configured.

- [ ] Select resume and generate AI insight from an opportunity
- [ ] Match score, summary, strengths/gaps/suggestions render
- [ ] Re-run behavior is stable (no crashes)

If key is missing:

- [ ] App remains usable for all non-AI features
- [ ] AI feature shows a clear, safe error message

## 14) Pre-Push Checklist

Before pushing to GitHub:

1. Build check:

```bash
npm run build
```

2. Verify working tree:

```bash
git status
```

3. Quick smoke test:
- Sign in
- Open dashboard
- Create/edit one opportunity
- Check reminder alert behavior
- Confirm filters on opportunities page

4. Then commit/push if everything is good.
