/**
 * Single source of truth for all site content.
 *
 * Nothing else in the app hardcodes copy. Sections, metadata, JSON-LD and the
 * case-study pages all read from here, so updating a fact updates it everywhere.
 *
 * Fields marked TODO need real values from Harshit before launch.
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
  venue: string;
  status: string;
  year: string;
  doi?: string;
  href?: string;
  abstract: string;
};

export const profile = {
  name: "Harshit Modi",
  shortName: "Harshit",
  initials: "HM",
  role: "AI & Data Science Undergraduate",
  // The one-liner under the name on the landing section.
  tagline: "I build machine learning systems and write about what they learn.",
  location: "Mumbai, India",
  education: {
    institution: "KJ Somaiya College of Engineering",
    degree: "B.Tech, Artificial Intelligence & Data Science",
    location: "Mumbai, India",
    graduation: "May 2027",
    // Stored with its unit; the label in the UI is just "CGPA".
    cgpa: "8.00 / 10",
  },

  about: [
    "I'm an AI and Data Science undergraduate at KJ Somaiya College of Engineering in Mumbai, graduating in May 2027. My work sits where applied machine learning meets things people actually use — gesture recognition, financial forecasting, retrieval systems.",
    "Two of my projects became preprints. I care about the part after the model trains: what the features actually say, where the baseline still wins, and whether the thing holds up outside the notebook.",
  ],

  links: {
    // TODO: confirm the public email to display.
    email: "TODO@example.com",
    github: "https://github.com/harshit-1243",
    // TODO: confirm LinkedIn URL.
    linkedin: "TODO",
    // TODO: copy the PDF into public/ before this resolves.
    resume: "/Harshit_Modi_Resume.pdf",
  },

  papers: [
    {
      title: "Real-Time Sign Language Recognition Using MediaPipe Hand Landmarks",
      venue: "Preprint",
      status: "Preprint",
      year: "2025",
      // TODO: add DOI once assigned.
      doi: undefined,
      abstract:
        "A real-time American Sign Language recognition pipeline built on MediaPipe's 21-point hand topology, trained on a corpus of roughly 87,000 labelled images. Using normalised landmark geometry rather than raw pixels keeps the model small enough to run live in a browser while staying robust to lighting and skin tone.",
    },
    {
      title: "Predicting Quarterly Earnings Surprises on the NSE from Fundamental Ratios",
      venue: "Preprint",
      status: "Preprint",
      year: "2025",
      doi: undefined,
      abstract:
        "A 35-feature model over National Stock Exchange fundamentals, predicting the direction of quarterly earnings surprises. Feature-importance analysis puts cash-flow quality clearly ahead of the margin, leverage, growth and valuation families that dominate conventional screens.",
    },
  ] satisfies Paper[],

  projects: [
    {
      slug: "sign-language-detection",
      title: "Real-Time ASL Recognition",
      tagline: "Live sign language detection from hand landmark geometry",
      period: "2025",
      stack: ["Python", "MediaPipe", "TensorFlow", "OpenCV"],
      summary:
        "Recognises American Sign Language letters in real time from webcam input, using MediaPipe's 21-landmark hand topology instead of raw pixels.",
      detail: [
        "MediaPipe gives 21 3D landmarks per hand. Working in that space rather than on pixels means the classifier never has to learn to ignore lighting, background or skin tone — the normalisation does that for free, and the input drops from a full image to 63 floats.",
        "The training corpus is roughly 87,000 labelled images. Landmarks are normalised against wrist position and hand scale so the same sign at different distances from the camera lands in the same region of feature space.",
        "The payoff is latency. Because the feature vector is tiny, inference runs comfortably inside a single video frame's budget, which is what makes it usable as an interface rather than a demo.",
      ],
      metrics: [
        { label: "Training images", value: "87K" },
        { label: "Hand landmarks", value: "21" },
        { label: "Feature dimensions", value: "63" },
      ],
      // TODO: add the public repo link.
      links: [] as ProjectLink[],
    },
    {
      slug: "nse-earnings-prediction",
      title: "NSE Earnings Prediction",
      tagline: "Which fundamentals actually predict an earnings surprise",
      period: "2025",
      stack: ["Python", "scikit-learn", "pandas", "XGBoost"],
      summary:
        "A 35-feature model over National Stock Exchange fundamentals that predicts the direction of quarterly earnings surprises — and says which ratios carry the signal.",
      detail: [
        "The interesting output here isn't the accuracy number, it's the feature importances. Cash-flow quality dominates, well ahead of the margin, leverage, growth and valuation families that most retail screens are built around.",
        "That matters because those other families are heavily correlated with each other. Treating them as independent signals — which a naive screen does — double-counts the same underlying story and leaves cash-flow underweighted.",
        "The 3D landscape on the home page is this result: a 34×34 surface over the feature space, with the tallest peak being cash-flow quality and the secondary ridges the correlated ratio families.",
      ],
      metrics: [
        { label: "Features", value: "35" },
        { label: "Dominant signal", value: "Cash-flow quality" },
        { label: "Market", value: "NSE" },
      ],
      links: [] as ProjectLink[],
    },
    {
      slug: "fitmentor-ai",
      title: "FitMentor AI",
      tagline: "Retrieval-augmented fitness guidance that beats a rule-based baseline",
      period: "2025",
      stack: ["Python", "RAG", "Vector search", "LLM APIs"],
      summary:
        "A retrieval-augmented assistant for training and nutrition questions, benchmarked against a conventional rule-based recommender.",
      detail: [
        "Rule-based fitness advice is fine on the common cases and falls apart on the long tail — the qualified, conditional questions that don't map onto a lookup table. That's exactly where the retrieval pipeline pulled ahead.",
        "Queries are embedded and matched against a document store, with the retrieved passages grounding the generated answer. The win isn't fluency, it's that the answer stays anchored to a source instead of being improvised.",
        "The retrieval lattice in the 3D scene is a literal picture of this: a query node at the centre, documents sampled around it, and edges built by actual k-nearest-neighbour search over their positions.",
      ],
      metrics: [
        { label: "Retrieval", value: "kNN over embeddings" },
        { label: "Baseline", value: "Rule-based" },
        { label: "Strength", value: "Long-tail queries" },
      ],
      links: [] as ProjectLink[],
    },
  ] satisfies Project[],

  // TODO: confirm real entries. Empty renders an honest placeholder rather than
  // inventing history.
  experience: [] as {
    org: string;
    role: string;
    period: string;
    detail: string;
  }[],

  skills: [
    { group: "Languages", items: ["Python", "TypeScript", "SQL", "C++"] },
    {
      group: "ML & Data",
      items: ["PyTorch", "TensorFlow", "scikit-learn", "pandas", "NumPy", "OpenCV"],
    },
    {
      group: "Systems",
      items: ["RAG pipelines", "Vector search", "MediaPipe", "Feature engineering"],
    },
    { group: "Web", items: ["Next.js", "React", "Three.js", "Tailwind"] },
  ],
} as const;

export type Profile = typeof profile;
