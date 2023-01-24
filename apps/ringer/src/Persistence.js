import SolveStats from './SolveStats.js';

class Persistence {
    bestK = 3;
    sameK = 3;
    latestK = 10;

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

    setIdenticalStats(solveStats) {
        let solveStat = solveStats[0];
        let boardNum = solveStat.boardNum;
        let size = solveStat.size;
        let goal = solveStat.goal;
        let key = this.identicalStatsKey(boardNum, size, goal)
        localStorage.setItem(key, JSON.stringify(solveStats.slice(0, this.sameK)));
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

    setSizeGoalStats(solveStats) {
        let solveStat = solveStats[0];
        let size = solveStat.size;
        let goal = solveStat.goal;
        let key = this.sizeGoalStatsKey(size, goal);
        localStorage.setItem(key, JSON.stringify(solveStats.slice(0, this.bestK)));

    }

    sizeGoalRunningKey(size, goal) {
        return `run-${size}-${goal}`;
    }

    getSizeGoalRunningStats(solveStats) {
        let size = solveStats.size;
        let goal = solveStats.goal;
        let key = this.sizeGoalRunningKey(size, goal);
        let data = localStorage.getItem(key);
        if (data === undefined || data === null) {
            return { n: 0, mean: 0, var2:0, latest: [] };
        }
        let moving = JSON.parse(data);
        return moving;
    }

    setSizeGoalRunningStats(solveStats, moving) {
        let size = solveStats.size;
        let goal = solveStats.goal;
        let key = this.sizeGoalRunningKey(size, goal);
        localStorage.setItem(key, JSON.stringify(moving));
        return moving;
    }

    updateStats(solveStat) {
        // First, update the best for this particular config
        let identicals = this.getIdenticalStats(solveStat);
        let current = identicals.concat(solveStat);
        current.sort(SolveStats.compare);
        this.setIdenticalStats(current);

        // Update the best for this size and shuffle goal
        let similars = this.getSizeGoalStats(solveStat);
        let bests = similars.concat(solveStat);
        bests.sort(SolveStats.compare);
        this.setSizeGoalStats(bests);

        // Calculate running statistics
        let moving = this.getSizeGoalRunningStats(solveStat);
        moving.n = moving.n + 1;
        let delta = solveStat.time - moving.mean;
        moving.mean = moving.mean + delta / moving.n;
        let delta2 = solveStat.time - moving.mean; // Yes, the updated mean value
        moving.var2 = moving.var2 + (delta * delta2);
        moving.latest.push(solveStat.time);
        moving.latest = moving.latest.slice(-this.latestK);
        this.setSizeGoalRunningStats(solveStat, moving);
    }
}

export default Persistence;
