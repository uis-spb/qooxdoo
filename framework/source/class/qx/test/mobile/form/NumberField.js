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
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.NumberField",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testValue : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);

      this.assertEquals('',numberField.getValue());
      this.assertEquals(null, qx.bom.element.Attribute.get(numberField[0],'value'));
      this.assertEventFired(numberField, "changeValue", function() {
        numberField.setValue(15);
      });

      this.assertEquals(15,numberField.getValue());
      this.assertEquals(15,qx.bom.element.Attribute.get(numberField[0],'value'));

      numberField.dispose();
    },


    testMinimum : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);

      this.assertUndefined(numberField.minimum);

      numberField.minimum = 42;

     this.assertEquals(42, numberField.minimum);

      numberField.dispose();

    },


    testMaximum : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);

      this.assertUndefined(numberField.maximum);

      numberField.maximum = 42;

      this.assertEquals(42, numberField.maximum);

      numberField.dispose();
    },


    testStep : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);

      this.assertUndefined(numberField.step);

      numberField.step = 42;

      this.assertEquals(42, numberField.step);

      numberField.dispose();
    },


    testResetValue : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);

      this.assertEquals('', numberField.getValue());
      this.assertEquals(null, qx.bom.element.Attribute.get(numberField[0],'value'));

      numberField.setValue(15);
      this.assertEquals(15,numberField.getValue());

      numberField.resetValue();

      this.assertEquals(null,qx.bom.element.Attribute.get(numberField[0],'value'));
      this.assertEquals('',numberField.getValue());

      numberField.dispose();
    },


    testEnabled : function()
    {
      var numberField = new qx.ui.mobile.form.NumberField();
      this.getRoot().append(numberField);
      this.assertEquals(true, numberField.enabled);
      this.assertFalse(qx.bom.element.Class.has(numberField[0],'disabled'));

      numberField.enabled = false;
      this.assertEquals(false, numberField.enabled);
      this.assertEquals(true, qx.bom.element.Class.has(numberField[0],'disabled'));

      numberField.dispose();
    }

  }
});
