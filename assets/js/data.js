// ==========================================================================
// FARDIN.AI — VERIFIED PORTFOLIO & FLYRANK AI 4-MONTH JOURNEY DATA
// Source of Truth: journey.html, Fardin_Hossain_Resume.pdf, and GitHub repos
// ==========================================================================

export const PROFILE_DATA = {
  name: "Md. Fardin Hossain",
  handle: "fardin.ai",
  roleLine: "AI ENGINEER • FULL-STACK DEVELOPER • PROBLEM SOLVER",
  heroHeadlinePrefix: "Building ",
  heroHeadlineHighlight: "Intelligent Solutions.",
  heroSupportingText: "AI engineering, machine learning, and full-stack development for real-world impact.",
  location: "Dhaka, Bangladesh",
  email: "fardin.hosn@gmail.com",
  phone: "+8801992748470",
  github: "https://github.com/fardinhossain",
  linkedin: "https://www.linkedin.com/in/fardinhosn/",
  liveSite: "https://fardinflyrankai.vercel.app/",
  previousPortfolio: "https://mdfardin.vercel.app/",
  resumeUrl: "Fardin_Hossain_Resume.pdf",
  paperPdfUrl: "/paper.pdf",
  paperWebUrl: "https://fardinhossain.github.io/FlyRankAI-ML-Internship-Task/",
  flyrankVerifyUrl: "https://internship.flyrank.ai/verify/FR-D11-9E3D0-1FE2A?first_name=Md.",
  flyrankCredentialId: "FR-D11-9E3D0-1FE2A",
  heroPortrait: "/assets/images/hero-portrait-current.png",
  heroPortraitDark: "/assets/images/hero-portrait-current.png",
  heroPortraitLight: "/assets/images/hero-portrait-light.png",
  aboutPortrait: "/assets/images/fardin-portrait-brown-tee.jpg"
};

export const HERO_METRICS = [
  {
    id: "rows",
    value: "78.8M+",
    label: "Daily-Performance Rows (DuckDB)",
    icon: "database"
  },
  {
    id: "precision",
    value: "0.78 vs 0.30",
    label: "Precision@50 (Learned vs Rule)",
    icon: "target"
  },
  {
    id: "pages",
    value: "9,961",
    label: "Candidate Pages Ranked",
    icon: "layers"
  },
  {
    id: "certs",
    value: "20/20",
    label: "Anthropic Academy Certificates",
    icon: "award"
  }
];

export const PROJECT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ai-ml", label: "AI / ML" },
  { id: "web", label: "Web Applications" },
  { id: "systems", label: "Systems" },
  { id: "research", label: "Research" }
];

export const PROJECTS_LIST = [
  {
    id: "locationkhuji",
    title: "LocationKhuji",
    shortCategory: "Web App",
    categories: ["ai-ml", "web"],
    featured: true,
    visualType: "location",
    image: "assets/images/locationkhuji.png",
    summary:
      "AI-powered MERN location discovery platform for finding nearby flats, hospitals, pharmacies, and services across Bangladesh.",
    description:
      "Bangladesh-based MERN full-stack location discovery platform where users can find rental flats, hospitals, pharmacies, restaurants, and local services within a 1–20 km radius on interactive maps. Powered by Groq and OpenRouter LLM APIs for natural-language search in English, Bangla, and Banglish.",
    highlights: [
      "Natural-language search across English, Bangla, and Banglish powered by Groq and OpenRouter LLM APIs",
      "Interactive 1–20 km radius map discovery with real-time Socket.io updates and multi-layer search fallback",
      "Role-based authentication, owner property listings, reviews, and full Admin moderation dashboard"
    ],
    tags: ["React 19", "Node.js", "MongoDB", "Groq / OpenRouter", "Leaflet Maps", "Socket.io"],
    liveUrl: "https://locationkhuji.vercel.app/",
    githubUrl: "https://github.com/fardinhossain/Locationkhuji"
  },
  {
    id: "schedos",
    title: "SchedOS",
    shortCategory: "Systems",
    categories: ["systems", "web"],
    featured: true,
    visualType: "schedos",
    image: "assets/images/schedos.png",
    summary:
      "Interactive OS CPU scheduling laboratory — visualize, simulate, and compare 8 scheduling algorithms with Gantt charts and 557 passing tests.",
    description:
      "Interactive Operating System CPU Scheduling Algorithm Simulator built with React 19, TypeScript 5, and Tailwind CSS v4. Visualizes, simulates, and compares 8 preemptive and non-preemptive CPU scheduling algorithms with step-by-step execution, Gantt charts, and process metrics.",
    highlights: [
      "Real-time simulation and visual comparison of 8 CPU scheduling algorithms (FCFS, SJF, SRTF, LJF, LRTF, RR, Priority)",
      "100% client-side deterministic engine verified by 557 passing Vitest unit tests",
      "Interactive Gantt charts, turnaround/waiting/response metrics, and side-by-side algorithm comparison matrix"
    ],
    tags: ["React 19", "TypeScript", "Tailwind CSS", "Vitest", "OS Algorithms", "Simulation"],
    liveUrl: "https://sched-os.vercel.app",
    githubUrl: "https://github.com/fardinhossain/SchedOS"
  },
  {
    id: "seu-routine-maker",
    title: "SEU Routine Maker",
    shortCategory: "Web App",
    categories: ["web", "systems"],
    featured: true,
    visualType: "routine",
    image: "assets/images/seu-routine-maker.jpg",
    summary:
      "Fast, mobile-friendly routine builder for SEU students — import UMS HTML or course screenshots to generate conflict-free schedules and export PNG/PDF.",
    description:
      "Modern, privacy-first weekly routine maker for Southeast University students built with Next.js and React. Imports UMS Offered Sections HTML files, typed course codes, or course screenshots via OCR to automatically build weekly schedules, detect time conflicts and duplicate sections, and export to PNG, PDF, or .ics calendar.",
    highlights: [
      "Imports UMS HTML files or extracts course codes from screenshots using client-side OCR",
      "Automatic time-conflict detection, duplicate section alerts, and gap analysis",
      "Local browser persistence with one-click export to high-res PNG, PDF, and calendar reminders"
    ],
    tags: ["Next.js", "React", "Tailwind CSS", "OCR", "PDF / PNG Export", "PWA"],
    liveUrl: "https://seuroutine.vercel.app",
    githubUrl: "https://github.com/fardinhossain/SEU-Routine_Maker"
  },
  {
    id: "civic-pulse",
    title: "Civic-Pulse AI",
    shortCategory: "AI / ML",
    categories: ["ai-ml", "web"],
    featured: true,
    visualType: "civic",
    image: "assets/images/civicpulse-ai.jpg",
    summary:
      "AI-powered civic infrastructure reporting platform for automated issue categorization, severity scoring, duplicate detection, and department routing.",
    description:
      "Built for the IEEE Computer Society SEU AI & API Hackathon 2026. Transforms unstructured citizen reports of potholes, broken streetlights, water leaks, and hazards into structured, severity-scored, deduplicated, and automatically routed municipal cases with an explainable AI pipeline.",
    highlights: [
      "End-to-end AI triage that categorizes reports, scores severity with explainable rationale, and detects semantic duplicates",
      "Interactive map pin geocoding, photo evidence upload, and automatic municipal department dispatch",
      "Public citizen tracking portal and role-based municipal Admin resolution dashboard"
    ],
    tags: ["AI / LLM API", "Next.js", "React", "Geospatial Maps", "Automated Triage", "Full-Stack"],
    liveUrl: "https://civicpulseai.vercel.app/",
    githubUrl: "https://github.com/fardinhossain/Civic-Pulse_AI_API_Hackathon_2026"
  },
  {
    id: "flyrank-ml-capstone",
    title: "FlyRank AI ML Capstone",
    shortCategory: "Research",
    categories: ["ai-ml", "research"],
    featured: true,
    visualType: "flyrank",
    image: "assets/images/flyrank-ml-capstone.jpg",
    summary:
      "Decision-support content-refresh ranking over 78.8M DuckDB rows and 9,961 pages (0.78 Precision@50 vs 0.30 baseline) with IEEE paper.",
    description:
      "Applied Search Intelligence ML capstone framing content-refresh prioritization as a ranking problem over 9,961 candidate pages drawn from a 78.8M-row search warehouse in DuckDB. Evaluated on a strict client-grouped holdout across unseen domains, achieving 0.78 Precision@50 vs 0.30 for the fixed-rule baseline.",
    highlights: [
      "Achieved 0.78 Precision@50 with the learned ranker vs 0.30 for the fixed-rule baseline on unseen client domains",
      "Out-of-core DuckDB data contract over 78.8M daily-performance rows with full feature-leakage audit",
      "Delivered 12 executed Google Colab ML notebooks, ranked action playbook, and 6-page IEEE research paper"
    ],
    tags: ["Python", "DuckDB", "scikit-learn", "Learning-to-Rank", "Colab Notebooks", "IEEE Paper"],
    liveUrl: "https://fardinhossain.github.io/FlyRankAI-ML-Internship-Task/",
    paperUrl: "/paper.pdf",
    journeyTrigger: true,
    githubUrl: "https://github.com/fardinhossain/FlyRankAI-ML-Internship-Task"
  },
  {
    id: "unibuddy",
    title: "UniBuddy",
    shortCategory: "Mobile / App",
    categories: ["web", "systems"],
    featured: true,
    visualType: "unibuddy",
    image: "assets/images/unibuddy-app.png",
    summary:
      "Ultimate university companion app built with Flutter & Appwrite — featuring class routines, CGPA calculator, tasks, cover page builder, and chat.",
    description:
      "Comprehensive cross-platform mobile and web application built with Flutter (Dart) and Appwrite Cloud for university students. Combines academic productivity tools—including class routines, multi-semester CGPA calculator, assignment cover page generator, and task manager—with real-time student chat and polls.",
    highlights: [
      "All-in-one student hub: Class Routine, multi-semester CGPA Calculator, Task Manager, and Cover Page generator",
      "Real-time campus communication with student chat rooms, polls, and user profiles backed by Appwrite",
      "Cross-platform Flutter & Dart architecture supporting Android, iOS, and Web"
    ],
    tags: ["Flutter", "Dart", "Appwrite", "Android / iOS", "CGPA & Routine", "Real-Time Chat"],
    liveUrl: "https://tinyurl.com/unibuddyapk",
    githubUrl: "https://github.com/fardinhossain/Unibuddy_app"
  }
];

// ==========================================================================
// FLYRANK AI 4-MONTH INTERNSHIP JOURNEY (EXACT SOURCE OF TRUTH FROM journey.html)
// ==========================================================================

export const JOURNEY_OVERVIEW = {
  title: "My 4-Month FlyRank AI Internship Journey",
  role: "Machine Learning Intern — FlyRank AI",
  period: "July – October 2026 · Remote",
  location: "Remote · Dhaka, Bangladesh",
  subtitle:
    "Two tracks, one production story: the ML track (ranking 9,961 pages by refresh opportunity over 78.8M DuckDB rows) and the AI Fluency track (agents, automation, and a shipped portfolio).",
  promptLine: "Explore it: play with the ranker, walk the timeline, flip the certificates.",
  progressPercent: 100,
  progressSubmitted: 39,
  progressTotal: 39,
  progressLabel: "✓ 39/39 Complete — All assignments and both capstones delivered (100%)."
};

export const JOURNEY_STATS = [
  {
    id: "pages",
    count: 9961,
    decimals: 0,
    display: "9,961",
    label: "candidate pages ranked"
  },
  {
    id: "precision",
    count: null,
    display: "0.78",
    subDisplay: "vs 0.30",
    label: "precision@50, learned ranker vs fixed rule"
  },
  {
    id: "rows",
    count: 78.8,
    decimals: 1,
    suffix: "M",
    display: "78.8M",
    label: "million daily-performance rows via DuckDB"
  },
  {
    id: "notebooks",
    count: 12,
    decimals: 0,
    display: "12",
    label: "executed ML notebooks + research paper"
  },
  {
    id: "certs",
    count: 20,
    decimals: 0,
    display: "20/20",
    label: "Anthropic Academy certificates"
  },
  {
    id: "hours",
    count: 134,
    decimals: 0,
    prefix: "~",
    display: "~134",
    label: "hours logged (approx.)"
  }
];

export const JOURNEY_LEADERBOARD = {
  standingHeader: "YOUR STANDING — Md. Fardin Hossain · Machine Learning · Bangladesh",
  rank: "#23 of 4794",
  rankNumber: "#23",
  rankTotal: "4794",
  points: "2,136",
  pointsType: "participation-based V1",
  movement: "— 0",
  movementLabel: "weekly baseline",
  nextMilestone: "2 pts to #22",
  leaderboardUrl: "https://internship.flyrank.ai/intern/leaderboard?scope=country&view=bangladesh",
  verifiedBadge: "✓ Verified · D11 Certificate of Completion · Machine Learning · Issued 31 October 2026"
};

// Exact 12-page illustrative ranking dataset from journey.html
export const RANKER_SAMPLE_PAGES = [
  { name: "Page A", decline: 42, demand: 90, needs: true },
  { name: "Page B", decline: 38, demand: 20, needs: false },
  { name: "Page C", decline: 30, demand: 95, needs: true },
  { name: "Page D", decline: 55, demand: 10, needs: false },
  { name: "Page E", decline: 25, demand: 88, needs: true },
  { name: "Page F", decline: 48, demand: 30, needs: false },
  { name: "Page G", decline: 20, demand: 92, needs: true },
  { name: "Page H", decline: 60, demand: 15, needs: false },
  { name: "Page I", decline: 33, demand: 85, needs: true },
  { name: "Page J", decline: 28, demand: 25, needs: false },
  { name: "Page K", decline: 45, demand: 80, needs: true },
  { name: "Page L", decline: 15, demand: 40, needs: false }
];

// Exact Month-by-Month Timeline from journey.html
export const JOURNEY_TIMELINE = [
  {
    id: "july",
    navLabel: "July · Foundations",
    month: "July 2026",
    theme: "Foundations",
    status: "done",
    summary: "Internship onboarding, starter ML notebooks, AI Fluency workflow audit, and portfolio architecture planning.",
    tags: ["Python", "Jupyter", "AI Fluency Audit", "Portfolio Sitemap"],
    items: [
      "Joined the FlyRank AI internship (July cohort) — ML as the main track",
      "ML: starter notebooks — first look, first readable model, full release",
      "AI Fluency: FL-01 workflow audit & tool setup · Draw the Path (portfolio sitemap + toolkit) · What Are You Proving?"
    ],
    deliverables: [
      { label: "ML Starter Notebooks (00–02)", type: "notebook" },
      { label: "FL-01 Workflow Audit & Sitemap Plan", type: "doc" }
    ]
  },
  {
    id: "july-aug",
    navLabel: "Jul–Aug · Problem Framing",
    month: "July – August 2026",
    theme: "Framing the problem",
    status: "done",
    summary: "Defined content-refresh opportunity scoring as a ranking task over 9,961 candidate pages evaluated with Precision@50.",
    tags: ["Lane 2 Ranking", "Precision@50", "Automation Workflow", "MCP Basics"],
    items: [
      "ML w01: research question → Lane 2: Content Refresh / Opportunity Scoring",
      "ML w02: framed as a ranking task — 9,961 candidate pages, precision@50",
      "AI Fluency: Three Roads (stack rationale) · FL-04 automation workflow (5 real runs) · FL-05 agent & MCP explainer"
    ],
    deliverables: [
      { label: "Lane 2 Problem Formulation & Ranking Spec", type: "research" },
      { label: "FL-04 5-Run Automation Pipeline & FL-05 MCP Explainer", type: "doc" }
    ]
  },
  {
    id: "august",
    navLabel: "August · Data & Baselines",
    month: "August 2026",
    theme: "Data & baselines",
    status: "done",
    summary: "Queried the 78.8M-row warehouse with DuckDB, audited feature leakage, established the fixed-rule baseline, and designed the personal agent.",
    tags: ["DuckDB", "78.8M Rows", "Leakage Audit", "Baseline Scoring", "FL-06 Agent Spec"],
    items: [
      "ML w03: data contract — DuckDB over 78.8M daily-performance rows + feature leakage check",
      "ML w04: baseline score + signal audit",
      "AI Fluency: Make It Do Something · Explain It Like You Built It · FL-06 agent design spec"
    ],
    deliverables: [
      { label: "DuckDB 78.8M-Row Data Contract & Signal Audit", type: "code" },
      { label: "FL-06 Personal Agent Architecture Spec", type: "doc" }
    ]
  },
  {
    id: "september",
    navLabel: "September · Models & Agents",
    month: "September 2026",
    theme: "Models & agents",
    status: "done",
    summary: "Trained and validated ML ranking models on a client-grouped holdout, built the Study Coach agent with narrated demo video, and shipped the live site.",
    tags: ["scikit-learn", "Client-Grouped Holdout", "FL-07 Study Coach Agent", "Vercel DNS", "Mobile QA"],
    items: [
      "ML w05: model (logistic regression + random forest) · w06: validation audit on a client-grouped holdout",
      "AI Fluency: FL-07 Study Coach agent — built, tested, run video · FL-09 README + narrated demo · Plan to Keep Building",
      "Portfolio site deployed on Vercel + DNS walkthrough (PF-04) · mobile QA fix log · Break-Your-Own-Site report"
    ],
    deliverables: [
      { label: "Client-Grouped Holdout Validation Notebooks (w05–w06)", type: "notebook" },
      { label: "FL-07 Study Coach Agent MVP & FL-09 Demo Documentation", type: "code" },
      { label: "Live Portfolio Deployment + Adversarial QA Report", type: "web" }
    ]
  },
  {
    id: "october",
    navLabel: "October · Capstones & Proof",
    month: "October 2026",
    theme: "Capstones & proof",
    status: "done",
    summary: "Completed the ML capstone notebook and research paper (0.78 Precision@50 vs 0.30 baseline), AI Fluency Impact Project, and all 20/20 Anthropic Academy certificates.",
    tags: ["0.78 Precision@50", "Research Paper", "20/20 Anthropic Certs", "~134 Hours Logged"],
    items: [
      "ML w07: action playbook · ML capstone notebook + research paper — 0.78 precision@50 vs 0.30 baseline",
      "AI Fluency capstone: Impact Project — personal site + Study Coach agent + 20/20 certificates",
      "Send the Link · Plant Your Flag · 20/20 Anthropic Academy certificates · ~134 hours logged"
    ],
    links: [
      {
        label: "Code: FlyRankAI-ML-Internship-Task",
        url: "https://github.com/fardinhossain/FlyRankAI-ML-Internship-Task"
      },
      {
        label: "Site: fardinflyrankai.vercel.app",
        url: "https://fardinflyrankai.vercel.app/"
      },
      {
        label: "Research Paper (PDF)",
        url: "/paper.pdf"
      },
      {
        label: "Deployed Research Paper",
        url: "https://fardinhossain.github.io/FlyRankAI-ML-Internship-Task/"
      }
    ],
    deliverables: [
      { label: "ML Capstone Notebook & Research Paper (0.78 vs 0.30)", type: "research" },
      { label: "20/20 Anthropic Academy Certificates Uploaded", type: "cert" }
    ]
  },
  {
    id: "october-signoff",
    navLabel: "Oct · Review & Sign-Off",
    month: "October 2026",
    theme: "Review & Sign-Off",
    status: "done",
    summary: "Survive the Crit human portfolio review completed, build-in-public journey post published, and final retrospective & hours signed off (39/39 cards complete).",
    tags: ["Human Review Verified", "Build-in-Public", "39/39 Complete", "Hours Approved"],
    items: [
      "Survive the Crit — comprehensive human portfolio review completed for live production deployment",
      "Show It / Tell the Story — build-in-public milestone post published, retrospective approved, and ~134 hours logged"
    ],
    links: [
      {
        label: "Survive the Crit (Portfolio Review)",
        url: "https://fardinflyrankai.vercel.app/"
      },
      {
        label: "Show It / Tell the Story (Build-in-Public Post)",
        url: "https://www.linkedin.com/in/fardinhosn/"
      },
      {
        label: "ML Internship GitHub Repo",
        url: "https://github.com/fardinhossain/FlyRankAI-ML-Internship-Task"
      },
      {
        label: "Research Paper (PDF)",
        url: "/paper.pdf"
      }
    ],
    deliverables: [
      { label: "Survive the Crit Human Review Completed", type: "web" },
      { label: "Published Build-in-Public Retrospective", type: "doc" }
    ]
  }
];

// Exact 20 Anthropic Academy Certificates with real certificate images & filter categories
export const ANTHROPIC_CERTIFICATES = [
  {
    index: 1,
    title: "AI Fluency: Framework & Foundations",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/01_AI_Fluency_Framework_Foundations.png",
    fallbackImage: "/certs/01.png",
    learned:
      "The 4D framework — Delegation, Description, Discernment, Diligence — and calibrated trust instead of all-or-nothing AI trust."
  },
  {
    index: 2,
    title: "Claude 101",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/02_Claude_101.png",
    fallbackImage: "/certs/02.png",
    learned:
      "Prompting fundamentals: give context and constraints, then iterate conversationally instead of expecting perfection first try."
  },
  {
    index: 3,
    title: "Introduction to Claude Cowork",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/03_Introduction_to_Claude_Cowork.png",
    fallbackImage: "/certs/03.png",
    learned:
      "Agentic workspace mode: delegate multi-step, file-based tasks to Claude and review what it did."
  },
  {
    index: 4,
    title: "AI Capabilities and Limitations",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/04_AI_Capabilities_and_Limitations.png",
    fallbackImage: "/certs/04.png",
    learned:
      "How LLMs really work, why they hallucinate, and why specific facts in outputs must always be verified."
  },
  {
    index: 5,
    title: "AI Fluency for Students",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/05_AI_Fluency_for_Students.png",
    fallbackImage: "/certs/05.png",
    learned:
      "AI as a learning partner, not a substitute — real learning is proven when you can explain it to someone else."
  },
  {
    index: 6,
    title: "AI Fluency for Small Businesses",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/06_AI_Fluency_for_Small_Businesses.png",
    fallbackImage: "/certs/06.png",
    learned:
      "The 4Ds for business: keep your voice in drafts, keep a human reviewing, never paste raw client data into prompts."
  },
  {
    index: 7,
    title: "AI Fluency for Educators",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/07_AI_Fluency_for_Educators.png",
    fallbackImage: "/certs/07.png",
    learned:
      "The 4Ds for teaching: objectives-first assessments, and transparency about classroom AI use."
  },
  {
    index: 8,
    title: "Teaching AI Fluency",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/08_Teaching_AI_Fluency.png",
    fallbackImage: "/certs/08.png",
    learned:
      "Teaching the loops — linear, focused, loop-based — and assessing process, not just the final product."
  },
  {
    index: 9,
    title: "AI Fluency for Nonprofits",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/09_AI_Fluency_for_Nonprofits.png",
    fallbackImage: "/certs/09.png",
    learned:
      "Ask 'should AI do this?' before 'can it?' — pilot on known answers, then scale, mission first."
  },
  {
    index: 10,
    title: "AI Fluency for Builders",
    category: "ai-fluency",
    categoryLabel: "AI Fluency",
    image: "/Anthropic_Certificates_Images/10_AI_Fluency_for_Builders.png",
    fallbackImage: "/certs/10.png",
    learned:
      "The builder's toolkit, the Five Lenses for reviewing AI output, and acceptance tests before prompting."
  },
  {
    index: 11,
    title: "Claude Code 101",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/11_Claude_Code_101.png",
    fallbackImage: "/certs/11.png",
    learned:
      "Terminal-based agentic coding: Claude reads, edits, and runs code in your project under your supervision."
  },
  {
    index: 12,
    title: "Claude Code in Action",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/12_Claude_Code_in_Action.png",
    fallbackImage: "/certs/12.png",
    learned:
      "Planning mode, context management, and reliable multi-file workflows on real codebases."
  },
  {
    index: 13,
    title: "Claude Platform 101",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/13_Claude_Platform_101.png",
    fallbackImage: "/certs/13.png",
    learned:
      "The Console, API basics, and how models, API, and tools fit together."
  },
  {
    index: 14,
    title: "Building with the Claude API",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/14_Building_with_the_Claude_API.png",
    fallbackImage: "/certs/14.png",
    learned:
      "Evals before prompt tuning, structured outputs, tool use, and RAG — the production discipline."
  },
  {
    index: 15,
    title: "Introduction to Model Context Protocol",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/15_Introduction_to_Model_Context_Protocol.png",
    fallbackImage: "/certs/15.png",
    learned:
      "MCP primitives — tools, resources, prompts — and building servers with the Python SDK."
  },
  {
    index: 16,
    title: "Model Context Protocol: Advanced Topics",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/16_Model_Context_Protocol_Advanced_Topics.png",
    fallbackImage: "/certs/16.png",
    learned:
      "Sampling, progress notifications, least-privilege roots, and STDIO vs StreamableHTTP transports."
  },
  {
    index: 17,
    title: "Introduction to Agent Skills",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/17_Introduction_to_Agent_Skills.png",
    fallbackImage: "/certs/17.png",
    learned:
      "Reusable SKILL.md instructions with triggerable descriptions, so you stop repeating yourself."
  },
  {
    index: 18,
    title: "Introduction to Subagents",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/18_Introduction_to_Subagents.png",
    fallbackImage: "/certs/18.png",
    learned:
      "Specialized agents with their own context, orchestrated in parallel under one coordinator."
  },
  {
    index: 19,
    title: "Claude with Amazon Bedrock",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/19_Claude_with_Amazon_Bedrock.png",
    fallbackImage: "/certs/19.png",
    learned:
      "Claude through Bedrock's Converse API — same Claude, inside AWS IAM and VPC controls."
  },
  {
    index: 20,
    title: "Claude with Google Cloud's Vertex AI",
    category: "ml-backend",
    categoryLabel: "ML & Backend",
    image: "/Anthropic_Certificates_Images/20_Claude_with_Google_Clouds_Vertex_AI.png",
    fallbackImage: "/certs/20.png",
    learned:
      "Claude through Vertex AI — unified billing, IAM, and data residency in your GCP region."
  }
];

export const VERIFIED_CERTIFICATIONS = [
  {
    id: "flyrank-cert",
    issuer: "FlyRank AI",
    logoText: "FR",
    title: "FlyRank AI — Machine Learning, Certificate of Completion",
    period: "Jul – Oct 2026",
    credentialId: "FR-D11-9E3D0-1FE2A",
    status: "Verified",
    statusType: "verified",
    certificateImage: "assets/images/FlyRank_ML_Certificate_of_Completion.png",
    verifyUrl: "https://internship.flyrank.ai/verify/FR-D11-9E3D0-1FE2A?first_name=Md.",
    description: "Certificate of Completion — Md. Fardin Hossain — Machine Learning Internship Program at FlyRank.ai, July 1 – October 31, 2026."
  },
  {
    id: "datacamp-ai",
    issuer: "DataCamp",
    logoText: "DC",
    title: "Associate AI Engineer for Developers",
    period: "2026",
    status: "Verified",
    statusType: "verified",
    verifyUrl: "Fardin_Hossain_Resume.pdf",
    description: "Certified proficiency in LLM APIs, production prompt engineering, vector embeddings, and software integration."
  },
  {
    id: "ibm-genai",
    issuer: "IBM",
    logoText: "IBM",
    title: "Generative AI Engineering Professional Certificate",
    period: "2026",
    status: "Verified",
    statusType: "verified",
    verifyUrl: "Fardin_Hossain_Resume.pdf",
    description: "Comprehensive engineering credential covering foundation models, fine-tuning, transformers, and retrieval-augmented generation."
  },
  {
    id: "mile2-cpte",
    issuer: "mile2",
    logoText: "m2",
    title: "C|PTE: Certified Penetration Testing Engineer",
    period: "2026 – 2029",
    status: "Verified",
    statusType: "verified",
    certificateImage: "assets/images/cpte_fardin.jpg",
    description: "Hands-on offensive security auditing, vulnerability assessment, network reconnaissance, and OWASP Top 10 remediation."
  },
  {
    id: "anthropic-20",
    issuer: "Anthropic",
    logoText: "AA",
    title: "Anthropic Academy — 20/20 Certificate Courses",
    period: "Oct 2026",
    status: "20/20 Earned",
    statusType: "verified",
    openCertWall: true,
    description: "All 20 certificate courses completed across Claude API, Claude Code, Model Context Protocol (MCP), Agent Skills, Subagents, Bedrock & Vertex AI."
  },
  {
    id: "edge-cuet",
    issuer: "EDGE-CUET",
    logoText: "EC",
    title: "Applied Penetration Testing Assessment",
    period: "2026",
    status: "Verified",
    statusType: "verified",
    certificateImage: "assets/images/EDGE-CUET.jpg",
    description: "Hands-on enterprise penetration testing and cybersecurity assessment under the EDGE-CUET / DST initiative."
  },
  {
    id: "flyrank-fluency-review",
    issuer: "FlyRank AI",
    logoText: "FL",
    title: "AI Fluency Track Final Human Sign-Off (39/39 Cards)",
    period: "Oct 2026",
    status: "",
    statusType: "none",
    openJourney: true,
    description: "All 39 portal cards complete across Machine Learning and AI Fluency capstone deliverables and peer review."
  }
];

export const SKILL_GROUPS = [
  {
    category: "Machine Learning & AI",
    accent: "red",
    items: [
      "Machine Learning",
      "scikit-learn",
      "pandas & NumPy",
      "PyTorch",
      "Feature Engineering",
      "Deep Learning & Transfer Learning",
      "Computer Vision & NLP",
      "Agentic Workflows & RAG",
      "LLM APIs (Groq, OpenRouter, Claude)",
      "Model Context Protocol (MCP)"
    ]
  },
  {
    category: "Programming Languages",
    accent: "dark",
    items: ["Python", "TypeScript", "JavaScript", "Dart", "Java", "C / C++", "SQL"]
  },
  {
    category: "Full-Stack Web & Mobile",
    accent: "yellow",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express.js",
      "FastAPI",
      "Flutter",
      "Tailwind CSS",
      "Leaflet Maps",
      "REST APIs",
      "Vitest (557 Tests)"
    ]
  },
  {
    category: "Databases, Cloud & Security",
    accent: "green",
    items: [
      "MongoDB",
      "Firebase",
      "Appwrite",
      "Git & GitHub",
      "Vercel",
      "Linux",
      "Penetration Testing (C|PTE)",
      "Web Application Security",
      "OWASP Top 10"
    ]
  }
];
