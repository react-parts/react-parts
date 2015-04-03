/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import timeago from 'timeago';
import React from 'react/addons';
import StylingMixin from './styling-mixin.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let TimeAgo = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    dateTime: React.PropTypes.string.isRequired,
  },
  render() {
    let styles = {
      timestamp: {
        color: "#999",
        fontWeight: 200,
        paddingLeft: this.remCalc(8)
      },
    };

    return (
      <time dateTime={this.props.dateTime} style={styles.timestamp}>
        updated {timeago(this.props.dateTime)}
      </time>
    );
  }
});

export default TimeAgo;
