"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * A page is a widget which provides a screen with which users
 * can interact in order to do something. Most times a page provides a single task
 * or a group of related tasks.
 *
 * A qooxdoo mobile application is usually composed of one or more loosely bound
 * pages. Typically there is one page that presents the "main" view.
 *
 * Pages can have one or more child widgets from the {@link qx.ui.mobile}
 * namespace. Normally a page provides a {@link qx.ui.mobile.navigationbar.NavigationBar}
 * for the navigation between pages.
 *
 * To navigate between two pages, just call the {@link #show} method of the page
 * that should be shown. Depending on the used page manager a page transition will be animated.
 * There are several animations available. Have
 * a look at the {@link qx.ui.mobile.page.Manager} manager or {@link qx.ui.mobile.layout.Card} card layout for more information.
 *
 * A page has predefined lifecycle methods that get called by the used page manager
 * when a page gets shown. Each time another page is requested to be shown the currently shown page
 * is stopped. The other page, will be, if shown for the first time, initialized and started
 * afterwards. For all called lifecycle methods an event is fired.
 *
 * Call of the {@link #show} method triggers the following lifecycle methods:
 *
 * * <strong>initialize</strong>: Initializes the page to show
 * * <strong>start</strong>: Gets called when the page to show is started
 * * <strong>stop</strong>:  Stops the current page
 *
 * IMPORTANT: Define all child widgets of a page when the {@link #initialize} lifecycle
 * method is called, either by listening to the {@link #initialize} event or overriding
 * the {@link #_initialize} method. This is because a page can be instanced during
 * application startup and would then decrease performance when the widgets would be
 * added during constructor call. The <code>initialize</code> event and the
 * {@link #_initialize} lifecycle method are only called when the page is shown
 * for the first time.
 *
 */
qx.Class.define("qx.ui.mobile.page.Page",
{
  extend : qx.ui.mobile.Widget,
  include : qx.ui.mobile.core.MResize,


  construct : function(layout)
  {
    this.base(qx.ui.mobile.Widget, "constructor");
    this.layout = layout || new qx.ui.mobile.layout.VBox();
  },


  statics : {
    _currentPage : null,

    /**
     * Event handler. Called when the device is ready.
     */
    _onDeviceReady : function() {
      qxWeb(document).on("backbutton", qx.ui.mobile.page.Page._onBackButton)
        .on("menubutton", qx.ui.mobile.page.Page._onMenuButton);
    },


    /**
     * Event handler. Called when the back button of the device was pressed.
     */
    _onBackButton : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        var exit = true;
        if (qx.ui.mobile.page.Page._currentPage) {
          exit = qx.ui.mobile.page.Page._currentPage.back(true);
        }
        if (exit) {
          navigator.app.exitApp();
        }
      }
    },


    /**
     * Event handler. Called when the menu button of the device was pressed.
     */
    _onMenuButton : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        if (qx.ui.mobile.page.Page._currentPage) {
          qx.ui.mobile.page.Page._currentPage.menu();
        }
      }
    }
  },


  events :
  {
    /** Fired when the lifecycle method {@link #initialize} is called */
    "initialize" : null,

    /** Fired when the lifecycle method {@link #start} is called */
    "start" : null,

    /** Fired when the lifecycle method {@link #stop} is called */
    "stop" : null,

    /** Fired when the lifecycle method {@link #pause} is called */
    "pause" : null,

    /** Fired when the lifecycle method {@link #resume} is called */
    "resume" : null,

    /** Fired when the method {@link #back} is called. Data indicating
     *  whether the action was triggered by a key event or not.
     */
    "back" : "Object",

    /** Fired when the method {@link #menu} is called */
    "menu" : null,

    /** Fired when the method {@link #wait} is called */
    "wait" : null
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      init : "page"
    },


    /**
     * The current active life cycle state of this page.
     */
    lifeCycleState: {
      init: null,
      check: ["initialize", "start", "stop", "resume", "wait", "pause"],
      apply: "_applyLifeCycleState"
    },


    /**
     * The default animation to use for page transitions
     */
    defaultAnimation: {
      check : "String",
      init : "slide"
    }
  },


  members :
  {
    __initialized : false,

    // overridden
    show : function(properties)
    {
      if (qx.ui.mobile.page.Page._currentPage) {
        qx.ui.mobile.page.Page._currentPage.stop();
      }
      qx.ui.mobile.page.Page._currentPage = this;
      this.initialize();
      this.start();
      this.$$animationProperties = properties;
      this.base(qx.ui.mobile.Widget, "show");
      delete this.$$animationProperties;
    },


    // overridden
    exclude : function(properties)
    {
      this.stop();
      this.$$animationProperties = properties;
      this.base(qx.ui.mobile.Widget, "exclude");
      delete this.$$animationProperties;
    },


    /**
     * Fires the <code>back</code> event. Call this method if you want to request
     * a back action. For Android PhoneGap applications this method gets called
     * by the used page manager when the back button was pressed. Return <code>true</code>
     * to exit the application.
     *
     * @param triggeredByKeyEvent {Boolean} Whether the back action was triggered by a key event.
     * @return {Boolean} Whether the exit should be exit or not. Return <code>true</code
     *     to exit the application. Only needed for Android PhoneGap applications.
     */
    back : function(triggeredByKeyEvent)
    {
      qx.core.Init.getApplication().emit("back", triggeredByKeyEvent);
      this.emit("back", triggeredByKeyEvent);
      var value = this._back(triggeredByKeyEvent);
      return value || false;
    },


    /**
     * Override this method if you want to perform a certain action when back
     * is called.
     *
     * @param triggeredByKeyEvent {Boolean} Whether the back action was triggered by a key event.
     * @return {Boolean} Whether the exit should be exit or not. Return <code>true</code
     *     to exit the application. Only needed for Android PhoneGap applications.
     * @see #back
     * @abstract
     */
    _back : function(triggeredByKeyEvent)
    {

    },


    /**
     * Only used by Android PhoneGap applications. Called by the used page manager
     * when the menu button was pressed. Fires the <code>menu</code> event.
     */
    menu : function() {
      this.emit("menu");
    },


    /*
    ---------------------------------------------------------------------------
      Lifecycle Methods
    ---------------------------------------------------------------------------
    */

    /**
     * Lifecycle method. Called by the page manager when the page is shown.
     * Fires the <code>initialize</code> event. You should create and add all your
     * child widgets of the view,  either by listening to the {@link #initialize} event or overriding
     * the {@link #_initialize} method. This is because a page can be instanced during
     * application startup and would then decrease performance when the widgets would be
     * added during constructor call. The {@link #_initialize} lifecycle method and the
     * <code>initialize</code> are only called once when the page is shown for the first time.
     */
    initialize : function()
    {
      if (!this.isInitialized())
      {
        this._initialize();
        this.__initialized = true;
        this.lifeCycleState = "initialize";
      }
    },


    /**
     * Override this method if you would like to perform a certain action when initialize
     * is called.
     *
     * @see #initialize
     */
    _initialize : function()
    {

    },


    /**
     * Returns the status of the initialization of the page.
     *
     * @return {Boolean} Whether the page is already initialized or not
     */
    isInitialized : function()
    {
      return this.__initialized;
    },


    /**
     * Lifecycle method. Called by the page manager after the {@link #initialize}
     * method when the page is shown. Fires the <code>start</code> event. You should
     * register all your event listener when this event occurs, so that no page
     * updates are done when page is not shown.
     */
    start : function() {
      this._start();
      this.lifeCycleState = "start";
    },


    /**
     * Override this method if you would like to perform a certain action when start
     * is called.
     *
     * @see #start
     */
    _start : function()
    {

    },


    /**
     * Lifecycle method. Called by the page manager when another page is shown.
     * Fires the <code>stop</code> event. You should unregister all your event
     * listener when this event occurs, so that no page updates are down when page is not shown.
     */
    stop : function()
    {
      if(!this.isInitialized()) {
        return;
      }
      this._stop();
      this.lifeCycleState = "stop";
    },


    /**
     * Override this method if you would like to perform a certain action when stop
     * is called.
     *
     * @see #stop
     */
    _stop : function()
    {

    },


    /**
     * Lifecycle method. Not used right now. Should be called when the current page
     * is interrupted, e.g. by a dialog, so that page view updates can be interrupted.
     * Fires the <code>pause</code> event.
     */
    pause : function() {
      this._pause();
      this.lifeCycleState = "pause";
    },


    /**
     * Override this method if you would like to perform a certain action when pause
     * is called.
     *
     * @see #pause
     */
    _pause : function()
    {

    },


    /**
     * Lifecycle method. Not used right now. Should be called when the current page
     * is resuming from a interruption, e.g. when a dialog is closed, so that page
     * can resume updating the view.
     * Fires the <code>resume</code> event.
     */
    resume : function() {
      this._resume();
      this.lifeCycleState = "resume";
    },


    /**
     * Override this method if you would like to perform a certain action when resume
     * is called.
     *
     * @see #resume
     */
    _resume : function()
    {

    },


    /**
     * Lifecycle method. Not used right now. Should be called when the current page
     * waits for data request etc.
     * Fires the <code>wait</code> event.
     */
    wait : function() {
      this._wait();
      this.lifeCycleState = "wait";
    },


    /**
     * Override this method if you would like to perform a certain action when wait
     * is called.
     *
     * @see #wait
     */
    _wait : function()
    {

    },


    // property apply
    _applyLifeCycleState : function(value, old) {
      // TODO: better solution for event targets
      var self = this;
      var data = {
        getTarget: function() {
          return self;
        }
      };
      if(value == "start" || value == "stop") {
        qx.core.Init.getApplication().emit(value, data);
      }

      this.emit(value, data);
    }
  },


  classDefined : function(statics) {
    if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
    {
      qxWeb(document).on("deviceready", statics._onDeviceReady);
    }
  }
});
