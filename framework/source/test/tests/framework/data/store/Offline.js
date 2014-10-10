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

describe("data.store.Offline", function(){

  var __store = null;
  var __testKey = "qx-unit-test";
  var model = null;
  //include : [qx.dev.unit.MRequirements, qx.dev.unit.MMock],


    // hasQxDebug : function()
    // {
    //   return qx.core.Environment.get("qx.debug");
    // },


    afterEach (function () 
    {
      sinon.sandbox.restore();
      // erase the data from the storages
      qx.bom.Storage.getLocal().removeItem(__testKey);
      
      delete qx.data.model;
      
      
    });


     function __initDefaultStore() {
      __store = new qx.data.store.Offline(__testKey, "local");
    };

    function __createDefaultModel () {
      return qx.data.marshal.Json.createModel({a: "a"}, true);
    };
 
 it("Create", function() {
      //require(["qxDebug"]);
      var store;
      assert.throw(function() {
        store = new qx.data.store.Offline();
      });

      // fallback for the storage is local
      store = new qx.data.store.Offline(__testKey);
      assert.equal(store._storage, qx.bom.Storage.getLocal());

      // assert no exception
      __initDefaultStore();
      assert.equal(__testKey, __store.getKey());
  });
 
  it("CreateWithDelegate", function() {
      var del = {};
      var spy = sinon.spy(qx.data.marshal, "Json");
      var store = new qx.data.store.Offline(__testKey, "local", del);
      assert(spy.calledWith(del));
  });
 
  it("CheckEmptyModel", function() {
      __initDefaultStore();
      assert.isNull(__store.model);

      var model = __createDefaultModel();
      __store.model = (model);
      __store.model = (null);
      assert.isNull(qx.bom.Storage.getLocal().getItem(__testKey));
  });
 
  it("SetModel", function() {
      __initDefaultStore();

      var model = __createDefaultModel();
      __store.model = (model);
      assert.equal("a", __store.model.a);
  });
 
  it("ChangeModel", function() {
      __initDefaultStore();

      var model = __createDefaultModel();
      __store.model = (model);
      assert.equal("a", __store.model.a);

      model.a = "A";
      assert.equal("A", __store.model.a);
  });
 
  it("ModelWriteRead", function() {
      __initDefaultStore();

      var model = __createDefaultModel();
      __store.model = (model);
      assert.equal("a", __store.model.a);

      __initDefaultStore();
      assert.isNotNull(__store.model);
      assert.equal("a", __store.model.a);
  });
 
  it("ModelRead", function() {

      sinon.stub(qx.bom.Storage.getLocal(), "getItem").returns({b : "b"});
      __initDefaultStore();

      assert.isDefined(__store.model);
      assert.equal("b", __store.model.b);
  });
 
  it("UpdateModel", function() {
    
      __initDefaultStore();

      var model = __createDefaultModel();
      __store.model = model;
      assert.equal("a", __store.model.a);

      __initDefaultStore();
      assert.isNotNull(__store.model);
      __store.model.a = "b";
      assert.equal("b", __store.model.a, "1");

      __initDefaultStore();
      assert.isNotNull(__store.model);
      assert.equal("b", __store.model.a, "2");
      
  });
 
  it("ReplaceModel", function() {
      console.log("replacemodel");
      __initDefaultStore();

      var model1 = __createDefaultModel();
      __store.model = model1;

      var model2 = qx.data.marshal.Json.createModel({x: "x"}, true);
      __store.model = model2;

      __initDefaultStore();
      assert.isNotNull(__store.model);
      assert.equal("x", __store.model.x);
      
  });
 
  it("BigModel", function() {
      var data = {a: [{b: 1, c: true}, 12.567, "a"]};
      var model = qx.data.marshal.Json.createModel(data, true);

      __initDefaultStore();

      __store.model = (model);
      assert.equal(1, __store.model.a.getItem(0).b);
      assert.equal(true, __store.model.a.getItem(0).c);
      assert.equal("a", __store.model.a.getItem(2));
  });
});