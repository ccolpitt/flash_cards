export interface MasteryConfig {
    consecutiveCorrectThreshold: number;
    masteryMilestoneThresholds: number[];
    streakMinimum: number;
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
    consecutiveCorrectThreshold: 3,
    masteryMilestoneThresholds: [5, 10, 25, 50, 100],
    streakMinimum: 3,
};
