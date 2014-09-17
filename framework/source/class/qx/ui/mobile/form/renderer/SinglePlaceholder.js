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
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * SinglePlaceholder is a class used to render forms into a mobile page.
 * It presents a label into the placeholder of the form elements
 *
 */
qx.Class.define("qx.ui.mobile.form.renderer.SinglePlaceholder",
{

  extend : qx.ui.mobile.form.renderer.Single,

  /**
   * @param form {qx.ui.mobile.form.Form} The target form of this renderer
   */
  construct : function(form)
  {
    this.base(qx.ui.mobile.form.renderer.Single, "constructor",form);
    this.removeClass("single");
    this.addClass("single-placeholder");
  },


  members :
  {

    // override
    addItems : function(items, names, title) {
      if(title != null)
      {
        this._addGroupHeader(title);
      }
      for (var i = 0, l = items.length; i < l; i++) {

        var item = items[i];
        var name = names[i];

        if (item instanceof qx.ui.mobile.form.TextArea) {
          if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
            this._addToScrollContainer(item, name);
          } else {
            this._addRow(item, name, new qx.ui.mobile.layout.VBox());
          }
        } else {
          if (item.setPlaceholder === undefined) {
            this._addRow(item, name, new qx.ui.mobile.layout.HBox());
          } else {
            var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
            item.placeholder = name;
            item.layoutPrefs = {flex: 1};
            row.append(item);
            this.append(row);
          }
        }

        if (!item.valid) {
          this.showErrorForItem(item);
        }
      }
    }

  }
});
