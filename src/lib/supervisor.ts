import { logger } from "./logger";
import { PlanStep, ExecutionPlan } from "./planner";
import { validateAction, getRiskLevel, RiskLevel, DEFAULT_POLICY } from "./safety";

export interface ValidationResult {
    approved: boolean;
    reason?: string;
    modifiedSteps?: PlanStep[];
}

export class ExecutionSupervisor {
    public static async validatePlan(plan: ExecutionPlan): Promise<ValidationResult> {
        logger.info(`[SUPERVISOR] Validating plan for goal: ${plan.goal}`, { 
            action: "validate_plan", 
            goal: plan.goal,
            steps: plan.steps.length 
        });
        
        const modifiedSteps: PlanStep[] = [];

        for (const step of plan.steps) {
            const auditContext = {
                tool: step.tool,
                args: step.args,
                goal: plan.goal
            };

            // 1. Basic Safety Check
            const safety = await validateAction(step.tool, step.args);
            if (!safety.valid) {
                logger.error(`[REASONING] ❌ BLOCKED: ${step.tool}`, { 
                    ...auditContext, 
                    reason: safety.reason 
                });
                return { approved: false, reason: safety.reason };
            }

            // 2. Strict Confirmation Check
            const policy = DEFAULT_POLICY;
            if (policy.confirmationRequired.includes(step.tool)) {
                if (!step.args.confirmed) {
                    logger.warn(`[REASONING] ⚠️ PENDING CONFIRMATION: ${step.tool}`, auditContext);
                    return { 
                        approved: false, 
                        reason: `User confirmation required for ${step.tool}. I must ask the user for explicit approval before proceeding with this action.` 
                    };
                }
            }

            // 3. Risk Evaluation
            const risk = getRiskLevel(step.tool);
            logger.info(`[REASONING] ✅ APPROVED: ${step.tool}`, { 
                ...auditContext, 
                risk 
            });

            modifiedSteps.push(step);
        }

        logger.info(`[REASONING] 🚀 PLAN VALIDATED: ${plan.goal}`);

        return { approved: true, modifiedSteps };
    }

    public static async verifyOutput(tool: string, output: any): Promise<boolean> {
        // Post-execution verification
        if (tool === "cart_add" && !output.cart) {
            logger.warn(`[SUPERVISOR] Output verification failed for ${tool}`);
            return false;
        }
        return true;
    }
}
