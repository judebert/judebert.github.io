import React from 'react';
import BoardDatastore from './BoardDatastore.js';
import './BoardInfo.css';

class BoardInfo extends React.Component {

    render() {
        const boardDatastore = this.props.boardDatastore || new BoardDatastore();
        const boardNum = this.props.boardNum;
        let info = boardDatastore.getBoardInfo(boardNum);
        let title = info.title ? <h4 className="BoardTitle">{info.title}</h4> : "";
        let credit = info.credit ? <div className="BoardCredit">from {info.credit}</div> : "";
        return (
            <div className="BoardInfo">
              {title}
              {credit}
              <div className="BoardDesc">
                {info.info}
              </div>
            </div>
        );
    }
}

export default BoardInfo;
