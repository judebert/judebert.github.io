import React from 'react';
import PropTypes from 'prop-types';
import './Dialog.css';

class Dialog extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
        children: PropTypes.instanceOf(Array).isRequired,
    }

    render() {
        let classNames = this.props.active ? "Dialog asBlock" : "Dialog";
        return (
            <section className={classNames}>
              <div className="Dialog-wrapper">
                <div className="Dialog-buttons">{this.props.buttons}</div>
                <div className="Dialog-main">
                  {this.props.children}
                </div>
              </div>
            </section>
        );
    }
}

export default Dialog;
