import SolveStats from './SolveStats.js';

class Persistence {
    bestK = 3;
    sameK = 3;
    latestK = 10;
    version = 1.0;
    initialCumulative = new Map([
        [1.0, 
            { 
                time: { n: 0, mean: 0, var2: 0, latest: [], },
                move: { n: 0, mean: 0, var2: 0, latest: [], },
            }
        ],
    ]);

    migrateData() {
        let dataVersion = Number.parseFloat(localStorage.getItem('version'));
        // Run successive migrations until we're up-to-date
        //
        // Since we don't store all data, only best data, this might get a little inaccurate.
        // First off, most people don't do more than 3 tries (the number we store) for any board.
        // Secondly, it's a game, not a scientific study.
        while (dataVersion !== this.version) {
            // Earliest versions, with no version number, to 1.0
            if (Number.isNaN(dataVersion)) {
                // No change to individual board stats
                // No change to best scores stats
                // Running stats only include time; add move stats
                // Group all stats by (size, goal) type
                let sizeGoalStats = this._groupStoredStatsV0();
                sizeGoalStats.forEach((stats, sizeGoal) => {
                    let cumulative = stats.reduce((accumulated, stat) => {
                        return this._accumulateSizeGoalStats(accumulated, stat);
                    }, this.initialCumulative.get(1.0));
                    // Store updated stats
                    this.setSizeGoalRunningStats(stats[0], cumulative);
                });
                localStorage.setItem('version', "1.0");
            }
            dataVersion = Number.parseFloat(localStorage.getItem('version'));
        }
    }
    
    _groupStoredStatsV0() {
        let sizeGoalStats = new Map();
        for (let keyDx = 0; keyDx < localStorage.length; keyDx++) {
            const key = localStorage.key(keyDx);
            const dashDx = key.indexOf('-');
            if (dashDx < 0) {
                console.error(`Skipping unrecognized V0 key: ${key}!`);
                continue;
            }
            const type = key.substring(0, dashDx);
            const sizeGoal = key.substring(dashDx + 1);
            if (!sizeGoalStats.has(sizeGoal)) {
                sizeGoalStats.set(sizeGoal, []);
            }
            if (type === 'best' || type === 'run') {
                continue;
            }
            let boardStats = JSON.parse(localStorage.getItem(key)).map((line) => new SolveStats(line));
            sizeGoalStats.set(sizeGoal, sizeGoalStats.get(sizeGoal).concat(boardStats));
        }
        return sizeGoalStats;
    }

    identicalStatsKey(boardNum, size, goal) {
        return `${boardNum}-${size}-${goal}`;
    }

    getIdenticalStats(solveStats) {
        this.migrateData();
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
        this.migrateData();
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
        this.migrateData();
        let size = solveStats.size;
        let goal = solveStats.goal;
        let key = this.sizeGoalRunningKey(size, goal);
        let data = localStorage.getItem(key);
        if (data === undefined || data === null) {
            return this.initialCumulative.get(this.version);
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
        let moving = this._accumulateSizeGoalStats(this.getSizeGoalRunningStats(solveStat), solveStat);
        this.setSizeGoalRunningStats(solveStat, moving);
    }

    _accumulateSizeGoalStats(previous, datum) {
        let cumulative = Object.assign({}, previous);
        // Times
        cumulative.time = this._accumulateStat(cumulative.time, datum.time);
        // Moves
        cumulative.move = this._accumulateStat(cumulative.move, datum.moves);
        return cumulative;
    }

    _accumulateStat(previous, datum) {
        let cumulative = Object.assign({}, previous);
        cumulative.n = cumulative.n + 1;
        let delta = datum - cumulative.mean;
        cumulative.mean = cumulative.mean + delta / cumulative.n;
        let delta2 = datum - cumulative.mean; // Yes, the updated mean value.
        cumulative.var2 = cumulative.var2 + (delta * delta2);
        cumulative.latest.push(datum);
        cumulative.latest = cumulative.latest.slice(-this.latestK);
        return cumulative;
    }
}

export default Persistence;
