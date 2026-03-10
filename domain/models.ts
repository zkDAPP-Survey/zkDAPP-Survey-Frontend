export type ID = string;
export type ISODateString = string;
export type WalletAddress = string;
export type CurrencyCode = 'USD' | 'USDC' | 'EUR' | 'TOKEN' | string;

/* ---------------------------------- */
/* enums / unions                     */
/* ---------------------------------- */

export type SurveyStatus = "active" | "draft" | "results";

export type SurveyVisibility = 'public' | 'unlisted' | 'private';

export type SurveyRole = 'creator' | 'voter' | 'admin';

export type RewardDistributionMode =
  | 'instant'
  | 'after_completion'
  | 'manual'
  | 'wallet_claim';

export type RewardStatus =
  | 'not_applicable'
  | 'eligible'
  | 'pending'
  | 'paid'
  | 'unpaid'
  | 'cap_reached'
  | 'failed';

export type EligibilityDecision =
  | 'qualify'
  | 'not_qualified'
  | 'unknown'
  | 'already_voted'
  | 'verification_required';

export type RequirementType =
  | 'Age'
  | 'Location'
  | 'Education level'
  | '';

export type QuestionType = //
  | 'single_choice'
  | 'multiple_choice'
  | 'textarea';

export type VoteLifecycleStatus =
  | 'draft'
  | 'ready'
  | 'submitted'
  | 'verifying'
  | 'verified'
  | 'recorded'
  | 'reward_pending'
  | 'reward_paid'
  | 'failed';

export type VerificationProvider = 'valera' | 'eudi' | 'wallet' | 'custom';

export type VerificationStepStatus = 'pending' | 'in_progress' | 'done' | 'failed';

export type SortKey = "rewardDesc" | "rewardAsc" | "nameAsc";

export type CreatorAction =
  | 'manage'
  | 'edit'
  | 'publish'
  | 'pause'
  | 'resume'
  | 'end'
  | 'share'
  | 'export_csv'
  | 'view_results';

export type SurveyListVariant =
  | 'explore'
  | 'available'
  | 'created'
  | 'participated'
  | 'active'
  | 'history';

/* ---------------------------------- */
/* primitives / reusable small shapes */
/* ---------------------------------- */

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface DateRange {
  startAt?: ISODateString;
  endAt?: ISODateString;
}

export interface SurveyTag {
  id: ID;
  label: string;
  kind?: 'category' | 'topic' | 'status' | 'metadata';
}

export interface SurveyCategory {
  id: ID;
  label: string;
}

export interface SurveyBadge {
  id: ID;
  label: string;
  tone:
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'primary';
}

export interface SurveyRequirement { //
  id: ID;
  type: RequirementType;
  value: string;
}

export interface EligibilityCheckResult {
  decision: EligibilityDecision;
  matchedRequirements: ID[];
  failedRequirements: ID[];
  message?: string;
  checkedAt?: ISODateString;
}

export interface SurveyBudget {
  rewardPerVoter?: Money;
  paidCap?: number;
  rewardPool?: Money;
  platformFee?: Money;
  totalCost?: Money;
  spentAmount?: Money;
  remainingBudget?: Money;
  distributionMode?: RewardDistributionMode;
}

export interface SurveyProgress {
  responseCount?: number;
  paidResponseCount?: number;
  targetResponses?: number;
  paidCap?: number;
  paidSlotsLeft?: number;
  progressPercent?: number;
}

export interface SurveyTimeInfo {
  opensAt?: ISODateString;
  closesAt?: ISODateString;
  closedAt?: ISODateString;
  isOpen?: boolean;
  daysRemaining?: number;
  displayLabel?: string;
}

export interface SurveyCardMeta {
  estimatedMinutes?: number;
  responseCount?: number;
  paidCap?: number;
  closesAt?: ISODateString;
  eligibility?: EligibilityDecision;
  hasVoted?: boolean;
}

/* ---------------------------------- */
/* question / answer / result models  */
/* ---------------------------------- */

export interface SurveyQuestionOption {
  id: ID;
  label: string;
  value?: string;
  order: number;
}

export interface SurveyQuestionValidation {
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface SurveyQuestion { //
  id: ID;
  order: number;
  type: QuestionType;
  title: string;
  options?: SurveyQuestionOption[];
  isRequired: boolean;
}

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface SurveyAnswer {
  questionId: ID;
  type: QuestionType;
  value: AnswerValue;
  answeredAt?: ISODateString;
}

export interface VoteAnswerDraft {
  questionId: ID;
  value: AnswerValue;
  isValid: boolean;
  error?: string;
}

export interface SurveyQuestionResultOption {
  optionId: ID;
  label: string;
  count: number;
  percent: number;
}

export interface SurveyQuestionResult {
  questionId: ID;
  questionTitle: string;
  questionType: QuestionType;
  totalResponses: number;
  options?: SurveyQuestionResultOption[];
  textSampleCount?: number;
}

/* ---------------------------------- */
/* main survey models                 */
/* ---------------------------------- */

export interface SurveySummary {
  id: ID;
  title: string;
  description: string;
  shortDescription?: string;
  status: SurveyStatus;
  visibility?: SurveyVisibility;

  categories: SurveyCategory[];
  tags?: SurveyTag[];
  badges?: SurveyBadge[];

  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  publishedAt?: ISODateString;

  timeline?: DateRange;
  timeInfo?: SurveyTimeInfo;

  budget?: SurveyBudget;
  progress?: SurveyProgress;

  requirements?: SurveyRequirement[];
  eligibility?: EligibilityCheckResult;

  estimatedMinutes?: number;
  questionCount?: number;

  anonymityMode?: boolean;
  creatorId?: ID;
  creatorDisplayName?: string;
}

export interface SurveyCardData extends SurveySummary {
  listVariant: SurveyListVariant;
  primaryActionLabel?: string;
  primaryAction?: CreatorAction | 'vote' | 'continue' | 'details';
}

export interface SurveyDetail extends SurveySummary {
  questions?: SurveyQuestion[];
  canParticipate?: boolean;
  hasVoted?: boolean;
  rewardStatus?: RewardStatus;
  voterMessage?: string;
}

export interface SurveyManageDetail extends SurveyDetail {
  recentResponses?: CreatorRecentResponse[];
  allowedActions?: CreatorAction[];
}

export interface SurveyResultDetail extends SurveySummary {
  results: SurveyQuestionResult[];
  totalResponses: number;
  paidResponses?: number;
  paidOut?: Money;
}

/* ---------------------------------- */
/* creation flow models               */
/* ---------------------------------- */

export interface SurveyDraft { //
  name: string;
  description: string;
  startDate: string | null; // ISO string
  endDate: string | null; // ISO string
  tags: string[];
  category: string;
  questions: SurveyQuestion[];
  requirements: SurveyRequirement[];
  rewardPerVoter: number | null;
  voterCap: number | null;
}

export interface CreatedSurveyCardData { //
    id: string;
    title: string;
    category: string;
    status: SurveyStatus;
    rewardPerVoter?: number;
    endsAt?: string | null;
    responsesCurrent?: number;
    responsesTarget?: number;
    spent?: number;
    budget?: number;
    totalSpent?: number;
};

/* ---------------------------------- */
/* vote / participation models        */
/* ---------------------------------- */

export interface VoteSessionProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestionIds: ID[];
  percentComplete: number;
}

export interface VoteVerificationStep {
  id: ID;
  label: string;
  status: VerificationStepStatus;
  message?: string;
}

export interface VoteVerificationState {
  provider: VerificationProvider;
  walletAddress?: WalletAddress;
  deeplinkUrl?: string;
  qrCodeUrl?: string;
  sessionId?: ID;
  expiresAt?: ISODateString;
  steps?: VoteVerificationStep[];
}

export interface VoteSession {
  id: ID;
  surveyId: ID;
  surveyTitle: string;

  status: VoteLifecycleStatus;
  startedAt: ISODateString;
  submittedAt?: ISODateString;
  verifiedAt?: ISODateString;
  completedAt?: ISODateString;

  currentQuestionIndex: number;
  totalQuestions: number;
  answers: VoteAnswerDraft[];

  eligibility?: EligibilityCheckResult;
  verification?: VoteVerificationState;

  reward?: Money;
  rewardStatus?: RewardStatus;
}

export interface VoteSubmissionReceipt {
  voteId: ID;
  surveyId: ID;
  submittedAt: ISODateString;
  status: VoteLifecycleStatus;
  verificationStatus: 'verified' | 'pending' | 'failed';
  reward?: Money;
  rewardStatus?: RewardStatus;
  walletAddress?: WalletAddress;
}

export interface VoteHistoryItem {
  voteId: ID;
  surveyId: ID;
  surveyTitle: string;
  categoryLabel?: string;
  votedAt: ISODateString;
  rewardStatus: RewardStatus;
  reward?: Money;
  note?: string;
}

export interface ParticipatedSurveySummary { //
  id: string;
  title: string;
  category: string;
  votedAt: ISODateString;
  rewardStatus: RewardStatus;
  reward?: Money;
};

export interface VoterDashboardStats {
  totalEarned?: Money;
  totalVoted: number;
  unpaidVotes: number;
}

/* ---------------------------------- */
/* creator dashboard models           */
/* ---------------------------------- */

export interface CreatorRecentResponse {
  id: ID;
  pseudonym: string; // e.g. "Anon #4821"
  respondedAt: ISODateString;
  rewardStatus: RewardStatus;
  reward?: Money;
}

export interface CreatorSurveyStats {
  totalResponses: number;
  paidResponses: number;
  paidCap: number;
  remainingBudget?: Money;
  spentAmount?: Money;
}

export interface CreatedSurveySummary extends SurveySummary {
  allowedActions?: CreatorAction[];
}

export interface CreatorDashboardSection {
  activeSurvey?: CreatedSurveySummary;
  createdSurveys?: CreatedSurveySummary[];
  completedSurveys?: CreatedSurveySummary[];
}

/* ---------------------------------- */
/* home / landing models              */
/* ---------------------------------- */

export interface HomeDashboardData {
  activeSurvey?: CreatedSurveySummary;
  recentlyParticipated?: ParticipatedSurveySummary[];
  availableForYou?: SurveyCardData[];
}
