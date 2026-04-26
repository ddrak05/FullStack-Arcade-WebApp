// Calculate profile level based on total XP
// Example:
// Level 1 = 0 XP
// Level 2 = 100 XP
// Level 3 = 400 XP ...

export function getLevel(xp) {
    if (!xp) return 0;

    // Level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100) + 1);
}

// Calculate how much XP is needed for the next level

export function getNextLevel(level) {
    return Math.pow(level, 2) * 100;
}

// Get progress percentage toward the next level
export function getLevelProgress (xp) {
    const currentLevel = getLevel(xp);

    const minXp = Math.pow(currentLevel - 1, 2) * 100;
    const maxXp = getNextLevel(currentLevel);

    const progress = ((xp - minXp) / (maxXp - minXp) * 100);
    return Math.floor(Math.min(Math.max(progress, 0), 100));
}
