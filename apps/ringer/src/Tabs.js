import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.css';

/*
 * Cribbed from https://codepen.io/htmlcssfreebies/pen/WNpVeRK?editors=1100 which has some 
 * interesting mobile stuff, too.
 */
class Tabs extends React.Component {
    static propTypes = {
        children: PropTypes.instanceOf(Array).isRequired,
    }

    /*
     * Because there's no reliable CSS "parent" selector (:has() is not widely supported,
     * and does not allow pseudo-classes like :checked for our radio button),
     * all elements of the tab must have sibling or descendent relationships with their
     * radio input. That means that, *besides* the label, each tab needs an ID as well.
     */
    render() {
        let tabs = this.props.children.map((child, index) => {
            const rootId = child.props.id;
            const labelId = `${rootId}.label`;
            const inputId = `${rootId}.radio`;
            const startCheck = index === 0;
            return (
              <React.Fragment key={child.props.label}>
                <input key={inputId} id={inputId} name={this.props.name} type="radio" defaultChecked={startCheck}/>
                <label key={labelId} id={labelId} htmlFor={inputId}>{child.props.label}</label>
                <div className="Tab" key={rootId}>{child}</div>
              </React.Fragment>
            );
        });
        return (
            <div className="Tabs">
            {tabs}
            </div>
        );
    }

}

export default Tabs;
