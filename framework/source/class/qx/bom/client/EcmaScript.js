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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The main purpose of this class to hold all checks about ECMAScript.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Class.define("qx.bom.client.EcmaScript",
{
  statics :
  {
    /**
     * Returns the name of the Error object property that holds stack trace
     * information or null if the client does not provide any.
     *
     * @internal
     * @return {String|null} <code>stack</code>, <code>stacktrace</code> or
     * <code>null</code>
     */
    getStackTrace : function()
    {
      var propName;
      var e = new Error("e");
      propName = e.stack ? "stack" : e.stacktrace ? "stacktrace" : null;

      // only thrown errors have the stack property in IE10 and PhantomJS
      if (!propName) {
        try {
          throw e;
        } catch(ex) {
          e = ex;
        }
      }

      return e.stacktrace ? "stacktrace" : e.stack ? "stack" : null;
    }
  },


  classDefined : function(statics) {
    // error bugfix
    qx.core.Environment.add("ecmascript.error.stacktrace", statics.getStackTrace);
  }
});
