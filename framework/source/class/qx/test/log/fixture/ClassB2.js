qx.Class.define("qx.test.log.fixture.ClassB2",
{
  extend : qx.test.log.fixture.ClassA,

  members :
  {
    _applyNewProperty: function () {
      this.base(qx.test.log.fixture.ClassA, "_applyNewProperty")

      this._callCountApplyNewProperty++;
    }
  }
});
