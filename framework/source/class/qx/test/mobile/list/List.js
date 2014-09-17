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

/**
 *
 * @asset(qx/icon/Tango/48/places/folder.png)
 */

qx.Class.define("qx.test.mobile.list.List",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    /**
    * Returns the img element on the given list, of the element item identified by elementIndex.
    */
    getImageWidget : function(list, elementIndex) {
      return list.getChildren().eq(elementIndex).getChildren(".list-item-image");
    },


    /**
    * Returns the title text on the given list, of the element item identified by elementIndex.
    */
    getTitleElement : function(list, elementIndex) {
      return list.getChildren()[elementIndex].childNodes[1].childNodes[0];
    },


    /**
     * Returns the subtitle text on the given list, of the element item identified by elementIndex.
     */
    getSubtitleElement : function(list, elementIndex) {
      return list.getChildren()[elementIndex].childNodes[1].childNodes[1]
    },


    __createModel : function()
    {
      var data = [];
      data.push({title:"1", subtitle : "s1", image: "qx/icon/Tango/48/places/folder.png"});
      data.push({title:"2", subtitle : "s2", image: "qx/icon/Tango/48/places/folder.png"});
      data.push({title:"3", subtitle : "s3", image: "qx/icon/Tango/48/places/folder.png"});
      data.push({title:"4", subtitle : "s4", image: "qx/icon/Tango/48/places/folder.png"});
      data.push({title:"5", subtitle : "s5", image: "qx/icon/Tango/48/places/folder.png"});
      return new qx.data.Array(data);
    },


    __createList : function() {
      var list = new qx.ui.mobile.list.List();
      this.getRoot().append(list);
      list.model = this.__createModel();
      return list;
    },


    __configureItemFunction : function(item,data,row)
    {
      item.setImage(data.image);
      item.setTitle(data.title);
      item.setSubtitle(data.subtitle);
    },


    __assertItemsAndModelLength : function(list, dataLength) {
      var childrenLength = list.getChildren().length;
      this.assertEquals(dataLength, childrenLength);
    },


    __cleanUp : function(list) {
      list.dispose();
      var modelData = list.model;
      if(modelData) {
        modelData.dispose();
        modelData = null;
      }
    },


    testCreate : function()
    {
      var list = this.__createList();
      this.__assertItemsAndModelLength(list, 5);
      this.__cleanUp(list);
    },


    testSetModelNull : function()
    {
      var list = this.__createList();
      this.__assertItemsAndModelLength(list, 5);
      list.model.dispose();
      list.model = null;
      this.__assertItemsAndModelLength(list, 0);
      this.__cleanUp(list);
    },


    testModelChangeRemove : function()
    {
      var list = this.__createList();
      this.__assertItemsAndModelLength(list,5);
      list.model.removeAt(0);
      this.__assertItemsAndModelLength(list,4);
      this.__cleanUp(list);
    },


    testModelChangeEdit : function()
    {
      var list = this.__createList();
      this.__assertItemsAndModelLength(list,5);

      list.model.setItem(0, {title:"affe", subtitle:"1", image:"qx/icon/Tango/48/places/folder.png"});
      this.__assertItemsAndModelLength(list,5);

      var titleText = this.getTitleElement(list,0).innerHTML;
      this.assertEquals("affe", titleText);

      this.__cleanUp(list);
    },


    /** Test Case for [BUG #7267] for different length of edited string value. */
    testModelChangeStringLength : function()
    {
      var list = this.__createList();

      this.__assertItemsAndModelLength(list,5);

      var newImageSrc = "qx/icon/Tango/52/places/folder.png";
      var newTitleText = "Giraffe";
      var newSubtitleText = "subtitle1";

      list.model.setItem(0, {title: newTitleText, subtitle: newSubtitleText, image: newImageSrc});
      this.__assertItemsAndModelLength(list,5);

      var titleText = this.getTitleElement(list,0).innerHTML;
      var subtitleText = this.getSubtitleElement(list,0).innerHTML;
      var imageSrc = this.getImageWidget(list,0).source;

      // VERIFY
      this.assertEquals(newTitleText, titleText);
      this.assertEquals(newSubtitleText, subtitleText);
      this.assertNotEquals("-1", imageSrc.indexOf(newImageSrc));

      this.__cleanUp(list);
    },


    testModelChangeAdd : function()
    {
      var list = this.__createList();
      this.__assertItemsAndModelLength(list,5);
      list.model.push({title:"6", subtitle:"6", image:"qx/icon/Tango/48/places/folder.png"});
      this.__assertItemsAndModelLength(list,6);
      this.__cleanUp(list);
    },

    testExtractRowsToRender : function() {
      var list = new qx.ui.mobile.list.List();

      this.assertArrayEquals([0], list._extractRowsToRender("0"));
      this.assertArrayEquals([0], list._extractRowsToRender("[0].propertyName"));
      this.assertArrayEquals([0,1,2], list._extractRowsToRender("[0-2].propertyName"));
      this.assertArrayEquals([12,13,14], list._extractRowsToRender("[12-14].propertyName"));

      list.dispose();
    },

    testFactory: function() {
      var list = qxWeb.create("<ul></ul>").list().appendTo(this.getRoot());
      this.assertInstance(list, qx.ui.mobile.list.List);
      this.assertEquals(list, list[0].$$widget);
      this.wait(100, function() {
        this.assertEquals("qx.ui.mobile.list.List", list.getData("qxWidget"));
      }, this);

    }
  }
});
