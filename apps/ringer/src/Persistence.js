import SolveStats from './SolveStats.js';

class Persistence {

    identicalStatsKey(boardNum, size, goal) {
        return `${boardNum}-${size}-${goal}`;
    }

    getIdenticalStats(solveStats) {
        let boardNum = solveStats.boardNum;
        let size = solveStats.size;
        let goal = solveStats.goal;
        let key = this.identicalStatsKey(boardNum, size, goal)
        let stats = localStorage.getItem(key);
        if (stats === undefined || stats === null) {
            return [];
        }
        let statsList = JSON.parse(stats).map((opts) => new SolveStats(opts));
        return statsList;
    }

    sizeGoalStatsKey(size, goal) {
        return `best-${size}-${goal}`;
    }

    getSizeGoalStats(solveStats) {
        let size = solveStats.size;
        let goal = solveStats.goal;
        let key = this.sizeGoalStatsKey(size, goal);
        let stats = localStorage.getItem(key);
        if (stats === undefined || stats === null) {
            return [];
        }
        let statsList = JSON.parse(stats).map((opts) => new SolveStats(opts));
        return statsList;
    }

    updateStats(solveStat) {
        let boardNum = solveStat.boardNum;
        let size = solveStat.size;
        let goal = solveStat.goal;

        // First, update the best for this particular config
        let identicals = this.getIdenticalStats(solveStat);
        let current = identicals.concat(solveStat);
        current.sort(SolveStats.compare);
        localStorage.setItem(this.identicalStatsKey(boardNum, size, goal),
            JSON.stringify(current.slice(0, 3)));

        // Update the best for this size and shuffle goal
        let similars = this.getSizeGoalStats(solveStat);
        let bests = similars.concat(solveStat);
        bests.sort(SolveStats.compare);
        localStorage.setItem(this.sizeGoalStatsKey(size, goal),
            JSON.stringify(bests.slice(0, 3)));
    }
}

export default Persistence;
