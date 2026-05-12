// Goal-Oriented Agent Runtime
// Persistent goals that shape agent behavior across sessions

export enum GoalType {
    REVENUE = "REVENUE",
    RETENTION = "RETENTION",
    CONVERSION = "CONVERSION",
    ENGAGEMENT = "ENGAGEMENT",
    SUPPORT = "SUPPORT"
}

export interface RuntimeGoal {
    type: GoalType;
    label: string;
    priority: number; // 1-10
    active: boolean;
    metrics: {
        target: number;
        current: number;
        unit: string;
    };
}

// Default global goals — in production these would be stored in DB
const GLOBAL_GOALS: RuntimeGoal[] = [
    {
        type: GoalType.CONVERSION,
        label: "Improve checkout completion rate",
        priority: 10,
        active: true,
        metrics: { target: 0.35, current: 0.15, unit: "ratio" }
    },
    {
        type: GoalType.REVENUE,
        label: "Maximize average order value",
        priority: 8,
        active: true,
        metrics: { target: 150, current: 85, unit: "USD" }
    },
    {
        type: GoalType.RETENTION,
        label: "Reduce cart abandonment",
        priority: 7,
        active: true,
        metrics: { target: 0.20, current: 0.45, unit: "ratio" }
    }
];

export function getActiveGoals(): RuntimeGoal[] {
    return GLOBAL_GOALS.filter(g => g.active).sort((a, b) => b.priority - a.priority);
}

export function getPrimaryGoal(): RuntimeGoal {
    return getActiveGoals()[0];
}

export function getGoalDirective(): string {
    const primary = getPrimaryGoal();
    const secondary = getActiveGoals().slice(1, 3);

    const parts = [
        `[PRIMARY GOAL: ${primary.label}]`,
        `Progress: ${primary.metrics.current}/${primary.metrics.target} ${primary.metrics.unit}`,
    ];

    if (secondary.length) {
        parts.push(`Secondary goals: ${secondary.map(g => g.label).join(", ")}`);
    }

    return parts.join("\n");
}
