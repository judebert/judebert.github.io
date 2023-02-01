import React from 'react';
import BoardDatastore from './BoardDatastore.js';

class BoardInfo extends React.Component {

    render() {
        const boardDatastore = this.props.boardDatastore || new BoardDatastore();
        const boardNum = this.props.boardNum;
        let info = boardDatastore.getBoardInfo(boardNum);
        let title = info.title ? <h4 className="BoardTitle">{info.title}</h4> : "";
        return (
            <div className="BoardInfo">
              {title}
              <div className="BoardDesc">
                {info.info}
              </div>
            </div>
        );
    }
}

export default BoardInfo;
