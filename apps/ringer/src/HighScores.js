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
        let bestIdenticals = datastore.getIdenticalStats(current)
            .map((scoreStat, index) => {
                let k = `identical-stat-${index}`;
                return (
                <tr key={k}>
                  <td className="boardNum">{scoreStat.boardNum}</td>
                  <td className="moves">{scoreStat.moves}/{scoreStat.goal}</td>
                  <td className="time">{this.timerString(scoreStat.time/this.MS_PER_SEC)}</td>
                  <td className="hints">{scoreStat.hints}</td>
                  <td className="resets">{scoreStat.resets}</td>
                  <td className="undos">{scoreStat.undos}</td>
                  <td className="redos">{scoreStat.redos}</td>
                </tr>
                );
            }
        );
        let bestSizeGoal = datastore.getSizeGoalStats(current)
            .map((scoreStat, index) => {
                let k = `best-stat-${index}`;
                return (
                    <tr key={k}>
                      <td className="boardNum">{scoreStat.boardNum}</td>
                      <td className="moves">{scoreStat.moves}/{scoreStat.goal}</td>
                      <td className="time">{this.timerString(scoreStat.time/this.MS_PER_SEC)}</td>
                      <td className="hints">{scoreStat.hints}</td>
                      <td className="resets">{scoreStat.resets}</td>
                      <td className="undos">{scoreStat.undos}</td>
                      <td className="redos">{scoreStat.redos}</td>
                    </tr>
                );
            }
        );
        let running = datastore.getSizeGoalRunningStats(current);
        let deltaTime = this.timerString((current.time - running.time.mean) / this.MS_PER_SEC);
        let meanTime = this.timerString(running.time.mean / this.MS_PER_SEC);
        let var2TimeMs2 = running.time.var2 / running.time.n;
        let varianceTime = this.timerString(var2TimeMs2 / (this.MS_PER_SEC * this.MS_PER_SEC));
        let deltaMove = (current.moves - running.move.mean).toFixed(2);
        let meanMove = running.move.mean.toFixed(2);
        let varianceMove = (running.move.var2 / running.move.n).toFixed(2);
        return (
            <div className="HighScores">
              <h3 className="sizeGoalRunningTitle">{current.size}x{current.size}/{current.goal} Average</h3>
              <table className="sizeGoalRunning">
                <thead>
                <tr><th></th><th>Change</th><th>Mean</th><th>Variance</th></tr>
                </thead>
                <tbody>
                <tr><th>Time</th><td>{deltaTime}</td><td>{meanTime}</td><td>{varianceTime}</td></tr>
                <tr><th>Moves</th><td>{deltaMove}</td><td>{meanMove}</td><td>{varianceMove}</td></tr>
                </tbody>
              </table>
              <h3 className="identicalTitle">Best {current.size}x{current.size}/{current.goal} #{current.boardNum}</h3>
              <table className="identicalStats">
                <thead>
                <tr><th>Board#</th><th>Moves</th><th>Time</th><th>Hints</th><th>Resets</th><th>Undos</th><th>Redos</th></tr>
                </thead>
                <tbody>{bestIdenticals}</tbody>
              </table>
              <h3 className="sizeGoalTitle">Best {current.size}x{current.size}/{current.goal} any board</h3>
              <table className="sizeGoalStats">
                <thead>
                <tr><th>Board#</th><th>Moves</th><th>Time</th><th>Hints</th><th>Resets</th><th>Undos</th><th>Redos</th></tr>
                </thead>
                <tbody>{bestSizeGoal}</tbody>
              </table>
            </div>
        );
    }

    timerString(secs) {
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
        display += secs.toFixed(2).padStart(5, '0');
        return display;
    }
}

export default HighScores;
