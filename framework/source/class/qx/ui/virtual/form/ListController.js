qx.Class.define("qx.ui.virtual.form.ListController", 
{
  extend : qx.core.Object,


  construct : function(model, target)
  {
    this.base(arguments);

    this.setSelection(new qx.data.Array());

    if (model != null) {
      this.setModel(model);
    }
    if (target != null) {
      this.setTarget(target);
    }
  },

  
  properties : 
  {
    target : 
    {
      //check : "qx.ui.virtual.form.AbstractList",
      event: "changeTarget",
      nullable: true,
      init: null,
      apply: "_applyTarget"
    },

    model : 
    {
      check : "qx.data.IListData",
      event : "changeModel",
      nullable: true,
      init: null,
      apply: "_applyModel"
    },

    selection : 
    {
      check : "qx.data.IListData",
      event : "changeSelection",
      apply: "_applySelection"
    }
  },

  
  members :
  {
    _applyTarget: function(value, old)
    {
      if (value != null)
      {
        value.setDelegate(this);

        this.__changeSelectionListenerId = value.addListener(
          "changeSelection", this._onChangeSelection, this
        );
      }

      if (old != null)
      {
        old.setDelegate(null);
        old.removeListenerById(this.__changeSelectionListenerId);
      }

      if (this.getModel() == null) {
        return;
      }

      this._syncRowCount();
    },


    _applyModel: function(value, old)
    {
      if (value != null)
      {
        this.__changeLengthListenerId = value.addListener(
          "changeLength", this._onChangeLengthModel, this
        );
        this.__changeListenerId = value.addListener(
          "change", this._onChangeModel, this
        );
        this.__changeBubbleListenerId = value.addListener(
          "changeBubble", this._onChangeBubbleModel, this
        );        
      }

      if (old != null) 
      {
        old.removeListenerById(this.__changeLengthListenerId);
        old.removeListenerById(this.__changeListenerId);
        old.removeListenerById(this.__changeBubbleListenerId);
      }

      if (this.getTarget() != null) {
        this._syncRowCount();
      }
    },

    _applySelection: function(value, old) {

    },

    
    _syncViewSelectionToModel : function()
    {
      var target = this.getTarget();
      if (!target) 
      {
        this.getSelection().removaeAll();
        return;
      }
      
      var targetSelection = target.getSelectionManager().getSelection();
      var selection = [];

      for (var i = 0; i < targetSelection.length; i++) {
        var modelItem = this.getModel().getItem(targetSelection[i]);
        selection.push(modelItem);
      }

      // put the first two parameter into the selection array
      selection.unshift(this.getSelection().length);
      selection.unshift(0);
      this.getSelection().splice.apply(this.getSelection(), selection);    
    },
    
    
    _syncModelSelectionToView : function()
    {
      var target = this.getTarget();
      
      if (!target) {
        return;
      }
      
      var modelSelection = this.getSelection();
      var selection = [];

      for (var i = 0; i < modelSelection.length; i++)
      {
        var row = this.getModel().indexOf(modelSelection.getItem(i));
        selection.push(row);
      }

      target.getSelectionManager().replaceSelection(selection);   
    },
    
    
    _onChangeSelection: function(e) {
      this._syncViewSelectionToModel();
    },

    
    _onChangeLengthModel: function(e) {
      this._syncRowCount();
    },


    _onChangeModel: function(e) 
    {
      var target = this.getTarget();
      if (target != null) {
        target.update();
      }
    },    

    
    _onChangeBubbleModel : function(e)
    {     
      var target = this.getTarget();
      if (target != null) {
        target.update();
      }
    },
    
    
    _syncRowCount: function()
    {
      var model = this.getModel();
      var length = model ? model.length : 0;
      this.getTarget().setRowCount(length);
    },


    getCellData: function(row) 
    {
      var model = this.getModel();
      return (model ? model.getItem(row) : "");
    }    
  }
});
