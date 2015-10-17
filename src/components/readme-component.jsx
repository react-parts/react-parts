/*jshint esnext:true, browserify:true, unused:true */
'use strict';

import 'isomorphic-fetch';
import React from 'react/addons';
import StylingMixin from '../helpers/styling-mixin.jsx';
import Icon from './icon-component.jsx';

let PureRenderMixin = React.addons.PureRenderMixin;

let Links = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    android: React.PropTypes.bool,
    ios: React.PropTypes.bool
  },
  render() {
    let styles = {
      container: {
        WebkitFontSmoothing: "antialiased",
        boxSizing: "border-box",
        float: "right",
        fontSize: this.remCalc(15),
        letterSpacing: this.remCalc(-0.4)
      },
      link: {
        color: "#68777d",
        paddingLeft: this.remCalc(20),
        textDecoration: "none"
      },
      npmIcon: {
        fontSize: this.remCalc(24),
        verticalAlign: "bottom"
      },
      githubIcon: {
        fontSize: this.remCalc(20),
        verticalAlign: "middle"
      },
      label: {
        marginLeft: this.remCalc(6)
      }
    };

    return (
      <div style={styles.container}>
        <a style={styles.link} href={this.props.npmUrl}>
          <Icon icon="npm" style={styles.npmIcon} />
          <span className="u-hideSmall" style={styles.label}>
            View on NPM
          </span>
        </a>
        <a style={styles.link} href={this.props.githubUrl}>
          <Icon icon="github" style={styles.githubIcon} />
          <span className="u-hideSmall" style={styles.label}>
            View on GitHub
          </span>
        </a>
      </div>
    );
  }
});

/*
 * Displays the documentation of a component
 */
let Readme = React.createClass({
  mixins: [StylingMixin, PureRenderMixin],
  propTypes: {
    componentName: React.PropTypes.string.isRequired
  },
  getInitialState() {
    return {
      content: ""
    };
  },
  render() {
    let styles = {
      container: {
      },
      header: {
        background: "#e6f1f6",
        border: "1px solid #c1dce8",
        borderLeft: "none",
        borderRight: "none",
        padding: this.remCalc(8, 16)
      },
      content: {
        padding: this.remCalc(32)
      },
      npmInput: {
        fontFamily: "Consolas, Liberation Mono, Menlo, Courier, monospace",
        border: "none",
        background: "transparent",
        padding: 0,
        width: "50%"
      },
      loader: {
        padding: this.remCalc(32),
        textAlign: "center"
      },
      img: {
        width: this.remCalc(50),
        opacity: 0.2
      }
    };

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <input
            type="text"
            ref="install"
            style={styles.npmInput}
            value={`npm install --save ${ this.props.componentName }`}
            onClick={this.handleClick}
            readOnly
          />
          <Links {...this.props} />
        </div>

        { this.state.content &&
          <div style={styles.content}
            className="markdown-body"
            dangerouslySetInnerHTML={{__html: this.state.content }}
          /> }

        { !this.state.content &&
          <div style={styles.loader}>
            <img style={styles.img} src="/loader.gif" alt="Loading…" />
          </div> }
      </div>
    );
  },
  componentDidMount() {
    this.fetchContent(this.props.componentName);
  },
  componentWillReceiveProps(newProps) {
    if (this.props.componentName != newProps.componentName) {
      this.setState({ content: "" });
      this.fetchContent(newProps.componentName);
    }
  },
  fetchContent(componentName) {
    window.fetch(`/api/docs/${ componentName }`).then((response) => {
      response.json().then((data) => {
        this.setState({ content: data.doc });
      });
    });
  },
  handleClick() {
    let field = React.findDOMNode(this.refs.install);
    field.select();
  }
});

export default Readme;
