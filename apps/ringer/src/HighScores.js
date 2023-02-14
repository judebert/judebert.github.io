import React from 'react';
import './HighScores.css';

class HighScores extends React.Component {
    constructor(props) {
        super(props);
        this.MS_PER_SEC = 1000;
        this.SEC_PER_MIN = 60;
        this.SEC_PER_HOUR = 60 * this.SEC_PER_MIN;
        this.SEC_PER_DAY = 24 * this.SEC_PER_HOUR;
    }

    render() {
        let current = this.props.current;
        let datastore = this.props.datastore;
        if (!datastore || !current) {
            return (<div className="HighScore">No stats yet!</div>);
        }
        if (current.boardNum < 0) {
            return (<div className="HighScore">Tutorial boards ineligible for stats</div>);
        }
        if (current.boardNum === 0) {
            return (<div className="HighScore">Playground boards ineligible for stats</div>);
        }
        let bestSizeGoal = datastore.getSizeGoalStats(current)
            .map((scoreStat, index) => {
                let k = `best-stat-${index}`;
                return (
                    <tr key={k}>
                      <td className="boardNum">#{scoreStat.boardNum.toString(16).padStart(6, '0').toUpperCase()}</td>
                      <td className="moves">{scoreStat.moves}</td>
                      <td className="time">{this.timerString(scoreStat.time/this.MS_PER_SEC)}</td>
                      <td className="resets">{scoreStat.resets}</td>
                    </tr>
                );
            }
        );
        let running = datastore.getSizeGoalRunningStats(current);
        let meanTime = this.timerString(running.time.mean / this.MS_PER_SEC);
        let meanMove = running.move.mean.toFixed(2);

        let latestMoves = <div className="emptyText">No latest moves</div>;
        if (running.move.latest && running.move.latest.length > 0) {
            let latestMoveMax = Math.max(meanMove, running.move.latest.reduce((a, b) => a > b ? a : b));
            latestMoves = running.move.latest.map((moves, index) => 
                <div className="spark" key={`move-spark-${index}`} style={{height:`${100*moves/latestMoveMax}%`}}>
                  <div className="sparkValue" key={`move-spark-val-${index}`}>{moves}</div>
                </div>
            );
            latestMoves.push(
                <div className="mean" key="move-mean" style={{height:`${100*meanMove/latestMoveMax}%`}}>
                  <span className="meanLabel">{meanMove}</span>
                </div>);
        }

        let latestTimes = <div className="emptyText">No latest times</div>;
        if (running.time.latest && running.time.latest.length > 0) {
            let latestTimeMax = Math.max(running.time.mean, running.time.latest.reduce((a, b) => a > b ? a : b));
            latestTimes = running.time.latest.map((time, index) => 
                <div className="spark" key={`time-spark-${index}`} style={{height:`${(time/latestTimeMax)*100}%`}}>
                </div>
            );
            latestTimes.push(
                <div className="mean" key="time-mean" style={{height:`${100*running.time.mean/latestTimeMax}%`}}>
                  <span className="meanLabel">{meanTime}</span>
                </div>);
        }

        let moveHistogramBars = <div className="emptyText">No move history</div>;
        if (running.move.histogram && Object.entries(running.move.histogram).length > 0) {
            let sortedMoveCounts = Object.entries(running.move.histogram).sort((a, b) => a[0] - b[0]);
            let maxMoveCount = sortedMoveCounts.reduce((max, [moves, count]) => count > max ? count : max, 0);
            moveHistogramBars = sortedMoveCounts.map(([moves, count], index) => 
                <div className="spark" key={`move-hist-${index}`} style={{width:`${100*count/maxMoveCount}%`}}>
                  <div className="sparkLabel">{moves}</div>
                  <div className="sparkValue">{count}</div>
                </div>
            );
        }

        let timeHistogramBars = <div className="emptyText">No time history</div>;
        if (running.time.histogram && Object.entries(running.time.histogram).length > 0) {
            let sortedTimeCounts = Object.entries(running.time.histogram).sort((a, b) => a[0] - b[0]);
            sortedTimeCounts = sortedTimeCounts.map(([secs, count]) => [this.timerString(secs, "secs"), count]);
            let maxTimeCount = sortedTimeCounts.reduce((max, [time, count]) => count > max ? count : max, 0);
            timeHistogramBars = sortedTimeCounts.map(([time, count], index) => 
                <div className="spark" key={`time-hist-${index}`} style={{width:`${100*count/maxTimeCount}%`}}>
                  <div className="sparkLabel">{time}</div>
                  <div className="sparkValue">{count}</div>
                </div>
            );
        }
        return (
            <div className="HighScores">
              <h3 className="latestTitle">Previous {current.size}x{current.size}/{current.goal}</h3>
              <div className="move sparkline">
                <div className="caption" key='move-spark-caption'>Moves</div>
                {latestMoves}
              </div>
              <div className="time sparkline">
                <div className="caption" key="time-spark-caption">Time</div>
                {latestTimes}
              </div>
              <h3 className="sizeGoalRunningTitle">Best {current.size}x{current.size}/{current.goal}</h3>
              <table className="results">
                <thead>
                <tr><th></th><th>Moves</th><th>Time</th><th>Resets</th></tr>
                </thead>
                <tbody>
                {bestSizeGoal}
                </tbody>
              </table>
              <h3 className="moveHistogramTitle">Move History</h3>
              <div className="move histogram">
                {moveHistogramBars}
              </div>
              <h3 className="timeHistogramTitle">Time History</h3>
              <div className="time histogram">
                {timeHistogramBars}
              </div>
            </div>
        );
    }

    timerString(secs, resolution) {
        let display = "";
        if (secs < 0) {
            display = "-";
            secs = -secs;
        }
        let days = Math.floor(secs / this.SEC_PER_DAY);
        if (days > 0) {
            display += `${days}d`;
        }
        secs -= days * this.SEC_PER_DAY;
        let hours = Math.floor(secs / this.SEC_PER_HOUR);
        if (days > 0 || hours > 0) {
            display += String(hours).padStart(2, '0') + ':';
        }
        secs -= hours * this.SEC_PER_HOUR;
        let mins = Math.floor(secs / this.SEC_PER_MIN);
        display += String(mins).padStart(2, '0') + ':';
        secs -= mins * this.SEC_PER_MIN;
        if (resolution && resolution === 'secs') {
            return display + secs.toFixed(0).padStart(2, '0')
        }
        display += secs.toFixed(2).padStart(5, '0');
        return display;
    }
}

export default HighScores;
