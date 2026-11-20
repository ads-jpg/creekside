# GHL Build Brief: Dan @ Nexa Mortgage (Reverse Mortgage Follow-Up)

## Instructions for Claude (paste this whole file into a Claude Desktop chat with Chrome connected)

Use Claude in Chrome. I am logged into Go High Level. Switch to Dan's (Nexa Mortgage) sub-account and build the workflows below under **Automation → Workflows → Create Workflow → Start from Scratch**.

Rules:
- **Do NOT change the pipeline.** Don't add, rename, reorder or delete stages. Only select existing stages in workflow actions.
- Existing pipeline stages: New Lead, Contacted, Qualified, Proposal Sent, Negotiation. "Closed" and "cold" use the opportunity **Status** (Won / Abandoned / Lost), not stages.
- Leave every workflow in **Draft**. Do not publish. I'll review and publish myself.
- Do not send any messages to real contacts.
- Leave anything in [BRACKETS] as-is if I haven't filled it in, and list those for me at the end.
- If a trigger or action name differs from what's written here, pick the closest match and tell me what you chose.
- Ask me before doing anything not listed here.
- When finished, give me a list of every workflow you created and anything you couldn't do.

Placeholders to fill in before building (or leave them in brackets):
- [CALENDAR LINK] =
- [DAN'S PHONE] =
- [GOOGLE REVIEW LINK] =
- [HUD COUNSELOR LIST LINK] = https://apps.hud.gov/offices/hsg/sfh/hcc/hcs.cfm (or HUD's current counselor search page)

Emails do not include a typed signature. Dan's email signature in GHL (name, title, NMLS numbers, Equal Housing Opportunity) is added to every email automatically. Do not type a signature into the emails.

Tags used in these workflows: `reverse-lead` (added in Workflow 1) and `reverse-nurture` (added in Workflow 4, removed in Workflow 4b). Create them if they don't exist yet.

Workflow-wide settings unless noted: **Time Window 9am–7pm** (contact's time zone), **Allow Re-entry OFF**.

---

## Workflow 1: Reverse – New Inquiry
- **Trigger:** Form Submitted (Dan's reverse mortgage form) and/or Facebook Lead Form Submitted. If leads already create opportunities automatically, use "Opportunity Created" in the existing pipeline instead and skip the Create Opportunity action.
- **Settings:** Stop on Response ON.
- **Goal event:** Appointment booked → contact exits.

Actions in order:
1. Create/Update Opportunity → existing pipeline, Stage **New Lead**
2. Add Tag `reverse-lead`
3. SMS:
   > Hi {{contact.first_name}}, this is Dan with Nexa Mortgage. Thank you for asking about a reverse mortgage. I'll give you a call shortly, or you can pick a time that suits you: [CALENDAR LINK]. Reply STOP to opt out.
4. Email. Subject: **Thank you for your inquiry, {{contact.first_name}}**
   > Hi {{contact.first_name}},
   >
   > Thank you for reaching out. I'm Dan, a reverse mortgage specialist with Nexa Mortgage.
   >
   > Every situation is different, so the best first step is a relaxed conversation about your goals: lowering monthly expenses, adding to retirement income, or having a line of credit for the future. There's no obligation, and you're welcome to have a spouse or family member join us.
   >
   > You can pick a time here: [CALENDAR LINK]
   > Or call me directly at [DAN'S PHONE].
   >
   > Warm regards,
5. Internal Notification (SMS to Dan): `New reverse mortgage inquiry: {{contact.name}} {{contact.phone}}. Call now.`
6. Wait 1 day → SMS:
   > Hi {{contact.first_name}}, Dan from Nexa Mortgage again. I'd be glad to answer any questions about how a reverse mortgage works. Is there a good time for a short call?
7. Wait 2 days → Email. Subject: **The most common reverse mortgage questions**
   > Hi {{contact.first_name}},
   >
   > Here are the questions I hear most:
   >
   > Do I still own my home? Yes. You keep the title and ownership.
   >
   > Do I have to make monthly payments? No monthly mortgage payment is required. You still need to pay property taxes, homeowners insurance and keep up the home.
   >
   > What about my heirs? When the loan comes due, your heirs can keep the home by paying off the loan, or sell it. Any remaining equity belongs to them. With an FHA-insured HECM, they'll never owe more than the home is worth.
   >
   > Happy to go over your situation anytime: [CALENDAR LINK]
8. Wait 4 days → SMS:
   > Hi {{contact.first_name}}, many families like to talk this over together. If you'd like your kids or a family member on our call, that's completely welcome. [CALENDAR LINK]
9. Wait 7 days → Email. Subject: **Is a reverse mortgage right for you?**
   > Hi {{contact.first_name}},
   >
   > A reverse mortgage isn't for everyone, and I'll always tell you honestly if it doesn't fit. It tends to work best for homeowners who:
   > - Are 62 or older
   > - Plan to stay in their home long-term
   > - Have good equity built up
   > - Want more breathing room in their monthly budget
   >
   > If that sounds like you, I'd be glad to run a no-cost estimate: [CALENDAR LINK]
10. Wait 7 days → SMS:
    > Hi {{contact.first_name}}, I don't want to be a bother, so this is my last check-in for now. Whenever you're ready to talk, just reply or call me at [DAN'S PHONE]. Dan
11. Update Opportunity → Status **Abandoned**. (This is intentional: it starts Workflow 4, the long-term nurture. Contacts who replied STOP are on DND and GHL won't message them.)

## Workflow 1b: Reverse – Lead Replied
- **Trigger:** Customer Replied. Filters: has tag `reverse-lead` AND does not have tag `reverse-nurture` (nurture replies are handled by Workflow 4b).
- **Settings:** Allow Re-entry ON (so a later reply from a new lead is still caught).
1. If/Else: Opportunity pipeline stage is **New Lead**
   - **Yes:** Update Opportunity → Stage **Contacted**; Internal Notification to Dan: `{{contact.name}} replied! Check Conversations.`
   - **No:** End (don't move opportunities that are already past New Lead back to Contacted).

---

## Workflow 2: Reverse – Appointment Booked
- **Trigger:** Appointment Status = Booked (Dan's consultation calendar)
- **Settings:** Allow Re-entry ON (so a contact who rebooks after a no-show or reschedule gets a new confirmation and reminders).
1. Update Opportunity → Stage **Contacted**. If the opportunity is already at Qualified or later, skip this step for them (use an If/Else on stage = New Lead).
2. SMS:
   > Thank you, {{contact.first_name}}. You're scheduled for {{appointment.start_time}}. I'll call you at this number. Dan, Nexa Mortgage
3. Email. Subject: **Your appointment is confirmed**
   > Hi {{contact.first_name}},
   >
   > Our call is set for {{appointment.start_time}}. You're welcome to include anyone you'd like.
   >
   > It helps (but isn't required) to have these nearby:
   > - Your most recent mortgage statement, if you have one
   > - A property tax bill
   > - Your homeowners insurance declarations page
   >
   > Talk soon,
4. Wait until 24 hours before appointment → SMS:
   > Hi {{contact.first_name}}, a friendly reminder of our call tomorrow at {{appointment.start_time}}. Reply here if you need a different time.
5. Wait until 2 hours before appointment → SMS:
   > Looking forward to our call today, {{contact.first_name}}. Dan

## Workflow 2b: Reverse – No-Show
- **Trigger:** Appointment Status = No Show, filter: **Dan's consultation calendar** (same calendar as Workflow 2)
- **Settings:** Allow Re-entry ON (a contact can no-show more than once).
1. SMS:
   > Hi {{contact.first_name}}, sorry we missed each other today. No problem at all. Would you like to pick another time? [CALENDAR LINK]
2. Wait 2 days → If/Else: no appointment booked → Internal Notification to Dan: `{{contact.name}} missed their appointment and hasn't rebooked. Give them a personal call.`

---

## Workflow 3: Reverse – Proposal Sent
- **Trigger:** Pipeline Stage Changed → **Proposal Sent**
- **Settings:** Stop on Response ON
1. Wait 2 days → SMS:
   > Hi {{contact.first_name}}, did you have a chance to review the estimate I sent? I'm happy to walk through it with you or your family.
2. Wait 3 days → Email. Subject: **Questions about your estimate?**
   > Hi {{contact.first_name}},
   >
   > Reverse mortgage estimates have a lot of numbers on them, and it's normal to have questions. I'm glad to go through it line by line with you, or with your family or financial advisor.
   >
   > Pick a time here: [CALENDAR LINK]
3. Wait 2 days → Internal Notification to Dan: `{{contact.name}} hasn't responded to the proposal in 7 days. Call to follow up.`

## Workflow 3b: Reverse – HUD Counseling
- **Trigger:** Pipeline Stage Changed → **Negotiation**
1. Email. Subject: **Your next step: HUD counseling**
   > Hi {{contact.first_name}},
   >
   > The next step is a short session with an independent, HUD-approved counselor. It's required for every reverse mortgage and is there to make sure you have all the facts. The counselor doesn't work for Nexa Mortgage.
   >
   > You can find an approved counselor here: [HUD COUNSELOR LIST LINK]. Once you've finished, send me your counseling certificate and we'll move forward.
2. Wait 5 days → SMS:
   > Hi {{contact.first_name}}, just checking whether you've been able to schedule your HUD counseling session. Let me know if I can help.
3. Wait 5 days → Internal Notification to Dan: `{{contact.name}} may still need to complete HUD counseling. Follow up.`

## Workflow 3c: Reverse – Stale Opportunity Alert
- **Triggers (add two triggers to this one workflow):**
  - Stale Opportunities: In pipeline = existing pipeline, Pipeline stage = **Qualified**, Duration in days = **10**
  - Stale Opportunities: In pipeline = existing pipeline, Pipeline stage = **Negotiation**, Duration in days = **10**
  - (If the Pipeline stage filter accepts more than one stage, one trigger with both stages is fine.)
- **Settings:** Allow Re-entry ON. The trigger fires again every 10 days an opportunity stays stuck, and the clock resets when the opportunity moves or is updated. With re-entry off, Dan would only be alerted the first time.
- Action: Internal Notification to Dan: `{{contact.name}} has had no activity in {{opportunity.pipeline_stage}} for 10 days. Worth a check-in.` (If the stage merge field isn't available, use: `{{contact.name}}'s opportunity has had no activity for 10 days. Worth a check-in.`)

---

## Workflow 4: Reverse – Long-Term Nurture
- **Trigger:** Opportunity Status Changed → **Abandoned** or **Lost** (existing pipeline)
- **Settings:** Stop on Response ON
1. Add Tag `reverse-nurture`
2. Wait 14 days → Email. Subject: **Aging in place: making your home work for you**
   > Hi {{contact.first_name}},
   >
   > Many homeowners want to stay in the home they love for as long as possible. Some use a reverse mortgage to fund home updates like walk-in showers, ramps or a first-floor bedroom.
   >
   > If you'd ever like to explore that, I'm here.
3. Wait 30 days → Email. Subject: **What happens to the home for my heirs?**
   > Hi {{contact.first_name}},
   >
   > One of the most common questions I get is what a reverse mortgage means for your family. When the loan comes due, your heirs can keep the home by paying off the loan balance, or sell the home and keep any remaining equity. With an FHA-insured HECM, they will never owe more than the home is worth.
   >
   > I'm always happy to talk it through with you and your family together.
4. Wait 3 days → SMS:
   > Hi {{contact.first_name}}, Dan from Nexa Mortgage checking in. If any questions have come up about a reverse mortgage, I'm always glad to help.
5. Wait 30 days → Email. Subject: **The reverse mortgage line of credit**
   > Hi {{contact.first_name}},
   >
   > Not everyone knows that a reverse mortgage can be set up as a line of credit. Any unused portion can grow over time, and some homeowners keep it as a safety net for future healthcare costs or emergencies.
   >
   > Want to see what that could look like for you? Just reply.
6. Wait 30 days → Email. Subject: **3 common myths about reverse mortgages**
   > Hi {{contact.first_name}},
   >
   > Myth: "The bank takes your home." Fact: You keep the title and ownership.
   > Myth: "You can't leave anything to your kids." Fact: Any remaining equity goes to your heirs.
   > Myth: "You'll owe more than the house is worth." Fact: FHA-insured HECMs are non-recourse loans.
   >
   > You do still need to pay property taxes, homeowners insurance and keep up the home. Questions? Just reply.
7. Wait 14 days → SMS:
   > Hi {{contact.first_name}}, hope you're doing well. Still here whenever you'd like to revisit your options. Dan

## Workflow 4b: Reverse – Nurture Reply
- **Trigger:** Customer Replied. Filter: has tag `reverse-nurture`.
- Actions:
  1. Update Opportunity → Status **Open**, Stage **Contacted**
  2. Remove Tag `reverse-nurture`
  3. Remove from Workflow → **Reverse – Long-Term Nurture** (Workflow 4)
  4. Internal Notification to Dan: `{{contact.name}} replied to nurture. Call them.`

---

## Workflow 5: Reverse – Loan Funded
- **Trigger:** Opportunity Status Changed → **Won**
1. SMS:
   > Congratulations, {{contact.first_name}}! Your reverse mortgage has funded. It's been a privilege working with you. Dan
2. Wait 5 days → SMS:
   > Hi {{contact.first_name}}, I hope everything is going smoothly. If you were happy with my help, a short review would mean a great deal: [GOOGLE REVIEW LINK]. Thank you!
3. Wait 30 days → Email. Subject: **Do you know someone who could benefit?**
   > Hi {{contact.first_name}},
   >
   > Many of my clients hear about me from friends, neighbors or church groups. If you know another homeowner 62 or older who might want to learn about their options, I'd be honored to help them the way I helped you: [DAN'S PHONE].
4. Wait 335 days → Email. Subject: **Your yearly reminder**
   > Hi {{contact.first_name}},
   >
   > Just a friendly yearly reminder to keep your property taxes and homeowners insurance current. It's an important part of keeping your loan in good standing. If anything changes or you have questions, call me anytime.
