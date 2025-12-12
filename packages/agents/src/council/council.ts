import { z } from 'zod';
import { ModelRouter, type ModelId } from '../router/model-router';
import type { RiskLevel } from '../agents/types';

/**
 * Council Vote Schema
 */
export const CouncilVoteSchema = z.object({
  model: z.string(),
  approved: z.boolean(),
  reasoning: z.string(),
  concerns: z.array(z.string()),
  timestamp: z.date(),
});

export type CouncilVote = z.infer<typeof CouncilVoteSchema>;

/**
 * Council Decision Schema
 */
export const CouncilDecisionSchema = z.object({
  actionId: z.string(),
  action: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  votes: z.array(CouncilVoteSchema),
  approved: z.boolean(),
  requiresHuman: z.boolean(),
  reasoning: z.string(),
  timestamp: z.date(),
});

export type CouncilDecision = z.infer<typeof CouncilDecisionSchema>;

/**
 * Council configuration by risk level
 *
 * High-risk: 2 model votes required
 * Critical-risk: 2 model votes + human notification required
 */
const COUNCIL_CONFIG: Record<
  'high' | 'critical',
  {
    requiredVotes: number;
    models: ModelId[];
    timeout: number;
    requiresHuman: boolean;
  }
> = {
  high: {
    requiredVotes: 2,
    models: ['claude-opus-4-5-20251101', 'gpt-5.2-pro'],
    timeout: 60000, // 1 minute
    requiresHuman: false,
  },
  critical: {
    requiredVotes: 2,
    models: ['claude-opus-4-5-20251101', 'gpt-5.2-pro'],
    timeout: 120000, // 2 minutes
    requiresHuman: true, // Always notify human
  },
};

/**
 * Council Approval Request Parameters
 */
export type CouncilApprovalParams = {
  actionId: string;
  action: string;
  context: string;
  riskLevel: RiskLevel;
  proposer: string;
};

/**
 * Council - Multi-model voting system for high-risk actions
 *
 * The council provides a safety layer for critical operations by requiring
 * multiple AI models to independently approve high-risk actions.
 *
 * Risk levels:
 * - low/medium: Auto-approved (no council needed)
 * - high: Requires 2/2 model approvals
 * - critical: Requires 2/2 model approvals + human notification
 */
export class Council {
  private router: ModelRouter;

  constructor(router: ModelRouter) {
    this.router = router;
  }

  /**
   * Request approval for an action from the council
   *
   * @param params - The approval request parameters
   * @returns CouncilDecision with vote results and approval status
   */
  async requestApproval(params: CouncilApprovalParams): Promise<CouncilDecision> {
    // Low/medium risk: auto-approve without council review
    if (params.riskLevel === 'low' || params.riskLevel === 'medium') {
      return {
        actionId: params.actionId,
        action: params.action,
        riskLevel: params.riskLevel,
        votes: [],
        approved: true,
        requiresHuman: false,
        reasoning: 'Auto-approved: Low/medium risk action',
        timestamp: new Date(),
      };
    }

    const config = COUNCIL_CONFIG[params.riskLevel as 'high' | 'critical'];
    const votes: CouncilVote[] = [];

    // Gather votes from council members in parallel
    const votePromises = config.models.map(async (model) => {
      try {
        const vote = await this.getVote(model, params);
        return vote;
      } catch (e) {
        console.error(`Council member ${model} failed to vote:`, e);
        // Return a rejection vote on error (conservative approach)
        return {
          model,
          approved: false,
          reasoning: `Vote failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
          concerns: ['Council member failed to provide vote'],
          timestamp: new Date(),
        };
      }
    });

    // Wait for all votes with timeout
    const timeoutPromise = new Promise<CouncilVote[]>((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, config.timeout);
    });

    const votesResult = await Promise.race([Promise.all(votePromises), timeoutPromise]);

    // Use votes if we got them, otherwise empty array (timeout)
    votes.push(...(votesResult.length > 0 ? votesResult : []));

    // Count approvals
    const approvals = votes.filter((v) => v.approved).length;
    const approved = approvals >= config.requiredVotes;

    // Compile all concerns from votes
    const allConcerns = votes.flatMap((v) => v.concerns);

    // Generate reasoning summary
    let reasoning = approved
      ? `Approved by ${approvals}/${votes.length} council members`
      : `Rejected: Only ${approvals}/${config.requiredVotes} required approvals`;

    if (votes.length === 0) {
      reasoning = 'Rejected: Council voting timed out';
    }

    if (allConcerns.length > 0) {
      reasoning = `${reasoning}. Concerns: ${allConcerns.join('; ')}`;
    }

    return {
      actionId: params.actionId,
      action: params.action,
      riskLevel: params.riskLevel,
      votes,
      approved,
      requiresHuman: config.requiresHuman,
      reasoning,
      timestamp: new Date(),
    };
  }

  /**
   * Get a vote from a specific model
   */
  private async getVote(
    _model: ModelId,
    params: {
      action: string;
      context: string;
      proposer: string;
    }
  ): Promise<CouncilVote> {
    const response = await this.router.complete({
      taskType: 'approval',
      messages: [
        {
          role: 'user',
          content: `You are a council member reviewing a high-risk action.

ACTION: ${params.action}
PROPOSED BY: ${params.proposer}
CONTEXT: ${params.context}

Review this action carefully. Consider:
1. Security implications
2. Financial impact
3. User experience impact
4. Reversibility
5. Compliance/legal concerns

Respond with JSON:
{
  "approved": boolean,
  "reasoning": "Your detailed reasoning",
  "concerns": ["List", "of", "concerns"]
}`,
        },
      ],
    });

    try {
      const parsed = JSON.parse(response.content) as {
        approved: boolean;
        reasoning: string;
        concerns?: string[];
      };

      return {
        model: response.model,
        approved: parsed.approved,
        reasoning: parsed.reasoning,
        concerns: parsed.concerns || [],
        timestamp: new Date(),
      };
    } catch (e) {
      // Conservative: reject if parsing fails
      return {
        model: response.model,
        approved: false,
        reasoning: 'Failed to parse response - rejecting for safety',
        concerns: ['Response parsing failed'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check if an action requires council approval
   */
  requiresApproval(riskLevel: RiskLevel): boolean {
    return riskLevel === 'high' || riskLevel === 'critical';
  }

  /**
   * Get the configuration for a risk level
   */
  getConfig(riskLevel: 'high' | 'critical') {
    return COUNCIL_CONFIG[riskLevel];
  }
}

/**
 * Singleton council instance for app-wide use
 */
let councilInstance: Council | null = null;

/**
 * Get or create the global Council instance
 */
export function getCouncil(router: ModelRouter): Council {
  if (!councilInstance) {
    councilInstance = new Council(router);
  }
  return councilInstance;
}

/**
 * Reset the global Council instance (useful for testing)
 */
export function resetCouncil(): void {
  councilInstance = null;
}
