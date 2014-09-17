/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Test Runner mobile view
 *
 * @asset(qx/icon/Tango/22/actions/media-playback-start.png)
 * @asset(qx/icon/Tango/22/actions/media-playback-stop.png)
 * @asset(testrunner/view/mobile/*)
 */
qx.Class.define("testrunner.view.mobile.Mobile", {

  extend : testrunner.view.Abstract,

  construct : function()
  {
    this._initPage();
  },

  members :
  {
    __mainPage : null,
    __detailPage : null,
    __mainButton : null,
    __iframe : null,
    __testList : null,
    __testListWidget : null,
    __testRows : null,
    __statusLabel : null,
    __suiteResults : null,

    /**
     * Run the suite, or stop a running suite.
     */
    _onMainButtonTap : function()
    {
      var suiteState = this.testSuiteState;
      if (suiteState == "ready" || suiteState == "finished" || suiteState == "aborted") {
        if (suiteState == "finished" || suiteState == "aborted") {
          this._clearResults();
        }
        this.__suiteResults = {
          startedAt : new Date().getTime(),
          finishedAt : null,
          tests : {}
        };
        this.emit("runTests");
      }
      else if (suiteState == "running") {
        this.emit("stopTests");
      }
    },

    /**
     * Creates the main and detail pages
     */
    _initPage : function()
    {
      this.__testRows = {};
      var mainPage = this.__mainPage = new qx.ui.mobile.page.NavigationPage();
      mainPage.title = "qx Test Runner";

      var mainButton = this.__mainButton = new testrunner.view.mobile.MainButton();
      mainButton.on("tap", this._onMainButtonTap, this);
      mainPage.getRightContainer().append(mainButton);

      mainPage.on("initialize", function()
      {
        this.__testRows = {};
        var list = this.__testListWidget = new qx.ui.mobile.list.List({
          configureItem : this._configureListItem.bind(this)
        });
        list.on("changeSelection", this._onListChangeSelection, this);
        mainPage.getContent().append(list);

        var statusBar = this._getStatusBar();
        mainPage.append(statusBar);
      }, this);

      var detailPage = this.__detailPage = new qx.ui.mobile.page.NavigationPage();
      detailPage.showBackButton = true;
      detailPage.backButtonText = "Back";
      detailPage.title = "Result Details";
      detailPage.on("back", function() {
        mainPage.show({animation:"slide", reverse:true});
      },this);

      // Add the pages to the page manager.
      var manager = new qx.ui.mobile.page.Manager(false);
      manager.addDetail([mainPage, detailPage]);

      // mainPage will be shown at start
      mainPage.show();
    },

    /**
     * Configures a list item representing a single test function
     *
     * @param item {qx.ui.mobile.list.renderer.Default} Created list item
     * @param data {qx.core.Object} Model item
     * @param row {Integer} Index of the item's list row
     */
    _configureListItem : function(item, data, row)
    {
      if (!data) {
        return;
      }
      this.__testRows[data.fullName] = row;
      // This doesn't work since property changes on the item don't trigger
      // re-rendering of the list
      //data.bind("state", item, "subtitle");

      item.removeClasses(["start", "success", "failure", "skip"]);
      var testState = data.state;
      var hasExceptions = data.exceptions.length > 0;

      var cssClass, selectable;
      var subtitle = "<strong>" + testState + "</strong>";
      switch(testState) {
        case "start":
          cssClass = "start";
          selectable = false;
          break;
        case "success":
          cssClass = "success";
          selectable = false;
          break;
        case "skip":
          cssClass = "skip";
          selectable = true;
          break;
        case "error":
        case "failure":
          cssClass = "failure";
          selectable = true;
          break;
        default:
          selectable = false;
      }

      if (cssClass) {
        item.addClass(cssClass);
      }
      item.selectable = selectable;
      item.showArrow = selectable;

      if (hasExceptions) {
        subtitle += "<br/>" + this._getExceptionSummary(data.exceptions);
      }
      item.setSubtitle(subtitle);

      item.setTitle(data.fullName);
      var self = this;
      data.on("changeState", function(ev) {
        var idx = self.__testRows[data.fullName];
        // Force the list to update by re-applying the model
        self.__testListWidget.model.setItem(idx, null);
        self.__testListWidget.model.setItem(idx, data);
      });
    },

    /**
     * Returns the string representations of the given exceptions, joined with
     * "<br/>"
     * @param exceptions {Map[]} List of exception maps
     * @return {String} Exception summary
     */
    _getExceptionSummary : function(exceptions)
    {
      return exceptions.map(function(ex) {
        return (ex.exception.message || ex.exception.toString()).replace(/\n/g, "<br/>");
      }).join("<br/>");
    },

    /**
     * Returns the status bar widget
     *
     * @return  {qx.ui.mobile.form.Group} Group widget
     */
    _getStatusBar : function()
    {
      var statusBar = new qx.ui.mobile.Widget(new qx.ui.mobile.layout.HBox());
      var statusGroup = new qx.ui.mobile.form.Group([statusBar]);
      statusGroup.setAttribute("id", "statusgroup");
      this.__statusLabel = new qx.ui.mobile.basic.Label("Loading...");
      statusBar.append(this.__statusLabel);
      return statusGroup;
    },

    /**
     * Creates (if necessary) and returns the AUT iframe
     *
     * @return {Iframe} AUT Iframe element
     */
    getIframe : function()
    {
      if (!this.__iframe) {
        this.__iframe = qx.bom.Iframe.create({
          id: "autframe"
        });

        var iframeWidget = new qx.ui.mobile.Widget();
        iframeWidget.append(this.__iframe);
        iframeWidget.insertAfter(this.__testListWidget);
      }

      return this.__iframe;
    },

    /**
     * (Re)Loads the AUT in the iframe.
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri : function(value, old)
    {
      if (!value || value == old) {
        return;
      }

      var frame =this.getIframe();
      qx.bom.Iframe.setSource(frame, value);
    },

    /**
     * Writes a message to the status bar
     *
     * @param value {String} New status value (HTML supported)
     * @param old {String} Previous status value
     */
    _applyStatus : function(value, old)
    {
      if (!value[0] || (value === old)) {
        return;
      }

      this.__statusLabel.setHtml(value);
    },

    /**
     * Applies test suite status changes to the UI
     *
     * @param value {String} New testSuiteState
     * @param value {String} Previous testSuiteState
     */
    _applyTestSuiteState : function(value, old)
    {
      switch(value)
      {
        case "init":
          this.status = "Waiting for tests";
          break;
        case "loading" :
          this.status = "Loading tests...";
          break;
        case "ready" :
          this.status = this.selectedTests.length + " tests ready to run.";
          break;
        case "error" :
          this.status = "Couldn't load test suite!";
          break;
        case "running" :
          this.status = "Running tests...";
          break;
        case "finished" :
          this.__suiteResults.finishedAt = new Date().getTime();
          this.status = "Test suite finished. " + this._getSummary();
          //re-apply selection so the same suite can be executed again
          this.selectedTests = new qx.data.Array();
          this.selectedTests = this.__testList;
          break;
        case "aborted" :
          this.selectedTests = new qx.data.Array();
          this.selectedTests = this.__testList;
          this.status = "Test run aborted";
          break;
      }
      this.__mainButton.state = value;
    },

    /**
     * Resets the state of all tests in the suite
     */
    _clearResults : function()
    {
      this.__testList.forEach(function(item, index, list) {
        item.setState("start");
        item.setExceptions([]);
      });
    },

    /**
     * Applies the test suite model to the main list. Also selects all tests in
     * the new suite
     *
     * @param value {qx.core.Object} New test suite model
     * @param old {qx.core.Object} Old test suite model
     */
    _applyTestModel : function(value, old)
    {
      if (!value) {
        return;
      }
      this.__testList = testrunner.runner.ModelUtil.getItemsByProperty(value, "type", "test");
      this.__testList = new qx.data.Array(this.__testList);
      this.__testListWidget.model = this.__testList.concat();
      this.selectedTests = this.__testList;
    },


    _applyTestCount : function(value, old)
    {},

    /**
     * Reacts to state changes in testResultData objects.
     *
     * @param testResultData {testrunner.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState : function(testResultData)
    {
      var testName = testResultData.fullName;
      var state = testResultData.state;

      var exceptions = testResultData.exceptions;

      //Update test results map
      if (!this.__suiteResults.tests[testName]) {
        this.__suiteResults.tests[testName] = {};
      }
      this.__suiteResults.tests[testName].state = state;

      if (exceptions) {
        this.__suiteResults.tests[testName].exceptions = [];
        for (var i=0,l=exceptions.length; i<l; i++) {
          var ex = exceptions[i].exception;
          var type = ex.classname || ex.type || "Error";

          var message = ex.toString ? ex.toString() :
            ex.message ? ex.message : "Unknown Error";

          var stacktrace;
          if (!(ex.classname && ex.classname == "qx.dev.unit.MeasurementResult")) {
            stacktrace = testResultData.getStackTrace(ex);
          }

          var serializedEx = {
            type : type,
            message : message
          };

          if (stacktrace) {
            serializedEx.stacktrace = stacktrace;
          }

          this.__suiteResults.tests[testName].exceptions.push(serializedEx);
        }
      }
    },

    /**
     * Returns a results summary for a finished test suite
     *
     * @return  {String} HTML-formatted summary
     */
    _getSummary : function()
    {
      var pass = 0;
      var fail = 0;
      var skip = 0;
      for (var test in this.__suiteResults.tests) {
        switch (this.__suiteResults.tests[test].state) {
          case "success":
            pass++;
            break;
          case "error":
          case "failure":
            fail++;
            break;
          case "skip":
            skip++;
        }
      }

      return "<span class='failure'>" + fail + "</span>" + " failed, " +
             "<span class='success'>" + pass + "</span>" + " passed, " +
             "<span class='skip'>" + skip + "</span>" + " skipped.";
    },

    /**
     * Displays the details page for a test result when a list entry is tapped.
     *
     * @param index {Number} The index of the tapped item
     */
    _onListChangeSelection : function(index)
    {
      this.__detailPage.removeAll();
      var testName = qx.lang.Object.getKeyFromValue(this.__testRows, index);
      for (var i=0,l=this.__testList.length; i<l; i++) {
        if (this.__testList.getItem(i).fullName == testName) {
          var exceptions = this.__testList.getItem(i).exceptions;
          for (var x=0,y=exceptions.length; x<y; x++) {
            var ex = exceptions[x].exception;
            var msg = ex.toString ? ex.toString() : ex.message;
            var stack = ex.getStackTrace ? ex.getStackTrace() : qx.dev.StackTrace.getStackTraceFromError(ex);
            var msgLabel = new qx.ui.mobile.basic.Label(msg);
            msgLabel.wrap = true;
            var stackLabel = new qx.ui.mobile.basic.Label(stack.join("<br/>"));
            stackLabel.wrap = true;
            var detailContainer = new qx.ui.mobile.Widget(new qx.ui.mobile.layout.VBox());
            detailContainer.append(msgLabel);
            detailContainer.append(stackLabel);
            var detailGroup = new qx.ui.mobile.form.Group([detailContainer]);
            this.__detailPage.append(detailGroup);
          }
          if (exceptions.length > 0) {
            this.__detailPage.show();
          }
          break;
        }
      }
    }
  }
});
