"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * The TestRunner is responsible for loading the test classes and keeping track
 * of the test suite's state.
 *
 * @require(qx.module.Io)
 */
qx.Class.define("testrunner.runner.TestRunner", {

  extend : testrunner.runner.TestRunnerBasic,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.TEST_MIXINS  = [qx.dev.unit.MMock, qx.dev.unit.MRequirements];
    if (qx.core.Environment.get("testrunner.performance")) {
      this.TEST_MIXINS.push(qx.dev.unit.MMeasure);
    }

    this.base(testrunner.runner.TestRunnerBasic, "constructor");

    // Get log appender element from view
    if (this.view.getLogAppenderElement) {
      this.__logAppender = new qx.log.appender.Element();
      qx.log.Logger.unregister(this.__logAppender);
      this.__logAppender.setElement(this.view.getLogAppenderElement());

      if (this._origin != "iframe") {
        qx.log.Logger.register(this.__logAppender);
      }
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    origin : null,
    __iframe : null,
    frameWindow : null,
    __loadAttempts : null,
    __logAppender : null,
    _externalTestClasses : null,

    TEST_MIXINS : null,


    _loadTests : function()
    {
      switch(this._origin) {
        case "iframe":
          // Load the tests from a standalone AUT
          this.__iframe = this.view.getIframe();
          q(this.__iframe).on("load", this._onLoadIframe, this);
          var src = qx.core.Environment.get("qx.testPageUri");
          src += "?testclass=" + this._testNameSpace;
          this.testSuiteState = "loading";
          this.view.autUri = src;
          break;
        case "inline":
          this._loadInlineTests();
          break;
        case "external":
          this._loadExternalTests();
          break;
        case "push":
          var pushType = "code";
          //var pushType = "uri";

          if (pushType == "uri") {
            this.__iframe = this.view.getIframe();
            this.frameWindow = this.__iframe.contentWindow;

            var evtFunc = function(event) {
              // Load the tests from a standalone AUT
              q(this.__iframe).on("load", this._onLoadIframe, this);
              var src = event.data + "?testclass=" + this._testNameSpace;
              this.testSuiteState = "loading";
              this.view.autUri = src;
            };

            var boundEvtFunc = evtFunc.bind(this);

            window.setTimeout(function() {
              boundEvtFunc({data : "html/tests-source.html"});
            }, 1000);
          }
          else if (pushType == "code") {
            q.io.xhr("../build/script/tests.js").on("load", function(req) {
              var test = req.responseText;
              this.__iframe = this.view.getIframe();
              var doc = q.getDocument(this.__iframe);
              var el =doc.createElement("script");
              el.text = test;
              doc.getElementsByTagName("head")[0].appendChild(el);

              this.loader = this.__iframe.contentWindow.testrunner.TestLoader.getInstance();
              this.loader.testNamespace = (this._testNameSpace);
              this._wrapAssertions(this.frameWindow);
              this._getTestModel();
            }, this).send();
          }
      }
    },


    /**
     * Loads test classes that are a part of the TestRunner application.
     *
     * @param nameSpace {String|Object} Test namespace to be loaded
     */
    _loadInlineTests : function(nameSpace)
    {
      //TODO
      throw new Error("Inline tests not yet reimplemented");
      // nameSpace = nameSpace || this._testNameSpace;
      // this.testSuiteState = ("loading");
      // this.loader = new qx.dev.unit.TestLoaderInline();
      // this.loader.testNamespace = (nameSpace);
      // this._wrapAssertions();
      // this._getTestModel();
    },


    // overridden
    _defineTestClass : function(testClassName, membersMap)
    {
      var qxClass = qx.Class;
      var classDef = {
        extend : qx.dev.unit.TestCase,
        members : membersMap
      };
      if (this.TEST_MIXINS) {
        classDef.include = this.TEST_MIXINS;
      }
      return qxClass.define(testClassName, classDef);
    },


    _runTests : function() {
      if (this.__logAppender) {
        this.__logAppender.clear();
      }
      this.base(testrunner.runner.TestRunnerBasic, "_runTests");
    },


    _getTestResult : function()
    {
      if (this._origin == "iframe" || this._origin == "push") {
        var frameWindow = this.__iframe.contentWindow;
        var testResult = new frameWindow.qx.dev.unit.TestResult();

      } else {
        var testResult = new qx.dev.unit.TestResult();
      }
      return testResult;
    },


    _onTestEnd : function(ev) {
      if (this._origin == "iframe" || this._origin == "push") {
        if (this.__logAppender) {
          this.__fetchIframeLog();
        }
      }

      this.base(testrunner.runner.TestRunnerBasic, "_onTestEnd");
    },


    /**
     * Waits until the test application in the iframe has finished loading, then
     * retrieves its TestLoader.
     * @param ev {qx.event.type.Event} Iframe's "load" event
     *
     * @lint ignoreDeprecated(alert)
     */
    _onLoadIframe : function(ev)
    {
      if (ev && ev.type == "load") {
        this.testSuiteState = ("loading");
      }

      if (!this.__loadAttempts) {
        this.__loadAttempts = 0;
      }
      this.__loadAttempts++;

      this.frameWindow = this.__iframe.contentWindow;

      if (this.__loadAttempts <= 300) {

        // Detect failure to access frame after some period of time
        if (!this.frameWindow.body) {
          if (this.__loadAttempts >= 20 && window.location.protocol == "file:") {
            alert("Failed to load application from the file system.\n\n" +
                  "The security settings of your browser may prohibit to access " +
                  "frames loaded using the file protocol. Please try the http " +
                  "protocol instead.");

            // Quit
            this.testSuiteState = ("error");
            return;
          }
        }

        // Repeat until testrunner in iframe is loaded
        if (!this.frameWindow.testrunner) {
          window.setTimeout(this._onLoadIframe.bind(this), 100);
          return;
        }

        this.loader = this.frameWindow.testrunner.TestLoader.getInstance();
        // Avoid errors in slow browsers

        if (!this.loader) {
          window.setTimeout(this._onLoadIframe.bind(this), 100);
          return;
        }

        if (!this.loader.suite) {
          window.setTimeout(this._onLoadIframe.bind(this), 100);
          return;
        }
      }
      else {
        this.testSuiteState = ("error");
        this.__loadAttempts = 0;
        return;
      }

      this.__loadAttempts = 0;

      var frameParts = this.frameWindow.qx.core.Environment.get("testrunner.testParts");
      if (frameParts instanceof this.frameWindow.Boolean) {
        frameParts = frameParts.valueOf();
      }
      if (frameParts) {
        for (var i = 0; i < frameParts.length; i++) {
          this._testParts.push(frameParts[i]);
        }
      }

      if (window.name == "selenium_myiframe") {
        this.frameWindow.selenium = true;
      }

      if (this.__logAppender) {
        this.__logAppender.clear();
      }

      if (qx.core.Environment.get("engine.name") !== "opera") {
        this._wrapAssertions(this.frameWindow);
      }
      this._getTestModel();
    },


    /**
     * Retrieves the AUT's log messages and writes them to the current appender.
     */
    __fetchIframeLog : function()
    {
      var w = this.__iframe.contentWindow;

      var logger;
      if (w.qx && w.qx.log && w.qx.log.Logger)
      {
        logger = w.qx.log.Logger;
        if (this.view.getLogLevel) {
          logger.setLevel(this.view.getLogLevel());
        }
        // Register to flush the log queue into the appender.
        logger.register(this.__logAppender);
        logger.clear();
        logger.unregister(this.__logAppender);
      }
    },

    dispose : function()
    {
      this._disposeObjects("__logAppender");
      this.__iframe = null;
      delete this.__iframe;
      this.frameWindow = null;
      delete this.frameWindow;
      this.base(testrunner.runner.TestRunnerBasic, "dispose");
    }
  }

});
