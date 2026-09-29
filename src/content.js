// ─────────────────────────────────────────────────────────────
//  SITE CONTENT: edit this file to change copy, links, projects
//  and insights. Anything wrapped in [BRACKETS] is a placeholder:
//  the build hides it from the visible site until you replace it.
//  Lines marked REVIEW need Warren's sign-off before publishing.
// ─────────────────────────────────────────────────────────────

export const site = {
  title: 'Warren Chanansingh | Digital strategist, Toronto',
  description:
    'Warren Chanansingh is a Toronto digital strategist working across paid media, creative production and emerging technology.',
  url: '[SITE_URL]', // e.g. https://warrenchanansingh.com (enables canonical, Open Graph URLs and sitemap)
  locale: 'en_CA',
};

export const person = {
  name: 'Warren Chanansingh',
  role: 'Digital strategist',
  location: 'Toronto',
  // Portrait: drop a file at src/assets/portrait.jpg and set this to 'portrait.jpg'.
  // While null, the About section shows a typographic plate instead.
  portrait: null,
  portraitAlt: 'Portrait of Warren Chanansingh',
};

export const links = {
  email: '[EMAIL]',
  linkedin: '[LINKEDIN_URL]',
  // Existing Adobe Portfolio. Used as the contact fallback while email is a placeholder.
  portfolio: 'https://warrenchanansingh416.myportfolio.com',
};

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'about', label: 'About' },
  { id: 'insights', label: 'Insights' },
  { id: 'contact', label: 'Contact' },
];

export const hero = {
  headline: ['I turn audience signals', 'into media, stories', 'and decisions that move', 'people.'],
  // REVIEW: 12 years is Warren's stated experience.
  sub:
    'Twelve years in paid media across Meta, Google, social and programmatic. I pair performance thinking with storytelling, and I’m finishing a Master of Digital Media at Toronto Metropolitan University.',
  primary: { label: 'See selected work', href: '#work' },
  secondary: { label: 'Get in touch', href: '#contact' },
};

// ── PROJECTS ─────────────────────────────────────────────────
// Fields (all optional except slug, title, category, summary):
// year, status ('in-development' | 'published'), client, role,
// context, challenge, approach[], decisions[], channels[],
// outcome, learnings, media[{src, alt, caption}], link{href,label}, related[slug]
// pattern: art style for the generative artwork:
//   'rise' | 'wave' | 'converge' | 'orbit' | 'band'
// Never put a metric in `outcome` until it is real and approved.
export const projects = [
  {
    slug: 'insurance-lead-generation',
    title: 'Paid media for insurance lead generation',
    category: 'Performance media',
    year: 'Current',
    status: 'in-development',
    pattern: 'rise',
    // REVIEW: confirm you may name the agency and brands publicly.
    client: 'Lonsdale Saatchi & Saatchi, for ANSA group brands TATIL and TATIL Life',
    role: 'Paid media consultant: campaign strategy, buying and optimization',
    channels: ['Meta', 'LinkedIn', 'Google'],
    summary:
      'Lead-generation media for life and general insurance brands, planned and optimized across Meta, LinkedIn and Google.',
    context:
      'Insurance is a considered purchase. People rarely buy from a single ad, so campaigns need to earn attention, then give interested people an easy way to raise their hand.',
    challenge:
      'Generate enquiries across more than one insurance product while keeping the focus on leads the client team can actually follow up.',
    approach: [
      'Plan and run lead campaigns across Meta, LinkedIn and Google.',
      'Work weekly with the client team, including checks on lead attribution, so reporting reflects real enquiries rather than raw form fills.',
      'Feed what the numbers show back into targeting, creative and budget decisions.',
    ],
    related: ['meta-ads-101'],
  },
  {
    slug: 'the-move',
    title: 'The Move',
    category: 'Audio storytelling',
    status: 'in-development',
    pattern: 'wave',
    // REVIEW: add your role, format (series, episodes), year and a listen link.
    summary: 'An audio storytelling project focused on immigrant journeys.',
    related: ['pixel-press'],
  },
  {
    slug: 'pixel-press',
    title: 'Pixel Press',
    category: 'Video podcast and production',
    status: 'in-development',
    pattern: 'band',
    // REVIEW: add your role, year, collaborators you can name and a watch link.
    summary: 'A collaborative video podcast and digital production project.',
    related: ['the-move'],
  },
  {
    slug: 'interface-research',
    title: 'Interface research study',
    category: 'Digital experience',
    status: 'in-development',
    pattern: 'converge',
    summary:
      'Academic work in the Master of Digital Media program: studying how people use an interface and proposing ways to improve it.',
    related: ['meta-ads-101'],
  },
  {
    slug: 'meta-ads-101',
    title: 'Meta Ads 101 workshop',
    category: 'Workshops and community learning',
    status: 'in-development',
    pattern: 'orbit',
    client: 'The Creative School, Toronto Metropolitan University',
    role: 'Workshop designer and facilitator',
    channels: ['Meta Ads Manager'],
    summary: 'An introductory workshop that walks newcomers through planning and launching their first Meta Ads campaign.',
    context:
      'An introductory session for people who are new to running paid social campaigns.',
    // REVIEW: proposed follow-on series. Remove if you’d rather not mention it yet.
    learnings:
      'Next, a proposed three-part series for the Master of Digital Media program: planning a campaign from awareness to conversion, Meta Ads 101, and digital media analytics.',
    related: ['insurance-lead-generation'],
  },
];

// ── EXPERTISE ────────────────────────────────────────────────
export const expertise = [
  {
    id: 'strategy',
    title: 'Strategy and insight',
    lead: 'Working out who the audience is, what they need to hear and how you’ll know it worked, before anything goes live.',
    doing: [
      'Audience research and segmentation',
      'Campaign plans that run from awareness to conversion',
      'Measurement plans agreed before launch',
      'Briefs that turn reporting into direction creative teams can use',
    ],
  },
  {
    id: 'media',
    title: 'Paid media and growth',
    lead: 'Hands-on planning, buying and optimization across the platforms where attention actually is.',
    doing: [
      'Meta, Google, LinkedIn, social and programmatic campaigns',
      'Lead-generation and conversion campaigns',
      'Structured tests of audiences, creative and bidding',
      'Budget pacing and attribution checks with client teams',
    ],
  },
  {
    id: 'creative',
    title: 'Creative production and storytelling',
    lead: 'Making the content, not just placing it: social, video, podcast and audio work shaped by what audiences respond to.',
    doing: [
      'Social media content production',
      'Video podcast production',
      'Audio storytelling',
      'Creative direction grounded in performance data',
    ],
  },
  {
    id: 'innovation',
    title: 'Digital innovation and experimentation',
    lead: 'Testing new tools and interfaces in small, practical ways, and teaching others to use them with confidence.',
    doing: [
      'Interface and user research',
      'Practical AI experiments for marketing workflows',
      'Prototyping digital experiences',
      'Workshops that make digital tools easier to understand',
    ],
  },
];

// ── ABOUT ────────────────────────────────────────────────────
export const about = {
  // REVIEW: this bio is a draft written in Warren's voice.
  paragraphs: [
    'I’m Warren, a digital strategist based in Toronto. I’ve spent twelve years in paid media, planning and buying campaigns and learning what makes people stop, click and act.',
    'I care as much about the story as the spreadsheet. My work moves between media buying and production, from lead-generation campaigns to video podcasts and audio stories about immigrant journeys.',
    'I’m completing a Master of Digital Media at Toronto Metropolitan University, where I study interfaces, experiment with AI and run workshops that make digital advertising less intimidating. Next, I’m exploring a company that brings digital marketing and AI innovation together.',
  ],
  facts: [
    { term: 'Based in', detail: 'Toronto, Ontario' },
    { term: 'Paid media experience', detail: '12 years' }, // REVIEW
    { term: 'Media managed', detail: 'Over $10M USD across Meta, Google, social and programmatic' }, // REVIEW
    { term: 'Studying', detail: 'Master of Digital Media, Toronto Metropolitan University, expected early 2027' },
  ],
};

// ── INSIGHTS ─────────────────────────────────────────────────
// status: 'draft' shows a Draft label and no link. When published,
// set status: 'published' and href to the article URL.
export const insights = [
  {
    title: 'Making paid media insights useful to creative teams',
    premise: 'Most performance reports are written for the media team. What changes when they’re written for the people making the ads?',
    status: 'draft',
  },
  {
    title: 'What immigrant storytelling reveals about digital media',
    premise: 'Notes from working on The Move, and what it suggests about how audiences connect with personal stories.',
    status: 'draft',
  },
  {
    title: 'Practical AI experiments for marketers',
    premise: 'Small, testable ways to use AI in campaign work, and where a human still needs to make the call.',
    status: 'draft',
  },
];

// ── CONTACT ──────────────────────────────────────────────────
export const contact = {
  closing: ['Bring me the noise.', 'I’ll help find the signal.'],
  intro: 'Pick the route that fits and I’ll reply personally.',
  routes: [
    {
      id: 'hiring',
      title: 'Hiring',
      text: 'Digital strategy and performance media roles at agencies and in-house teams.',
      subject: 'Role opportunity',
      action: 'Email about a role',
    },
    {
      id: 'consulting',
      title: 'Consulting',
      text: 'Paid media and campaign strategy for growing brands that need a strategist who also runs the work.',
      subject: 'Consulting enquiry',
      action: 'Email about a project',
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      text: 'Workshops, storytelling and community projects with creatives and organizations.',
      subject: 'Collaboration idea',
      action: 'Email about a collaboration',
    },
  ],
};
