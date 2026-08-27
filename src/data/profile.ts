/**
 * Single source of truth for all site content.
 *
 * Nothing else in the app hardcodes copy. Sections, metadata, JSON-LD and the
 * case-study pages all read from here.
 */

export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  period: string;
  stack: string[];
  summary: string;
  /** Longer prose for the case-study page, one paragraph per entry. */
  detail: string[];
  /** Headline numbers rendered as a stat row. */
  metrics: { label: string; value: string }[];
  links: ProjectLink[];
};

export type Paper = {
  title: string;
  status: string;
  year: string;
  doi?: string;
  abstract: string;
};

/**
 * The résumé PDF is only linked once the file actually exists at
 * public/Resume_Harshit_Modi.pdf. Flip this to true after adding it — a live
 * 404 behind a "Résumé" button is worse than no button.
 */
export const RESUME_READY = false;

export const profile = {
  name: "Harshit Modi",
  shortName: "Harshit",
  initials: "HM",
  role: "AI & Data Science Undergraduate",
  tagline:
    "Founding engineer at mello.ai. I build machine learning systems and publish what they actually show.",
  location: "Mumbai, India",

  education: {
    institution: "KJ Somaiya College of Engineering",
    degree: "B.E, Artificial Intelligence & Data Science",
    location: "Mumbai, India",
    graduation: "May 2027",
    cgpa: "8.00 / 10",
  },

  about: [
    "Third-year B.E. student in AI & Data Science at KJ Somaiya College of Engineering, Mumbai. Founding engineer of mello.ai, a live B2B SaaS voice platform.",
    "Two first-author research papers, a published data-analytics portfolio, and 2+ years of equity trading experience with working SEBI/RBI knowledge.",
  ],

  links: {
    email: "connect2harshit123@gmail.com",
    github: "https://github.com/harshit-1243",
    linkedin: "https://linkedin.com/in/harshit-modi1",
    resume: "/Resume_Harshit_Modi.pdf",
  },

  papers: [
    {
      title:
        "Real-Time American Sign Language Recognition with MediaPipe Landmarks and a Compact CNN",
      status: "Preprint",
      year: "2025",
      doi: "10.5281/zenodo.20526911",
      abstract:
        "A real-time American Sign Language recognition system combining MediaPipe hand-landmark extraction with a compact CNN classifier, achieving 98.2% accuracy at 30 FPS on consumer GPU hardware. Benchmarked against MobileNetV2 and ResNet-50, deployed via a Streamlit interface for accessible, real-world use.",
    },
    {
      title:
        "Gradient Boosting for Annual Earnings Direction on NSE Large-Caps: A Documented Null Result",
      status: "Preprint",
      year: "2025",
      doi: "10.5281/zenodo.20548574",
      abstract:
        "A systematic gradient-boosting study (XGBoost vs. LightGBM) on earnings prediction for 9 NSE-listed large-cap companies across 5 sectors (FY2017–FY2026), using strict time-ordered cross-validation to eliminate look-ahead bias. Reports a precise, well-documented null result: financial ratios carry limited predictive signal for annual earnings direction in established Indian blue-chip firms.",
    },
  ] satisfies Paper[],

  projects: [
    {
      slug: "sign-language-detection",
      title: "Real-Time ASL Recognition",
      tagline: "98.2% accuracy at 30 FPS from hand-landmark geometry",
      period: "2025",
      stack: ["Python", "MediaPipe", "CNN", "Streamlit", "OpenCV"],
      summary:
        "Recognises American Sign Language in real time by pairing MediaPipe hand-landmark extraction with a compact CNN, benchmarked against MobileNetV2 and ResNet-50.",
      detail: [
        "MediaPipe gives 21 3D landmarks per hand. Classifying that geometry rather than raw pixels means the model never has to learn to ignore lighting, background or skin tone — the landmark normalisation handles it — and the input collapses from a full image to a small coordinate vector.",
        "That compactness is what buys the frame rate. The classifier is a small CNN rather than a large backbone, and it holds 98.2% accuracy at 30 FPS on consumer GPU hardware. Benchmarking against MobileNetV2 and ResNet-50 was the point: the compact model is competitive while staying inside a real-time budget those backbones miss.",
        "It ships behind a Streamlit interface, which matters more than it sounds — a recognition model nobody can run isn't an accessibility tool. The hand in the scene on the home page is the real MediaPipe topology with its actual connection list, cycling through ASL poses.",
      ],
      metrics: [
        { label: "Accuracy", value: "98.2%" },
        { label: "Throughput", value: "30 FPS" },
        { label: "Benchmarked against", value: "MobileNetV2, ResNet-50" },
      ],
      // TODO: no public repo supplied for this one yet.
      links: [] as ProjectLink[],
    },
    {
      slug: "nse-earnings-prediction",
      title: "NSE Earnings Prediction",
      tagline: "A documented null result on Indian blue-chip fundamentals",
      period: "2025",
      stack: ["Python", "XGBoost", "LightGBM", "pandas", "scikit-learn"],
      summary:
        "A systematic XGBoost vs. LightGBM study on annual earnings direction for NSE large-caps, with time-ordered validation — reporting a clean negative finding rather than an inflated one.",
      detail: [
        "Nine NSE-listed large-cap companies across five sectors, FY2017 to FY2026, with strict time-ordered cross-validation. The ordering constraint is the whole methodology: shuffled folds leak future information backwards, and a model that has seen the future scores beautifully and predicts nothing.",
        "The result is negative, and stated precisely: financial ratios carry limited predictive signal for annual earnings direction in established Indian blue-chip firms. Mature large-caps are heavily analysed and heavily smoothed, so the accessible fundamentals are largely priced in by the time they are public.",
        "Publishing that is deliberate. A null result obtained under honest validation is more useful than a strong number obtained under leakage — it tells you where not to look. The landscape in the 3D scene reflects the finding rather than contradicting it: a noise floor with no dominant peak.",
      ],
      metrics: [
        { label: "Companies", value: "9 large-caps" },
        { label: "Coverage", value: "5 sectors, FY17–FY26" },
        { label: "Finding", value: "Documented null result" },
      ],
      // Labelled "related" deliberately: this is NSE market-data tooling, and
      // it is not confirmed to hold the paper's own analysis code.
      links: [
        {
          label: "Related — NSE sector dashboard",
          href: "https://github.com/harshit-1243/nse-sector-dashboard",
        },
      ] as ProjectLink[],
    },
    {
      slug: "fitmentor-ai",
      title: "FitMentor AI",
      tagline: "Retrieval-augmented guidance for training and nutrition",
      period: "2025",
      stack: ["Python", "RAG", "Vector search", "LLM APIs"],
      summary:
        "A retrieval-augmented assistant for fitness and nutrition questions, grounding answers in a document store rather than improvising them.",
      detail: [
        "Queries are embedded and matched against a document store, and the retrieved passages ground the generated answer. The value isn't fluency — it's that a claim about training or nutrition stays anchored to a source instead of being invented, which is exactly where a bare language model is least trustworthy.",
        "The retrieval lattice in the 3D scene is a literal picture of the structure: a query node pinned at the centre, documents sampled around it, and edges built by real k-nearest-neighbour search over their positions rather than drawn by hand.",
      ],
      metrics: [
        { label: "Approach", value: "Retrieval-augmented" },
        { label: "Retrieval", value: "kNN over embeddings" },
        { label: "Domain", value: "Training & nutrition" },
      ],
      links: [
        { label: "GitHub — fitmentor-ai", href: "https://github.com/Electrozap/fitmentor-ai" },
      ] as ProjectLink[],
    },
  ] satisfies Project[],

  /** Smaller verified builds, listed without a full case study. */
  otherRepos: [
    {
      name: "personal-expense-tracker",
      href: "https://github.com/harshit-1243/personal-expense-tracker",
      note: "Personal finance tracking app",
    },
  ],

  experience: [
    {
      org: "mello.ai",
      role: "Founding Engineer",
      period: "May 2026 — Present",
      detail: "Building a live B2B SaaS voice platform as founding engineer.",
    },
    {
      org: "Marcadona Fashion Media Pvt. Ltd.",
      role: "Events Intern",
      period: "Feb — Mar 2026",
      detail: "Events operations and coordination.",
    },
    {
      org: "SR Counselling",
      role: "App Development Intern",
      period: "Jun — Sep 2025",
      detail: "Application development across the product's client-facing features.",
    },
  ],

  skills: [
    { group: "Languages", items: ["Python", "TypeScript", "SQL", "C++"] },
    {
      group: "ML & Data",
      items: ["PyTorch", "TensorFlow", "scikit-learn", "XGBoost", "LightGBM", "pandas", "OpenCV"],
    },
    {
      group: "Systems",
      items: ["RAG pipelines", "Vector search", "MediaPipe", "Voice platforms", "Streamlit"],
    },
    {
      group: "Markets",
      items: ["Equity trading (2+ yrs)", "SEBI/RBI regulation", "Financial statement analysis"],
    },
  ],
} as const;

export type Profile = typeof profile;
