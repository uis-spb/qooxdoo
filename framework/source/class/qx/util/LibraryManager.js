"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Provides read/write access to library-specific information such as
 * source/resource URIs.
 */
qx.Class.define("qx.util.LibraryManager", {

  extend : Object,
  include : [qx.core.MSingleton],

  statics :
  {
    /** @type {Map} The libraries used by this application */
    __libs : qx.$$libraries || {},

    __instance: null,


    /**
     * Returns the singleton instance of this class
     * @return {qx.util.LibraryManager} The Blocker singleton
     */
    getInstance: qx.core.MSingleton.getInstance
  },


  construct : function() {
    this.initMSingleton();
  },


  members :
  {
    /**
     * Checks whether the library with the given namespace is known to the
     * application.
     * @param namespace {String} The library's namespace
     * @return {Boolean} <code>true</code> if the given library is known
     */
    has : function(namespace) {
      return !!qx.util.LibraryManager.__libs[namespace];
    },


    /**
     * Returns the value of an attribute of the given library
     * @param namespace {String} The library's namespace
     * @param key {String} Name of the attribute
     * @return {var|null} The attribute's value or <code>null</code> if it's not defined
     */
    get : function(namespace, key) {
      return qx.util.LibraryManager.__libs[namespace][key] ?
        qx.util.LibraryManager.__libs[namespace][key] : null;
    },


    /**
     * Sets an attribute on the given library.
     *
     * @param namespace {String} The library's namespace
     * @param key {String} Name of the attribute
     * @param value {var} Value of the attribute
     */
    set : function(namespace, key, value) {
      qx.util.LibraryManager.__libs[namespace][key] = value;
    }
  }
});
