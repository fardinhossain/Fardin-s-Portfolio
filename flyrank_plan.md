# Mandatory UI Skills Workflow

Before implementing the FlyRank AI internship page redesign at `/experience/flyrank-ai`, use the official `ui-skills` CLI.

## Step 1 — Load UI Skills

Run:

```bash
npx ui-skills start
```

Follow the CLI's routing instructions. Inspect available skill categories and select the smallest set of relevant skills for this redesign. Do not skip this step or merely claim that the skills were used.

For this broad, interactive page redesign, prioritize:

- **frontend-design** — for distinctive visual direction, typography, storytelling layout, and production-quality UI.
- **frontend-ui-engineering** — for responsive implementation, component architecture, accessibility, and maintainable code.
- A relevant **animation or interaction skill**, only if the CLI determines that a third skill is useful for the timeline, leaderboard progression, and scroll-driven storytelling.

Use the CLI to inspect and load the selected skill instructions. Do not load more than three skills.

## Step 2 — Apply the Skills to the Existing Page

After loading the skills, inspect the existing portfolio codebase before modifying it.

Use the selected skill guidance to:

1. Establish a distinctive design plan based on the actual FlyRank internship journey.
2. Audit the current page and identify the causes of incomplete dark mode, unreadable text, and inconsistent surfaces.
3. Redesign the page as a cohesive story, from internship confirmation through both tracks, assignments, capstones, certifications, leaderboard achievements, reports, and recommendation letter.
4. Implement the page using the existing framework, theme system, and animation dependencies where appropriate.
5. Make the design responsive across desktop, tablet, and mobile.
6. Verify all achievements, documents, dates, and links against real evidence rather than inventing missing information.
7. Test both themes, scrolling behavior, interactions, accessibility, and the production build.

## Step 3 — Critique and Refine

Do not stop after the first implementation.

Review the actual rendered page, using browser screenshots when available. Check whether the design feels specific to my four-month Machine Learning internship rather than resembling a generic portfolio template.

Fix visual inconsistencies, weak hierarchy, unreadable text, excessive decoration, broken responsive layouts, and disconnected animations.

Preserve all requirements in the original FlyRank AI redesign prompt. The UI Skills workflow must improve the execution of that prompt, not replace or weaken its requirements.

## Step 4 — Report Honestly

At completion, report which skills were loaded, which components were redesigned, what was tested, whether the production build succeeded, and what remains incomplete.

Do not claim that the CLI ran, a skill was loaded, an artifact was verified, or a deployment succeeded unless that action actually occurred.


# Full Redesign: My Four-Month FlyRank AI Internship Journey

**Target page:** https://fardinflyrankai.vercel.app/experience/flyrank-ai

**Project:** Existing personal portfolio website

**Task:** Completely redesign the FlyRank AI experience page into a premium, interactive, evidence-based storytelling experience that presents my entire four-month journey as a Machine Learning Intern.

Do not make superficial CSS adjustments or merely add new cards to the existing layout. Inspect the current implementation and redesign the entire page structure, visual hierarchy, content presentation, interactions, and theme system for this page.

The final result should feel like an editorial case study combined with an interactive career timeline, research portfolio, and professional internship report.

The page should communicate not just what I achieved, but how I progressed from joining the internship to completing assignments, finishing both tracks and their capstones, earning certifications, improving my leaderboard standing, and reaching the final evaluation stage.

**Design priorities:**

1. A compelling story from beginning to end.
2. Correct and consistent light and dark themes across the entire page.
3. Clear presentation of my Machine Learning achievements and national leaderboard position.
4. Interactive progress timeline, leaderboard visualization, certificate gallery, reports, and recommendation letter.
5. Clear evidence for important claims through actual documents, links, certificates, screenshots, and project artifacts.
6. Responsive design for desktop, laptop, tablet, and mobile.
7. Excellent readability, accessibility, performance, and maintainability.

---

# 1. Begin by Auditing the Existing Project

Before coding, inspect the repository and understand the current implementation.

Investigate:

- The current `/experience/flyrank-ai` page and all its child components.
- The framework, routing system, styling conventions, and dependencies.
- How light and dark themes are implemented globally.
- Any page-level background colors that override the site theme.
- Text colors, borders, cards, SVG illustrations, charts, modals, and gradient backgrounds.
- All internship-related projects, documents, screenshots, certificates, and external links.
- Existing leaderboard screenshots or historical point records.
- The actual URLs for the Internship Progress Report, Final Internship Report & Evaluation, and Recommendation Letter.
- Any duplicated components or conflicting CSS that could explain the dark-mode issues.

Reuse the project's current design system and animation library where appropriate.

Do not change unrelated portfolio pages unnecessarily. However, if the existing theme system itself is causing the page-wide dark-mode problems, fix the shared root cause rather than adding another layer of CSS overrides.

Preserve useful existing links and content, but reorganize the page completely.

# 2. Overall Visual Direction

Use a premium editorial storytelling design with a restrained, modern, technically sophisticated aesthetic.

The page should combine:

- Large, expressive editorial typography.
- Carefully structured chapter headings.
- A clear visual timeline.
- Strong numerical achievement displays.
- Interactive progress visualizations.
- Evidence-driven project and document showcases.
- Fine connecting lines, arrows, and timeline markers.
- Subtle scroll-triggered animation.
- Sophisticated light and dark color palettes.
- A consistent grid and responsive spacing system.

Think of the page as a personal internship documentary: each scroll reveals another chapter, and every chapter contributes to the complete professional story.

Avoid a generic dashboard filled with dozens of equally styled cards. Use multiple presentation styles that suit the content: an editorial hero, a chronological timeline, a milestone wall, a data visualization, detailed project panels, and professional document showcases.

Use a clear information hierarchy. The reader should understand the main story even without interacting with the animations.

## Suggested design tokens

Adapt these values to the existing site rather than introducing an incompatible design system.

**Dark theme**

- Page background: near-black or deep charcoal.
- Primary text: near-white.
- Secondary text: readable medium-light gray.
- Surface backgrounds: slightly lighter charcoal.
- Borders and dividers: subtle but visible dark-gray tones.
- Accent: warm orange-red.
- Achievement highlights: carefully selected accent colors with adequate contrast.

**Light theme**

- Page background: warm off-white.
- Primary text: near-black.
- Secondary text: readable medium-dark gray.
- Surface backgrounds: white or a very light neutral.
- Borders and dividers: light gray with sufficient definition.
- Accent: the same warm orange-red family.
- Achievement highlights: colors selected for legibility on light surfaces.

Use CSS custom properties or the project's existing theme tokens. Avoid hardcoding theme-specific colors throughout individual components.

# 3. Chapter One — The Beginning

## Hero section

Create a strong, full-width opening section that immediately communicates the scope of my journey.

Suggested eyebrow:

`MY PROFESSIONAL JOURNEY · JULY—OCTOBER 2026`

Main headline:

**FOUR MONTHS.  
TWO TRACKS.  
ONE MACHINE LEARNING JOURNEY.**

Supporting text:

"From my internship confirmation to completing assignments, building capstones, earning certifications, and reaching the top of Bangladesh's Machine Learning track leaderboard, this is the story of how I turned consistent effort into measurable progress."

Adapt the copy to remain accurate to the verified milestones.

Include a concise identification line:

**Md. Fardin Hossain**  
Machine Learning Intern · FlyRank AI

Display the four-month timeframe prominently.

### Hero visual direction

Create an editorial hero with a clear text hierarchy and an attractive visual composition.

Possible elements:

- A large typographic headline.
- A thin horizontal or vertical timeline line suggesting a journey.
- A small animated marker indicating the beginning of the story.
- A restrained orange-red gradient.
- A compact achievement preview featuring the final leaderboard position.
- A subtle scroll indicator.

Avoid excessive decorative elements. The viewer should immediately understand who I am, where I worked, and what the page documents.

Do not use fabricated logos, certificates, photographs, or organization branding.

# 4. Chapter Two — Internship Confirmation and Onboarding

## Suggested chapter heading

**IT STARTED WITH A YES.**

Explain how the internship journey began with receiving confirmation and entering the program.

Present this as the opening milestone of the story.

### Suggested timeline content

**MILESTONE 01 — CONFIRMED**

- Internship confirmation.
- Entry into the FlyRank AI internship program.
- Beginning the learning and assignment journey.
- Establishing the goals for the two tracks.

Use the actual confirmation date if it can be verified from available documents. Do not invent an exact day.

### Visual presentation

Display this chapter as the beginning of a vertical or horizontal timeline.

Include a milestone marker, a short narrative, and an optional evidence panel containing the real confirmation email, screenshot, or relevant document if one exists.

If the confirmation document is not available, present the milestone using text only. Do not create a fake confirmation letter.

Animate the timeline marker and heading into view when the chapter becomes active.

# 5. Chapter Three — Completing Both Internship Tracks

## Suggested chapter heading

**LEARN IN PARALLEL. BUILD WITH PURPOSE.**

Explain that I worked through the requirements and assignments for both internship tracks:

1. General AI Fluency.
2. Machine Learning, specifically the Applied Search Intelligence track where applicable.

Verify the precise track names from my existing portfolio content, certificates, and project artifacts before displaying them.

### Track A — General AI Fluency

Present the actual assignments and evidence associated with this track.

Use the repository and available documents to identify:

- Assignment names.
- Key learning milestones.
- Completed deliverables.
- The associated capstone.
- Relevant project links or screenshots.

Where supported by my existing records, include the AI study-coach agent and the portfolio or impact-project work completed during the track.

Do not invent assignment titles, completion dates, or evaluations.

### Track B — Machine Learning / Applied Search Intelligence

Present the actual ML assignments and associated deliverables.

Show relevant work involving:

- Search performance data.
- Data exploration and preparation.
- Machine learning experiments.
- Model or ranking-system development.
- Performance evaluation.
- Search intelligence and opportunity prioritization.

Only include technical activities that are supported by the actual project artifacts and internship records.

### Interactive presentation

Use a dual-track layout. Each track should have its own visual identity while sharing the overall page design.

A visitor should be able to explore each track and see the assignment sequence and its deliverables.

On desktop, the two tracks may appear side by side or as two parallel timelines.

On mobile, stack the tracks vertically.

Use real assignment names, statuses, links, and completion dates wherever available. If some assignments are documented only as a group, summarize them honestly instead of fabricating individual entries.

The chapter should show that progress involved completing the required work in both tracks rather than focusing only on the final ML outcome.

# 6. Chapter Four — Two Capstones Completed

## Suggested chapter heading

**TWO TRACKS. TWO CAPSTONES. REAL OUTPUT.**

Make this a major visual highlight of the page.

Explain that I completed both track capstones, demonstrating learning through concrete deliverables.

## Capstone A — General AI Fluency

Find the actual capstone artifact in the repository and present its verified:

- Name.
- Purpose.
- Main features or deliverables.
- Technologies or tools used.
- Repository or deployed link.
- Screenshots, if available.
- Lessons or outcomes supported by the artifact.

Use a large project showcase layout rather than a small generic card.

## Capstone B — Machine Learning

Feature the actual Machine Learning capstone and its strongest technical results.

Where supported by the existing research and project artifacts, present the work on decision-support content-refresh prioritization for unseen client domains.

Include key information such as:

- The problem being addressed.
- The dataset and scope.
- The experimental methodology.
- The model or ranking approach.
- Evaluation metrics.
- The final outcomes.
- Relevant notebooks, source code, reports, and paper links.

Use the correct title and repository links from the existing project.

### Verified ML metrics to investigate and display

The current page exposes these headline metrics:

- **9,961 candidate pages ranked**
- **0.78 Precision@50**
- **0.30 baseline Precision@50**
- **78.8 million rows processed with DuckDB**
- **20/20 Anthropic Academy certificates**

Validate the context and calculation of each displayed metric against the underlying project files before implementation.

The research work may contain further details, such as a mature-URL evaluation cohort, multiple client accounts, or a demand-weighted action score. Show these only when the project and evaluation report verify the precise values and meaning.

Make metric definitions accessible through brief descriptions or tooltips. Do not present scores calculated on different datasets or evaluation setups as if they were directly comparable.

### Capstone design

Use a cinematic case-study layout with:

- A strong project title.
- A concise problem statement.
- A methodology or pipeline illustration derived from the actual implementation.
- A small set of important results.
- Links to source code, notebook, paper, or deployment.
- An optional expandable methodology section.

Avoid adding fabricated architectural diagrams or claiming features that are not implemented.

# 7. Chapter Five — Twenty Certifications in Four Months

## Suggested chapter heading

**TWENTY CERTIFICATIONS. CONTINUOUS LEARNING.**

Give the Anthropic Academy learning milestones their own dedicated section.

Show:

**20 / 20 ANTHROPIC ACADEMY CERTIFICATES**

Supporting narrative:

"Alongside my internship assignments and capstone work, I completed 20 Anthropic Academy certificates during the four-month journey."

Verify the number and the issuer against the actual certificates before publication.

### Certificate gallery

Build an elegant, responsive certificate collection.

Each certificate entry should support:

- The real course title.
- The certificate image or PDF, when available.
- Completion date, when documented.
- A link to the certificate or verification page, when one exists.

Use a clean grid or compact list with search, filters, or progressive disclosure if there are many entries.

Selecting a certificate should open an accessible preview modal or a real document link.

Include an optional category filter if the certificate metadata supports meaningful categories.

Do not generate substitute certificates, fake verification links, or invented course completion dates.

If the 20 certificates cannot all be found in the repository or current links, identify the missing records and make the gallery data-driven so the verified entries can be added without restructuring the page.

# 8. Chapter Six — Climbing the Leaderboard

## Suggested chapter heading

**CONSISTENCY TURNED INTO RANK.**

This chapter must clearly communicate my national Machine Learning leaderboard achievement.

Use two separate, highly visible statistics:

**#1 IN BANGLADESH**  
Machine Learning track

**#23 OVERALL IN BANGLADESH**  
Overall national leaderboard

Preserve the distinction between these rankings. Do not imply that I was ranked first overall in every track or first globally unless separate evidence supports that statement.

Add a clear note identifying the leaderboard, the ranking category, and the relevant snapshot date or period.

## Interactive leaderboard story

Explain the progression: I completed the required assignments and other eligible tasks, accumulated points, and improved my standing over time.

Build a visual progression section with:

- An initial milestone.
- Intermediate verified ranking snapshots.
- Visible completed-task milestones.
- Point totals when records are available.
- The final ML track rank.
- The final overall national rank.

Use an animated line chart, milestone staircase, or progressive rank visualization.

An effective presentation would show the journey moving toward the final #1 Bangladesh ML-track position, with the final milestone visually emphasized.

### Critical data requirements

Find the actual leaderboard screenshots, records, or data available in the project files.

Use verified historical snapshots to build the chart.

Do not invent intermediate ranks, points, dates, or point increases merely to make the animation look convincing.

If the actual history is incomplete, display the verified final rankings alongside a milestone timeline of documented completed tasks. Label incomplete historical data clearly.

If only a final leaderboard screenshot is available, use it as evidence for the final standing rather than fabricating a historical chart.

Make the leaderboard visualization understandable without animation, including for keyboard and screen-reader users.

## Evidence of the final achievement

Provide a clearly visible action to inspect the actual leaderboard evidence.

Possible evidence includes:

- A genuine leaderboard screenshot.
- A public leaderboard URL.
- An archived ranking page.
- A dated official program record.

Use whatever real evidence is available.

The final visual treatment should communicate an important accomplishment without making unsupported claims.

# 9. Chapter Seven — Internship Progress Report

Create a dedicated section titled:

**INTERNSHIP PROGRESS REPORT**

This section should demonstrate how the journey developed, what work was completed, and how progress was measured.

Do not treat it as another project card. Present it as a professional report archive integrated into the story.

### Required content

Inspect the current repository and available documents for the actual progress report.

If a real report exists, surface:

- The report title.
- Coverage period.
- Key completed assignments.
- Both track milestones.
- Capstone progress.
- Certifications completed by the reporting date.
- Documented feedback or evaluation.
- A link to view or download the original report.

### Interactive presentation

Use a report-preview panel with:

- A clear document title.
- Brief description.
- Reporting period.
- Relevant verified highlights.
- A button to open or download the actual report.

If the PDF is accessible and its contents can be previewed safely, include an accessible PDF preview or document modal.

Preserve the original document content. Do not invent report entries or imply it was officially approved if there is no evidence.

If the original progress report is missing, show a transparent "Report document not yet linked" state in the development data rather than creating a fake official report.

# 10. Chapter Eight — Final Internship Report & Evaluation

Create another dedicated section titled exactly:

**FINAL INTERNSHIP REPORT & EVALUATION**

This is an important part of the professional story and should look distinct from the general progress report.

### Report contents

Find and present the actual final report and documented evaluation records.

Where supported by the real documents, surface:

- Internship duration.
- Completed tracks.
- Assignment completion summary.
- Both completed capstones.
- Technical work and project outcomes.
- Certification summary.
- Final evaluation result or feedback.
- Documented strengths and areas for improvement.
- Final report PDF or official document link.

Use a structured report interface with a clear heading, a summary of verified outcomes, and a prominent link to the original document.

If the final evaluation includes a score or rating, display it only when the exact score and evaluation criteria are documented.

Do not assign yourself an invented score, grade, distinction, or supervisor endorsement.

### Visual treatment

Make this section feel like the culmination of the work.

Use a restrained, premium report-cover composition with a document preview, summary metrics, and a clear action to inspect the report.

The section may reveal its major findings progressively as the user scrolls, but the report title and access link must remain obvious.

# 11. Chapter Nine — Recommendation Letter

Create a dedicated professional section titled:

**RECOMMENDATION LETTER**

This section should present my recommendation letter as a formal professional document, not merely mention it in passing.

### Required behavior

First, locate the actual recommendation letter or its official, authorized URL.

If available:

- Show the real document title.
- Show the issuing organization or authorized signatory as stated in the document.
- Provide a preview of the real letter.
- Provide a clear button to open or download it.
- Preserve the letter's actual content, formatting, and signature.
- Display verification information only if it exists.

The design may include a document-paper preview or a clean letterhead-style container, provided it accurately represents the real document.

Do not fabricate official FlyRank branding, signatures, endorsements, letter text, or verification IDs.

If the letter is not yet available, provide a polished placeholder state explaining that the actual document has not been linked. Keep the document link configurable so the real letter can be connected later.

Do not imply the letter has been issued, received, or signed unless the evidence supports that status.

# 12. Chapter Ten — Final Reflection

## Suggested heading

**THE WORK BEHIND THE RESULTS.**

Conclude the journey with a short reflection about what I learned through four months of consistent work.

Focus on:

- Applying machine learning to practical problems.
- Learning through assignments and structured requirements.
- Completing two distinct capstone projects.
- Improving technical and analytical skills.
- Building evidence of work through notebooks, code, reports, and certificates.
- Learning how consistent task completion can contribute to measurable progress.

Use factual language based on the project record. Avoid generic claims such as "I mastered AI" or unsupported statements about professional impact.

### Closing visual

Bring together a few of the strongest verified accomplishments:

- 2 completed track capstones.
- 20 completed Anthropic Academy certificates.
- The final ML-track ranking in Bangladesh.
- The overall national leaderboard position.
- The documented ML evaluation results.

Use these as a final summary only after verifying each item.

Finish with a tasteful transition into the next section of the portfolio and links to the actual ML project, repository, research paper, and relevant reports.

Suggested closing statement:

"Four months of work became more than a list of completed tasks. It became a record of experimentation, execution, learning, and measurable progress."

Use this as draft copy and adapt it to the real story.

# 13. Interactive Storytelling and Scroll Animation

Make the entire page feel like one continuous story.

Use scroll-triggered animations to reveal chapter headings, timeline milestones, achievement figures, capstone details, certification previews, leaderboard highlights, and report sections.

### Animation principles

- Use smooth opacity and vertical-position transitions.
- Draw timeline connectors progressively.
- Animate numerical counters when they enter the viewport.
- Emphasize the leaderboard's final positions with one restrained highlight animation.
- Reveal report previews and certificate tiles progressively.
- Use subtle changes in background or accent styling between chapters.
- Provide a clear visual indication of story progress.

Avoid making each component animate independently without a coherent relationship to the story.

### Scroll behavior

The visitor must retain normal scrolling control.

Do not force scroll snapping, lock the page for long sequences, or require users to wait through animations.

The experience should work when visitors scroll quickly, slowly, or backward.

A sticky timeline or visual progress marker may be used on desktop, provided it does not reduce readability.

On mobile, use standard document flow with lightweight reveal animations rather than forcing long pinned sequences.

Keep all important text and links available in the document regardless of whether animations run.

# 14. Complete Light and Dark Mode Fix

This is a critical requirement.

The existing dark theme does not consistently darken the entire page, and some text becomes hard to read. Fix the actual theme implementation rather than hiding these problems with isolated overrides.

## Page-wide dark mode

Ensure dark mode applies correctly to every visible part of the page, including:

- Main page background.
- Hero and chapter backgrounds.
- Navigation and breadcrumbs.
- Timeline and milestone labels.
- Cards, panels, and project showcases.
- Assignment and capstone content.
- Metric displays and chart areas.
- Leaderboard and data visualizations.
- Certificate gallery and preview dialogs.
- Internship Progress Report.
- Final Internship Report & Evaluation.
- Recommendation Letter section.
- Modal backdrops, tooltips, dropdowns, and popovers.
- Buttons, links, icons, borders, dividers, and hover states.
- Footer and any page-level secondary navigation.

No large white or light-colored surface should accidentally remain when dark mode is active, unless the surface represents an actual document preview that should retain its original appearance.

Audit component-level backgrounds, inline styles, inherited colors, SVG fills, pseudo-elements, and portal-rendered overlays.

Make sure the theme change affects all these elements consistently.

## Text readability

In dark mode, all headings, descriptions, small labels, timeline dates, metadata, tooltips, chart labels, and button text must remain clearly readable.

Avoid:

- White text on light gray.
- Gray text on similarly gray backgrounds.
- Dark text on near-black surfaces.
- Low-contrast accent text.
- Invisible borders and timeline markers.
- Muted metadata that becomes unreadable.

Apply equivalent contrast checks to light mode.

Aim to meet WCAG AA contrast requirements for text and interactive controls wherever applicable.

## Theme behavior

- Reuse the existing global theme system.
- Keep the appearance consistent when navigating to this page.
- Ensure the theme toggle continues to work.
- Persist theme preference according to the existing application behavior.
- Avoid flashes of the wrong theme on page load.
- Ensure charts, SVGs, and animated elements adapt to theme changes.
- Preserve document previews' original content and appearance where necessary.

Do not create a second conflicting theme state for this page.

# 15. Data Integrity and Content Management

Make the page content data-driven instead of scattering milestone text, dates, certificate links, and leaderboard values across multiple components.

Use a suitable data structure for:

- Internship milestones.
- Track names.
- Assignments.
- Capstone details.
- Certificates.
- Leaderboard snapshots.
- Progress report metadata.
- Final report metadata.
- Recommendation letter metadata.
- External project links.

Separate display components from the source data so the content can be updated without rewriting the layout.

### Accuracy requirements

Before publishing information:

1. Verify milestone dates from available records.
2. Verify the exact names of both tracks.
3. Verify capstone titles and live URLs.
4. Check all 20 certificates against real records.
5. Validate leaderboard rank and ranking category.
6. Validate the final metrics against the underlying research and evaluation data.
7. Verify the original progress and final reports.
8. Verify the recommendation letter and its actual issue status.

Do not invent missing documents, scores, point totals, progress percentages, intermediate rankings, evaluations, endorsements, or signatures.

When data is missing, make the design gracefully handle that situation without displaying fake content.

# 16. Desktop, Tablet, and Mobile Responsiveness

Make the page look intentional and polished at every size.

### Desktop

Use the full editorial layout, richer timeline visualization, side-by-side track presentation, large achievement figures, and detailed document previews.

### Tablet

Adjust the grid, reduce decorative density, stack content where needed, and ensure charts and report previews remain legible.

### Mobile

- Use a single-column story layout.
- Keep headline widths controlled.
- Break long headings into intentional lines.
- Stack both track sections vertically.
- Make timeline markers and connectors readable.
- Use horizontally scrollable certificate galleries only when appropriate and accessible.
- Ensure report and document links fit the available width.
- Scale charts to the viewport and retain readable axis labels.
- Keep buttons comfortable to tap.
- Prevent long words, titles, or numerical metrics from causing horizontal scrolling.
- Avoid content being hidden underneath sticky navigation.
- Keep theme switching and all interactions accessible.

Test at representative widths, including 360px, 390px, 768px, 1024px, 1280px, 1440px, and 1920px.

The layout should respond fluidly at intermediate sizes. Do not optimize for a single screenshot.

# 17. Accessibility and Motion Preferences

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- Disable or simplify scroll-linked movement.
- Avoid long pinned timelines.
- Replace large transitions with minimal fades or static layouts.
- Do not require a user to scroll through an animated sequence to access information.
- Preserve the same text, links, evidence, charts, and documents.

Use semantic HTML, correct heading order, keyboard-accessible controls, meaningful link labels, visible focus indicators, and accessible modal behavior.

Do not communicate leaderboard rank, completion, or evaluation status using color alone.

Provide textual summaries for charts and important visual milestones.

# 18. Technical Implementation and Performance

Use the current project architecture and existing animation library wherever possible.

If the project uses Motion for React or Framer Motion, consider its supported scroll-linked and scroll-triggered APIs. If it already relies on GSAP ScrollTrigger for pinned timelines, reuse it where appropriate.

Do not introduce multiple animation libraries without a strong reason.

Use SVG for lightweight timeline connectors and simple diagrams. Use a real charting library only if it is already suitable for the project or provides a meaningful benefit.

Optimize document previews, certificate images, and other assets. Avoid loading every large certificate or report eagerly.

Ensure animations do not cause noticeable layout shifts or make scrolling feel sluggish.

Clean up animation instances and event listeners correctly.

Verify that the page remains functional when an image, certificate preview, external link, or optional animation fails to load.

# 19. Implementation Workflow

Follow this sequence.

## Phase A — Audit and evidence gathering

Inspect the existing page, repository, content, reports, certificates, project links, leaderboard records, and theme implementation.

Create an inventory of verified assets and missing assets before designing the final data structure.

## Phase B — Content architecture

Create a clear sequence of story chapters, using actual internship milestones and evidence.

Separate documented facts from narrative descriptions and ensure unsupported details are excluded.

## Phase C — Visual redesign

Build the new hero, chronological timeline, dual-track assignment section, capstone showcases, certificate gallery, leaderboard visualization, reports, recommendation letter, and final reflection.

## Phase D — Interaction and motion

Coordinate timeline progress, chapter reveals, number animations, certificate previews, report links, and leaderboard transitions.

Make the experience coherent in both scroll directions.

## Phase E — Theme and responsive refinement

Resolve the page-wide light and dark mode issues, verify every text and surface color, and implement mobile-first responsive layouts.

## Phase F — Validation

Test all chapters, documents, external links, theme switching, chart displays, responsive widths, reduced-motion behavior, and existing navigation.

Run the production build and resolve relevant errors.

# 20. Required Testing

Do not declare completion merely because the code compiles.

Verify:

- The entire page uses the correct dark background in dark mode.
- No unintended light surfaces or unreadable text remain.
- Light mode is equally readable.
- All story chapters appear in the correct order.
- Scrolling backward works naturally.
- The two tracks are presented accurately.
- Both capstones link to the correct artifacts.
- The 20 certificates are real and accessible.
- The #1 Bangladesh ML-track ranking is clearly distinguished from the #23 overall national ranking.
- Any leaderboard progression chart uses real historical data.
- Internship Progress Report and Final Internship Report & Evaluation link to the correct documents.
- The recommendation-letter section reflects the document's actual availability and issue status.
- All charts and document previews work on mobile.
- There is no horizontal overflow or clipped text.
- Reduced-motion preferences are respected.
- Keyboard navigation and modal interactions work.
- The production build succeeds.
- Existing portfolio functionality remains intact.

If browser automation is available, capture screenshots in both themes at desktop and mobile viewport sizes. Inspect the rendered results rather than relying on code review alone.

# 21. Final Deliverables

After completing the implementation, provide a concise report that identifies:

1. Files and components redesigned.
2. Root causes of the light/dark theme inconsistencies.
3. New storytelling sections and interactions.
4. Real documents, certificates, capstone links, and evidence that were connected.
5. Any missing evidence or documents that still require a real URL or asset.
6. Desktop, tablet, and mobile sizes tested.
7. Theme, accessibility, and functional test results.
8. Production build and deployment status.

Do not claim that a document was linked, a ranking was independently verified, or a deployment succeeded unless it actually did.

## Final Design Principle

Make this page read like a four-month professional journey, not a resume pasted into a website.

The visitor should experience the story in order:

**CONFIRMATION → TWO TRACKS → ASSIGNMENTS → TWO CAPSTONES → 20 CERTIFICATIONS → LEADERBOARD PROGRESS → #1 IN BANGLADESH (ML TRACK) → #23 OVERALL IN BANGLADESH → PROGRESS REPORT → FINAL REPORT & EVALUATION → RECOMMENDATION LETTER.**

Use each section to answer a specific question: Where did the journey begin? What work did I complete? What did I build? How did I measure progress? What did I achieve? Where is the evidence?

The finished page must look polished in both themes, remain readable on every device, and support its most important claims with real evidence.