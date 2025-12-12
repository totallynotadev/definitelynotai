/**
 * Council Approval System
 *
 * Multi-model voting system for high-risk actions.
 * Provides safety layer by requiring independent AI approval.
 */

export {
  CouncilVoteSchema,
  CouncilDecisionSchema,
  Council,
  getCouncil,
  resetCouncil,
  type CouncilVote,
  type CouncilDecision,
  type CouncilApprovalParams,
} from './council';
