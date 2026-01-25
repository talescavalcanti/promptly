export type PlanType = 'STARTER' | 'PRO';

export type FeatureConfiguration = {
    dynamic_variables: boolean;
    code_snippets: boolean;
    version_history_limit: number | 'unlimited'; // Number of versions or 'unlimited'
    micro_apps_limit: number | 'unlimited';     // Number of active shares
    micro_apps_password: boolean;
};

export const PLAN_CONFIG: Record<PlanType, FeatureConfiguration> = {
    STARTER: {
        dynamic_variables: true,
        code_snippets: false, // UI shows upsell
        version_history_limit: 3,
        micro_apps_limit: 1,
        micro_apps_password: false,
    },
    PRO: {
        dynamic_variables: true,
        code_snippets: true,
        version_history_limit: 'unlimited',
        micro_apps_limit: 'unlimited',
        micro_apps_password: true,
    }
};

/**
 * Checks if a user has access to a specific boolean feature.
 * @param plan User's current plan
 * @param feature Feature key to check (must be a boolean feature)
 */
export function checkFeatureAccess(plan: PlanType, feature: keyof Pick<FeatureConfiguration, 'dynamic_variables' | 'code_snippets' | 'micro_apps_password'>): boolean {
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG.STARTER;
    return config[feature];
}

/**
 * Gets the numeric limit for a feature.
 * @param plan User's current plan
 * @param feature Feature key (must be a limit feature)
 */
export function getFeatureLimit(plan: PlanType, feature: keyof Pick<FeatureConfiguration, 'version_history_limit' | 'micro_apps_limit'>): number | 'unlimited' {
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG.STARTER;
    return config[feature];
}

/**
 * Helper to check if a usage count is within the limit.
 */
export function isWithinLimit(plan: PlanType, feature: keyof Pick<FeatureConfiguration, 'version_history_limit' | 'micro_apps_limit'>, currentUsage: number): boolean {
    const limit = getFeatureLimit(plan, feature);
    if (limit === 'unlimited') return true;
    return currentUsage < limit;
}
