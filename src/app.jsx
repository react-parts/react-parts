/*jshint esnext:true, browserify:true */
'use strict';

import 'babel/polyfill';
import 'isomorphic-fetch';
import React from 'react/addons';
import Router from 'react-router';
import StylingMixin from './styling-mixin.jsx';
import NavBar from './nav-bar-component.jsx';
import ComponentList from './list-component.jsx';
import {Tabs, Tab} from './tabs-component.jsx';
import Pagination from './pagination-component.jsx';

let Route = Router.Route;
let RouteHandler = Router.RouteHandler;

export var App = React.createClass({
  mixins: [StylingMixin],
  contextTypes: {
    router: React.PropTypes.func
  },
  propTypes: {
    initialComponents: React.PropTypes.object.isRequired,
    perPage: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      perPage: 20
    };
  },
  getInitialState() {
    return {
      components: this.props.initialComponents,
      filtered: this.props.initialComponents[this.props.params.type]
    };
  },
  render() {
    let title = "React.parts";
    let type = this.props.params.type;
    let components = this.state.filtered;
    let componentsForPage = this.componentsForPage(components);

    let styles = {
      container:  {
        fontFamily: "Source Sans Pro, monospace",
        fontSize: this.remCalc(20),
        lineHeight: "1.5",
        cursor: "default"
      },
      title: {
        textAlign: "center"
      },
      content: {
        margin: "0 auto",
        fontSize: this.remCalc(17),
        maxWidth: this.remCalc(800),
        padding: this.remCalc(10)
      },
      footer: {
        color: "#999",
        fontSize: this.remCalc(16),
        fontWeight: 200,
        margin: this.remCalc(30, 0),
        textAlign: "center"
      },
      author: {
        color: "#3949ab",
        fontWeight: "bold",
        textDecoration: "none"
      }
    };
    return (
      <div style={styles.container}>
        <NavBar title={title} height={this.remCalc(55)} onSearch={this.handleSearch} />

        <div style={styles.content}>
          <h2 style={styles.title}>A catalog of React components</h2>
          <Tabs>
            <Tab to="components" params={{type: "native-ios"}}>React Native</Tab>
            <Tab to="components" params={{type: "web"}}>React for Web</Tab>
          </Tabs>

          <RouteHandler components={componentsForPage} />

          <Pagination
            to="components"
            params={{ type }}
            currentPage={this.currentPage()}
            perPage={this.props.perPage}
            totalItems={components.length}
          />
          <p style={styles.footer}>
            React, React Native and logos are copyright of Facebook.
            This page is not affiliated with Facebook.<br/>
            <a style={styles.author} href="http://madebyform.com">Made by Form</a>
          </p>
        </div>
      </div>
    );
  },
  componentWillReceiveProps(newProps) {
    let type = newProps.params.type;
    let components = this.state.components;

    // If the user changed tab, and we don't have the data, fetch it
    if (!components[type] || components[type].length === 0) {
      window.fetch(`/api/components/${type}`).then((response) => {
        response.json().then((data) => {
          components[type] = data;
          // Update both the complete and filtered components list s
          this.setState({ components, filtered: components[type] });
        });
      });
    } else {
      // We already have the data, simply reset the search filters
      this.setState({ filtered: components[type] });
    }
  },
  handleSearch(value) {
    // Get all components available for the current tab
    let components = this.state.components[this.props.params.type];

    let filtered = components.filter((c) => {
      return c.name.indexOf(value) != -1 || c.description.indexOf(value) != -1;
    });
    this.setState({ filtered });

    // TODO Improve this code: return to the first page
    this.context.router.transitionTo("/:type", this.props.params, {});
  },
  currentPage() {
    var currentPage = parseInt(this.props.query.page); // May return NaN
    if (isNaN(currentPage)) currentPage = 1; // This works, even for 0
    return currentPage;
  },
  componentsForPage(items) {
    let i = Math.max(0, (this.currentPage() - 1) * this.props.perPage);
    let j = Math.max(0, this.currentPage() * this.props.perPage);
    return items.slice(i, j);
  }
});

export var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="components" path=":type" handler={ComponentList} />
  </Route>
);

if (typeof(document) !== "undefined") {
  Router.run(routes, Router.HistoryLocation, function(Handler, state) {
    React.render(
      <Handler {...state} initialComponents={window.initialComponents} />,
      document.getElementById("container")
    );
  });
}
