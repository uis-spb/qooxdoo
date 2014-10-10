/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.form.TextField",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    setUp: function() {
      this.base(qx.test.mobile.MobileTestCase, "setUp");
      this.__tf = new qx.ui.mobile.form.TextField();
    },

    testValue : function()
    {
      this.getRoot().append(this.__tf);

      this.assertEquals(null,this.__tf.value);
      this.assertEquals(null,qx.bom.element.Attribute.get(this.__tf[0],'value'));
      this.assertEventFired(this.__tf, "changeValue", function() {
        this.__tf.value = "mytext";
      }.bind(this));
      this.assertEquals('mytext',this.__tf.value);
      this.assertEquals('mytext',qx.bom.element.Attribute.get(this.__tf[0],'value'));

      this.__tf.dispose();

      this.__tf = new qx.ui.mobile.form.TextField('affe');
      this.getRoot().append(this.__tf);
      this.assertEquals('affe',this.__tf.value);
      this.assertEquals('affe',qx.bom.element.Attribute.get(this.__tf[0],'value'));
      this.__tf.dispose();
    },


    testEnabled : function()
    {
      this.getRoot().append(this.__tf);
      this.assertEquals(true,this.__tf.enabled);
      this.assertFalse(qx.bom.element.Class.has(this.__tf[0],'disabled'));

      this.__tf.enabled = false;
      this.assertEquals(false,this.__tf.enabled);
      this.assertEquals(true,qx.bom.element.Class.has(this.__tf[0],'disabled'));

      this.__tf.dispose();
    },


    testPattern: function() {
      var pattern = "Foo";
      this.__tf.pattern = pattern;
      this.assertEquals(pattern, this.__tf.getAttribute("pattern"));
      // empty value is valid unless required
      this.assertTrue(this.__tf.validity.valid);
      this.__tf.value = "Bar";
      this.assertFalse(this.__tf.validity.valid);
      this.assertTrue(this.__tf.validity.patternMismatch);
      this.__tf.value = "Foo";
      this.assertTrue(this.__tf.validity.valid);
      this.assertFalse(this.__tf.validity.patternMismatch);
      this.__tf.pattern = "Bar";
      this.assertFalse(this.__tf.validity.valid);
      this.assertTrue(this.__tf.validity.patternMismatch);
      this.__tf.value = "";
      this.assertTrue(this.__tf.validity.valid);
      this.assertFalse(this.__tf.validity.patternMismatch);
    },


    testMaxLength: function() {
      this.__tf.maxLength = 1;
      this.__tf.value = "Foo";
      this.assertEquals("F", this.__tf.value);
      this.__tf.maxLength = null;
      this.__tf.value = "Foo";
      this.assertEquals("Foo", this.__tf.value);
      this.__tf.maxLength = 1;
      this.assertEquals("F", this.__tf.value);
    }

  }
});
