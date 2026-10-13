# Time game — Story mode (design draft)

A storyline version of the Grammar Coach "Past · Present · Future" game (PR #96). Instead of
unrelated questions about the learner's own life, a short story is told through questions. The
three columns fill up with the story: **Past** = what happened, **Present** = the situation now,
**Future** = what happens next.

## Decisions so far (2026-10-13)

| Question | Decision |
|---|---|
| Learner's role | A character with a **fact card**: answers in character, using the card's facts |
| Script | **Fixed** hand-written questions; the AI only checks answers (as in the current game) |
| Ending | All three: a **final decision**, an **outcome** that depends on the answers, and an **AI write-up** of the story |
| First content | A **pack of 3 short stories** at different levels |

## How a story plays

1. **Briefing:** the scene and the learner's fact card. The card stays visible in chat mode. In
   oral mode it can be hidden as a memory challenge (open question below).
2. **Six questions** in story order (not shuffled), two per column. Each answer is checked for:
   - **tense:** the verb form fits the question's time (same as today);
   - **facts:** the answer doesn't contradict the card (new). An answer in the right tense that
     contradicts the card ("I was sleeping" when the card says "making coffee") gets one retry
     with a hint pointing at the card.
   - Wrong twice → a model answer, and the line goes into its column greyed out, so the story
     stays complete.
3. **Final decision:** the learner makes a choice (a suspect, the offer, a suitcase) and gives a
   one-sentence reason, typed or spoken. The AI checks whether the reason matches the clues.
4. **Outcome:** an ending chosen by rules (below) from the decision and the six answers.
5. **Write-up:** the AI turns the learner's own answers into a short document in the story's
   style (witness statement, meeting notes, luggage report), with the learner's corrected
   sentences. It's shown with a "Listen" button.

AI calls per story: 6–12 checks (with retries) + 1 decision check + 1 write-up.

---

## Story 1 — Lost luggage at the airport (A2)

**Scene:** You've just landed in Dublin. Your suitcase didn't arrive. You're at the lost-luggage desk.

**Fact card**
- You flew from Budapest this morning on flight AV 215.
- You last saw your suitcase at check-in in Budapest at 6 am.
- Your suitcase is big and blue, with a yellow ribbon on the handle.
- Inside there are clothes, a camera and a present for your aunt.
- You're staying at your aunt's house, 14 Green Street, for a week.
- On Saturday you're going to a wedding — your best clothes are in the suitcase!

| # | Column | Question (officer) | Expected |
|---|---|---|---|
| 1 | Past | Which flight did you come on, and where did you fly from? | past simple |
| 2 | Past | When did you last see your suitcase? | past simple |
| 3 | Present | What does your suitcase look like? | present simple |
| 4 | Present | What's inside it? | present simple / there is |
| 5 | Future | Where are you going to stay in Dublin? | going to / present continuous |
| 6 | Future | When do you need your suitcase? Do you have any plans this week? | present continuous / going to |

**Final decision:** "We've found three blue suitcases. Which one is yours?"
A: big, blue, red ribbon · **B: big, blue, yellow ribbon** · C: small blue backpack.

**Outcomes**
- Right suitcase + reason mentions the ribbon or size → *"Here you are! Enjoy the wedding."*
- Right suitcase, no clear reason → *"Hmm… OK, but please check the name tag next time."*
- Wrong suitcase → *the funny ending:* you open it at your aunt's house and find someone
  else's fishing equipment. "Let's try again tomorrow."

**Write-up:** the *Lost Luggage Report* form (flight, last seen, description, contents, address,
needed by), filled in from the learner's answers.

---

## Story 2 — The missing necklace at Hotel Danube (B1, detective)

**Scene:** A diamond necklace disappeared from room 12 last night. You're the night receptionist.
Inspector Hart is asking you questions.

**Fact card**
- You're the night receptionist. Your shift starts at 10 pm and finishes at 6 am.
- At 11:30 last night you were making coffee in the back office when you heard a loud bang upstairs.
- You ran to the 2nd floor. The door of room 12 was open. The guests, Mr and Mrs Kovács, had
  gone to dinner at 9 pm and weren't back yet.
- In the corridor you saw a tall man in a red scarf with a black bag. He ran down the back stairs.
- You've seen him before: he stayed in room 14 last week and asked a lot of questions about room 12.
- Tonight the police are watching the back door.

**Suspects** (shown at the decision)
- **Mr Novak** — stayed in room 14 last week; tall; wears a red scarf. *(the thief)*
- **Tom the waiter** — short; served the Kovács their dinner in the restaurant all evening.
- **Mrs Kovács** — the necklace is insured for a lot of money; she was at dinner from 9 pm.

| # | Column | Question (inspector) | Expected |
|---|---|---|---|
| 1 | Present | What's your job at the hotel, and when does your shift start? | present simple |
| 2 | Past | What were you doing when you heard the noise last night? | past continuous + past simple |
| 3 | Past | Had the guests already left room 12 when you got there? Where were they? | past perfect |
| 4 | Past | What did you see in the corridor? | past simple / continuous |
| 5 | Present | Have you ever seen this man before? | present perfect |
| 6 | Future | The police are watching the back door tonight. What will you do if the man comes back? | first conditional / will |

**Final decision:** "So, who took the necklace? Tell me why."

**Outcomes**
- Novak + a clue-based reason (red scarf, room 14, questions about room 12) → **Case solved.**
  "Mr Novak was arrested at the train station this morning."
- Novak, weak reason → **Case solved, just.** "You were right — but a court needs evidence."
- Tom or Mrs Kovács → **The trail goes cold.** The inspector points at the clue that clears them
  (Tom was serving dinner; Mrs Kovács was at dinner from 9 pm).
- Facts contradicted in ≥ 2 answers → the inspector adds: "Your story keeps changing…"

**Write-up:** a signed *Witness Statement* in the first person, dated today.

---

## Story 3 — The Szeged Paprika contract (B1–B2, business)

**Scene:** You're the sales manager of Szeged Paprika Ltd. Anna Weber, a buyer from FreshMarkt,
a German supermarket chain, is in your office.

**Fact card**
- A family company, founded in 1998 by your grandfather; 40 employees; paprika powder and paste.
- You've been exporting to Austria since 2015.
- Last spring a delivery to Vienna arrived two weeks late because of a truck strike. You gave
  the customer 10% off and changed transport company.
- At the moment you're building a new packing line. It will be ready in March.
- You can deliver 2,000 jars a month now, and 5,000 from April. Nothing before 1 February.
- Your limit: at most 8% discount, and only for a 12-month contract.

| # | Column | Question (buyer) | Expected |
|---|---|---|---|
| 1 | Present | Tell me about your company. What do you make, and how many people work there? | present simple |
| 2 | Present | How long have you been exporting, and where to? | present perfect (continuous) |
| 3 | Past | I heard about a late delivery to Vienna. What happened, and what did you do? | past simple |
| 4 | Present | What are you working on at the moment to grow production? | present continuous |
| 5 | Future | We need 4,000 jars a month from January. What can you promise? | will / can / going to |
| 6 | Future | What discount will you give us if we sign a 12-month contract? | first conditional |

**Final decision:** "Our offer: 4,000 jars a month from January, 12% discount. Accept, refuse
or make a counter-offer?"

**Outcomes**
- A counter-offer within the card's limits (Feb start, 2,000 → 5,000 from April, ≤ 8%) →
  **Deal signed.** "Let's shake on it."
- Accepting the offer as it stands → **Deal signed — but** you've promised what you can't
  deliver: a follow-up email in March about missed deliveries.
- Overpromising in Q5/Q6 (breaking the card's limits) → **Deal on hold:** "Your numbers don't add up."
- Refusing with no counter-offer → **No deal.** "Maybe next year."

**Write-up:** *Meeting notes* email from Anna Weber to her manager, summarising the company,
the history, the offer and the decision.

---

## Build decisions (2026-10-13)

- **Fact card:** always visible, in chat and oral mode. It sits beside the question on wide screens and above it on a phone.
- **No Hungarian translation** of the cards (the stories are English practice).
- **Where:** the Time game's setup screen has "What to play: Quick round | Story". The Chat / Oral choice applies to both.
- **Story order:** questions come in story order, so the columns fill unevenly (e.g. the detective story has 3 past, 2 present and 1 future). Each column shows its own total.
- **Missed lines** stay in their column, greyed, with the model answer the learner was shown. The write-up falls back on the fact card for them.
- **A contradiction** = any attempt at a question that contradicted the card, even if the retry fixed it. The paprika buyer remembers an overpromise.
- **AI calls:** all logged as `tense_game` and counted in the same 100-per-day limit (no new migration). A wrong choice in a choice decision is decided without an AI call.
- **XP:** `grammar-coach.exercise`, itemRef `tense-story/<id>`, same score as a quick round (1 / 0.5 / 0).
- **Later, not now:** a teacher class mode (projected stories), and second fact cards per story for replay value.

Content lives in `src/data/tenseStories.ts` and is validated by `npm run check:tense-game`.
