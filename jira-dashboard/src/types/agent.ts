export interface SimilarBugMatch {
  key: string;
  summary: string;
  status: string;
  priority: string;
  reporter: string;
  assignee: string;
  labels: string;
  components: string;
  description: string;
  jiraUrl: string;
  similarity: number;
  matchType: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  matches?: SimilarBugMatch[];
}

export interface AgentInsights {
  potentialDuplicates: number;
  mostRepeatedIssues: { name: string; count: number }[];
  topProblemModules: { name: string; count: number }[];
  aiRiskDetection: number;
  recentlySimilarBugs: SimilarBugMatch[];
  criticalOpen: SimilarBugMatch[];
  topReporters: { name: string; count: number }[];
}

export interface DuplicateRecommendation {
  duplicate: boolean;
  title: string;
  similarity?: number;
  message: string;
  existingTickets?: SimilarBugMatch[];
}

export interface CreationAssistResult {
  ready?: boolean;
  message?: string;
  validation?: {
    complete: boolean;
    missing: string[];
    questions: string[];
  };
  extracted?: {
    issueType: string;
    expectedBehavior: string;
    actualBehavior: string;
    impact: string;
    catId: string;
    oaReportUrl: string;
    jiraReferences?: string;
    hasScreenshots?: boolean;
  };
  businessRules?: {
    projectKey: string;
    cdomIsExpected: boolean;
    oaIsProductUnderTest: boolean;
    titlePrefix?: string;
  };
  jiraDraft?: {
    project: string;
    issueType: string;
    summary: string;
    description: string;
    acceptanceCriteria: string;
    labels: string[];
    priority: string;
  };
  defectAnalysis?: {
    status: string;
    matchingTicket: string | null;
    recommendation: string;
    confidence?: string;
  };
  duplicateCheck: {
    duplicate: boolean;
    title: string;
    message: string;
    defectStatus?: string;
    matchingTicket?: string | null;
  };
  similarBugs: SimilarBugMatch[];
  recommendations: {
    labels: string[];
    priority: string;
    severity: string;
    assignee: string;
    components: string[];
    rootCausePatterns: string[];
    previousFixes: string[];
    workarounds: string[];
  };
}

export interface AgentStatus {
  indexed: number;
  lastIndexedAt: string | null;
  indexing: boolean;
  aiProvider: string;
  refreshIntervalMinutes?: number;
  refreshIntervalHours?: number;
  lastRefresh?: string | null;
}

export type DefectStatus =
  | 'Already Logged'
  | 'Covered by Existing Jira'
  | 'Known DEV Issue'
  | 'Covered By Parent Defect'
  | 'Duplicate of Existing Issue'
  | 'Genuine New Defect'
  | 'New Defect'; // legacy alias
export type DefectConfidence = 'High' | 'Medium' | 'Low';

export interface DefectAnalysisResult {
  status: DefectStatus;
  confidence: DefectConfidence;
  matchingTicket: string | null;
  reason: string;
  recommendation: string;
  similarityScore?: number;
  tier?: string;
  category?: string;
  component?: string;
  cdom?: string;
  oa?: string;
  signature?: {
    category: string;
    component: string;
    property: string;
    expected: string;
    actual: string;
  };
  similarityBreakdown?: {
    textSimilarity: number;
    semanticSimilarity: number;
    rootCauseSimilarity: number;
    componentSimilarity: number;
  };
  title?: string;
  description?: string;
  impact?: string;
  priority?: string;
  relatedTicket?: { key: string; summary: string; status: string; jiraUrl: string };
  relatedTickets?: string[];
  parentFamily?: string | null;
  issue?: string;
}

export interface DefectBatchResult {
  results: DefectAnalysisResult[];
  summary: {
    total: number;
    alreadyLogged: number;
    covered: number;
    knownIssue: number;
    newDefects: number;
  };
  finalRecommendation: {
    doNotRaise: string[];
    raise: string[];
  };
  report?: string;
}

export interface BugSummary {
  period: string;
  generatedAt: string;
  newBugs: number;
  closedBugs: number;
  criticalBugs: number;
  topProblemAreas: { name: string; count: number }[];
  trend: string;
  criticalList: { key: string; summary: string; status: string }[];
}
