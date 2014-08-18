"use strict";
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * @deprecated {4.1} Please use qx.ui.mobile.control.Picker instead.
 *
 * The picker widget gives the user the possibility to select a value out of an array
 * of values. The picker widget is always shown in a {@link qx.ui.mobile.dialog.Popup}.
 *
 * The picker widget is able to display multiple picker slots, for letting the user choose
 * several values at one time, in one single dialog.
 *
 * The selectable value array is passed to this widget through a {@link qx.data.Array} which represents one picker slot.
 *
 * *Example*
 *
 * Here is an example of how to use the picker widget.
 *
 * <pre class='javascript'>
 *
 * var pickerSlot1 = new qx.data.Array(["qx.Desktop", "qx.Mobile", "qx.Website","qx.Server"]);
 * var pickerSlot2 = new qx.data.Array(["1.5.1", "1.6.1", "2.0.4", "2.1.2", "3.0"]);
 *
 * var picker = new qx.ui.mobile.dialog.Picker();
 * picker.title = "Picker";
 * picker.addSlot(pickerSlot1);
 * picker.addSlot(pickerSlot2);
 *
 * var showPickerButton = new qx.ui.mobile.form.Button("Show Picker");
 * showPickerButton.on("tap", picker.show, picker);
 * this.getContent().append(showPickerButton);
 *
 * // Listener when user has confirmed his selection.
 * // Contains the selectedIndex and values of all slots in a array.
 * picker.on("confirmSelection",function(evt){
 *    var pickerData = evt.getData();
 * }, this);
 *
 * // Listener for change of picker slots.
 * picker.on("changeSelection",function(evt){
 *    var slotData = evt.getData();
 * }, this);
 *
 * </pre>
 *
 */
qx.Bootstrap.define("qx.ui.mobile.dialog.Picker",
{
  extend : qx.ui.mobile.dialog.Popup,

  /**
   * @param anchor {qx.ui.mobile.core.Widget ? null} The anchor widget for this item. If no anchor is available,
   *       the menu will be displayed modal and centered on screen.
   */
  construct : function(anchor)
  {
    if (qx.core.Environment.get("qx.debug"))
    {
      qx.log.Logger.deprecatedClassWarning(this, "Please use 'qx.ui.mobile.control.Picker' instead.");
    }

    // parameter init.
    this.__selectedIndex = {};
    this.__targetIndex = {};
    this.__modelToSlotMap = {};
    this.__slotElements = [];
    this.__selectedIndexBySlot = [];

    this.__pickerModel = new qx.data.Array();

    this.__pickerContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
    this.__pickerContainer.addClass("picker-container");
    this.__pickerContainer.addClass("gap");
    this.__pickerContainer.addClass("css-pointer-"+qx.core.Environment.get("css.pointerevents"));

    this.__pickerContent = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());

    this.__pickerConfirmButton = new qx.ui.mobile.form.Button("Choose");
    this.__pickerConfirmButton.on("tap", this.confirm, this);

    this.__pickerCancelButton = new qx.ui.mobile.form.Button("Cancel");
    this.__pickerCancelButton.on("tap", this.hide, this);

    this.__pickerButtonContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
    this.__pickerButtonContainer.append(this.__pickerConfirmButton);
    this.__pickerButtonContainer.append(this.__pickerCancelButton);
    this.__pickerButtonContainer.addClass("gap");

    this.__pickerContent.append(this.__pickerContainer);
    this.__pickerContent.append(this.__pickerButtonContainer);

    this.modal = !!anchor;

    this.base(qx.ui.mobile.dialog.Popup, "constructor", this.__pickerContent, anchor);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the selection of a single slot has changed.
     */
    changeSelection : "qx.event.type.Data",

    /**
     * Fired when the picker is closed. This means user has confirmed its selection.
     * Thie events contains all data which were chosen by user.
     */
    confirmSelection : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      init : "picker-dialog"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // The model which is used to render the pickers slots.
    __pickerModel : null,
    __pickerConfirmButton : null,
    __pickerCancelButton : null,
    __pickerContainer : null,
    __pickerButtonContainer : null,
    __pickerContent : null,
    __selectedIndex : null,
    __targetIndex : null,
    __modelToSlotMap : null,
    __slotElements : null,
    __selectedIndexBySlot : null,
    __labelHeight : null,


    // overridden
    show : function() {
      this.base(qx.ui.mobile.dialog.Popup, "show");
      this._updateAllSlots();
    },


    /**
     * Confirms the selection, fires "confirmSelection" data event and hides the picker dialog.
     */
    confirm : function() {
      this.hide();
      this._fireConfirmSelection();
    },


    /**
     * Getter for the selectedIndex of a picker slot, identified by its index.
     * @param slotIndex {Integer} the index of the target picker slot.
     * @return {Integer} the index of the target picker slot, or null if slotIndex is unknown.
     */
    getSelectedIndex : function(slotIndex) {
      var slotElement = this.__slotElements[slotIndex];
      if(slotElement) {
        return this.__selectedIndexBySlot[slotIndex];
      }
      return null;
    },


    /**
     * Setter for the selectedIndex of a picker slot, identified by its index.
     * @param slotIndex {Integer} the index of the target picker slot.
     * @param value {Integer} the selectedIndex of the slot.
     * @param useTransition {Boolean ? true} flag which indicates whether a
     * transition should be used on update or not.
     */
    setSelectedIndex : function(slotIndex, value, useTransition) {
      var slotElement = this.__slotElements[slotIndex];
      if(slotElement) {
        if(this._isSelectedIndexValid(slotElement, value)) {
          this.__selectedIndex[slotElement.id] = value;
          this.__selectedIndexBySlot[slotIndex] = value;

          if(this.isShown()) {
            this._updateSlot(slotElement, useTransition);
          }
        }
      }
    },


    /**
     * Setter for the caption of the picker dialog's confirm button.
     * Default is "OK".
     * @param caption {String} the caption of the confirm button.
     */
    setConfirmButtonCaption : function(caption) {
      if(this.__pickerConfirmButton) {
        this.__pickerConfirmButton.value = caption;
      }
    },


    /**
     * Setter for the caption of the picker dialog's cancel button.
     * Default is "Cancel".
     * @param caption {String} the caption of the cancel button.
     */
    setCancelButtonCaption : function(caption) {
      if(this.__pickerCancelButton) {
        this.__pickerCancelButton.value = caption;
      }
    },


    /**
    * Returns the composite which contains the buttons that are needed
    * to confirm/cancel the choice.
    * @return {qx.ui.mobile.container.Composite} the container composite.
    */
    getPickerButtonContainer : function() {
      return this.__pickerButtonContainer;
    },


    /**
     * Adds an picker slot to the end of the array.
     * @param slotData {qx.data.Array} the picker slot data to display.
     */
    addSlot : function(slotData) {
      if(slotData !== null && slotData instanceof qx.data.Array) {
        this.__pickerModel.push(slotData);
        slotData.on("changeBubble", this._onChangeBubble, {self:this,index:this.__pickerModel.length - 1});
        this._render();
      }
    },


    /**
     * Handler for <code>changeBubble</code> event.
     * @param evt {qx.event.type.Data} the <code>changeBubble</code> event.
     */
    _onChangeBubble : function(data) {
      var newSlotDataLength = data.value.length;
      var selectedIndex = this.self.getSelectedIndex(this.index);

      var pickerSlot = this.self.__pickerContainer.getChildren()[this.index];
      pickerSlot = qx.ui.mobile.core.Widget.getWidgetById(pickerSlot.id);
      this.self._renderPickerSlotContent(pickerSlot, this.index);

      // If slotData length has decreased, but previously selected index was higher than new slotData length.
      if (selectedIndex >= newSlotDataLength) {
        var newSelectedIndex = newSlotDataLength - 1;
        this.self.setSelectedIndex(this.index, newSelectedIndex, false);
      }
    },


    /**
     * Removes the pickerSlot at the given slotIndex.
     * @param slotIndex {Integer} the index of the target picker slot.
     */
    removeSlot : function(slotIndex) {
      if(this.__pickerModel.getLength() > slotIndex && slotIndex > -1) {
        var slotData = this.__pickerModel.getItem(slotIndex);
        slotData.off("changeBubble", this._onChangeBubble, this);

        this.__pickerModel.removeAt(slotIndex);
        this._render();
      }
    },


    /**
     * Disposes the picker model, and removes all "changeBubble" listeners from it.
     */
    _disposePickerModel : function() {
      for(var i = 0; i < this.__pickerModel.length; i++) {
        var slotData = this.__pickerModel.getItem(i);
        slotData.off("changeBubble", this._onChangeBubble, this);
      }

      this.__pickerModel.dispose();
    },


    /**
     * Returns the picker slot count, added to this picker.
     * @return {Integer} count of picker slots.
     */
    getSlotCount : function() {
      return this.__pickerModel.getLength();
    },


    /**
     * Increases the selectedIndex on a specific slot, identified by its content element.
     * @param contentElement {Element} a picker slot content element.
     */
    _increaseSelectedIndex : function(contentElement) {
      var oldSelectedIndex = this.__selectedIndex[contentElement.id];
      var newSelectedIndex = oldSelectedIndex +1;

      var slotIndex = this._getSlotIndexByElement(contentElement);

      var model = this._getModelByElement(contentElement);
      if(model.getLength() == newSelectedIndex) {
        newSelectedIndex = model.getLength() -1;
      }

      this.__selectedIndex[contentElement.id] = newSelectedIndex;
      this.__selectedIndexBySlot[slotIndex] = newSelectedIndex;

      this._updateSlot(contentElement);
    },


    /**
     * Decreases the selectedIndex on a specific slot, identified by its content element.
     * @param contentElement {Element} a picker slot content element.
     */
    _decreaseSelectedIndex : function(contentElement) {
      var oldSelectedIndex = this.__selectedIndex[contentElement.id];
      var newSelectedIndex = oldSelectedIndex -1;

      var slotIndex = this._getSlotIndexByElement(contentElement);

      if(newSelectedIndex < 0) {
        newSelectedIndex = 0;
      }

      this.__selectedIndex[contentElement.id] = newSelectedIndex;
      this.__selectedIndexBySlot[slotIndex] = newSelectedIndex;

      this._updateSlot(contentElement);
    },


    /**
     *  Returns the slotIndex of a picker slot, identified by its content element.
     *  @param contentElement {Element} a picker slot content element.
     *  @return {Integer} The slot index of the element
     */
    _getSlotIndexByElement : function(contentElement) {
      var contentElementId = contentElement.id;
      var slotIndex = this.__modelToSlotMap[contentElementId];
      return slotIndex;
    },


    /**
     * Checks if a selectedIndex of a picker slot is valid.
     * @param contentElement {Element} a picker slot content element.
     * @param selectedIndex {Integer} a selectedIndex to check.
     * @return {Boolean} whether the selectedIndex is valid.
     */
    _isSelectedIndexValid : function(contentElement, selectedIndex) {
      var modelLength = this._getModelByElement(contentElement).getLength();
      return (selectedIndex < modelLength && selectedIndex >= 0);
    },


    /**
     * Returns corresponding model for a picker, identified by its content element.
     * @param contentElement {Element} the picker slot content element.
     * @return {qx.data.Array} The picker model item
     */
    _getModelByElement : function(contentElement) {
      var slotIndex = this._getSlotIndexByElement(contentElement);
      return this.__pickerModel.getItem(slotIndex);
    },


    /**
     * Collects data for the "confirmSelection" event and fires it.
     */
    _fireConfirmSelection : function() {
      var model = this.__pickerModel;
      var slotCounter = (model ? model.getLength() : 0);

      var selectionData = [];

      for (var slotIndex = 0; slotIndex < slotCounter; slotIndex++) {
        var selectedIndex = this.__selectedIndexBySlot[slotIndex];
        var selectedValue = model.getItem(slotIndex).getItem(selectedIndex);

        var slotData = {index: selectedIndex, item: selectedValue, slot: slotIndex};
        selectionData.push(slotData);
      }

      this.emit("confirmSelection", selectionData);
    },


    /**
     * Calculates the needed picker slot height, by it child labels.
     * @param target {Element} The target element.
     */
    _fixPickerSlotHeight : function(target) {
      this.__labelHeight = qxWeb(target.children[0]).getStyle("height", 1);
      this.__labelHeight = parseFloat(this.__labelHeight,10);

      var labelCount = this._getModelByElement(target).length;
      var pickerSlotHeight = labelCount * this.__labelHeight;

      qxWeb(target).setStyle("height", pickerSlotHeight + "px");
    },


    /**
     * Handler for <code>trackstart</code> events on picker slot.
     * @param evt {qx.event.type.Track} The track event.
     */
    _onTrackStart : function(evt) {
      var target = evt.currentTarget;

      this.__targetIndex[target.id] = this.__selectedIndex[target.id];

      qxWeb(target).setStyle("transitionDuration", "0s");

      this._fixPickerSlotHeight(target);

      evt.preventDefault();
    },


    /**
     * Handler for <code>trackend</code> events on picker slot.
     * @param evt {qx.event.type.Track} The <code>trackend</code> event.
     */
    _onTrackEnd : function(evt) {
      var target = evt.currentTarget;
      var model = this._getModelByElement(target);
      var slotIndex = this._getSlotIndexByElement(target);

      var isSwipe = Math.abs(evt.delta.y) >= this.__labelHeight/2;

      if(isSwipe) {
        // SWIPE
        //
        // Apply selectedIndex
        this.__selectedIndex[target.id] = this.__targetIndex[target.id];
        this.__selectedIndexBySlot[slotIndex] = this.__targetIndex[target.id];
      } else {
        // TAP
        //
        // Detect if user taps on upper third or lower third off spinning wheel.
        // Depending on this detection, the value increases/decreases.
        var viewportTop = evt.clientY;

        var offsetParent = qxWeb(target).getOffsetParent();
        var targetTop = offsetParent.getPosition().top;
        targetTop -= parseInt(offsetParent.getStyle("marginTop"), 10);

        var relativeTop = viewportTop - targetTop;
        var decreaseIncreaseLimit = offsetParent.offsetHeight/2;

        if (relativeTop < decreaseIncreaseLimit) {
          this._decreaseSelectedIndex(target);
        } else if (relativeTop > decreaseIncreaseLimit) {
          this._increaseSelectedIndex(target);
        }
      }

      // Fire changeSelection event including change data.
      var selectedIndex = this.__selectedIndex[target.id];
      var selectedValue = model.getItem(selectedIndex);

      this._updateSlot(target);

      this.emit("changeSelection", {index: selectedIndex, item: selectedValue, slot: slotIndex});
    },


    /**
     * Handler for <code>track</code> events on picker slot.
     * @param evt {qx.event.type.Track} The track event.
     */
    _onTrack : function(evt) {
      var targetElement = evt.currentTarget;
      var target = qx.ui.mobile.core.Widget.getWidgetById(targetElement.id);

      var deltaY = evt.delta.y;

      var selectedIndex = this.__selectedIndex[targetElement.id];
      var offsetTop = -selectedIndex*this.__labelHeight;

      var targetOffset = deltaY + offsetTop;

      // BOUNCING
      var slotHeight = targetElement.offsetHeight;
      var pickerHeight = parseInt(targetElement.parentNode.offsetHeight, 10);
      var upperBounce = this.__labelHeight;
      var lowerBounce = (-slotHeight + pickerHeight * 2);

      if(targetOffset > upperBounce) {
        targetOffset = upperBounce;
      }
      if(targetOffset < lowerBounce) {
        targetOffset = lowerBounce;
      }

      target.translateY = targetOffset;

      var steps = Math.round(-deltaY/this.__labelHeight);
      var newIndex = selectedIndex+steps;

      var modelLength = this._getModelByElement(targetElement).getLength();
      if(newIndex < modelLength && newIndex >= 0) {
        this.__targetIndex[targetElement.id] = newIndex;
      }

      evt.preventDefault();
    },


    /**
     * Updates the visual position of the picker slot element,
     * according to the current selectedIndex of the slot.
     * @param targetElement {Element} the slot target element.
     * @param useTransition {Boolean ? true} flag which indicates whether a
     * transition should be used on update or not.
     */
    _updateSlot : function(targetElement, useTransition) {
      this._fixPickerSlotHeight(targetElement);
      var target = qxWeb(targetElement);

      if (typeof useTransition === undefined) {
        useTransition = true;
      }

      if (qx.core.Environment.get("os.name") == "ios") {
        var transitionDuration = "200ms";
        if (useTransition === false) {
          transitionDuration = "0s";
        }
        target.setStyle("transitionDuration", transitionDuration);
      }

      var selectedIndex = this.__selectedIndex[targetElement.id];
      var offsetTop = -selectedIndex * this.__labelHeight;

      target.setStyle("transform", "translate3d(0px," + offsetTop + "px,0px)");
    },


    /**
    * Updates the visual position of all available picker slot elements.
    */
    _updateAllSlots : function() {
      for(var i = 0; i < this.__slotElements.length; i++) {
        this._updateSlot(this.__slotElements[i]);
      }
    },


    /**
     * Renders this picker widget.
     */
    _render : function() {
      this._removePickerSlots();

      this.__selectedIndexBySlot = [];
      this.__slotElements = [];
      this.__modelToSlotMap = {};
      this.__selectedIndex = {};

      var slotCounter = (this.__pickerModel ? this.__pickerModel.getLength() : 0);

      for (var slotIndex = 0; slotIndex < slotCounter; slotIndex++) {
        this.__selectedIndexBySlot.push(0);

        var pickerSlot = this._createPickerSlot(slotIndex);
        this.__slotElements.push(pickerSlot[0]);
        pickerSlot.layoutPrefs = {flex: 1};
        this.__pickerContainer.append(pickerSlot);

        this._renderPickerSlotContent(pickerSlot, slotIndex);
      }
    },


    /**
    * Renders the content (the labels) of a picker slot.
    * @param pickerSlot {qx.ui.mobile.core.Widget} the target picker slot, where the labels should be added to.
    * @param slotIndex {Integer} the slotIndex of the pickerSlot.
    */
    _renderPickerSlotContent : function(pickerSlot, slotIndex) {
      pickerSlot.setHtml("");

      var slotValues = this.__pickerModel.getItem(slotIndex);
      var slotLength = slotValues.getLength();

      for (var slotValueIndex = 0; slotValueIndex < slotLength; slotValueIndex++) {
        var labelValue = slotValues.getItem(slotValueIndex);
        var pickerLabel = this._createPickerValueLabel(labelValue);

        pickerLabel.layoutPrefs = {flex: 1};
        pickerSlot.append(pickerLabel);
      }
    },


    /**
     * Creates a {@link qx.ui.mobile.container.Composite} which represents a picker slot.
     * @param slotIndex {Integer} index of this slot.
     * @return {qx.ui.mobile.container.Composite} The picker slot widget
     */
    _createPickerSlot : function(slotIndex) {
      var pickerSlot = new qx.ui.mobile.container.Composite();
      pickerSlot.addClass("picker-slot");
      pickerSlot.transformUnit = "px";

      pickerSlot.on("trackstart", this._onTrackStart, this);
      pickerSlot.on("track", this._onTrack, this);
      pickerSlot.on("trackend", this._onTrackEnd, this);

      this.__modelToSlotMap[pickerSlot.id] = slotIndex;
      this.__selectedIndex[pickerSlot.id] = 0;

      return pickerSlot;
    },


    /**
     * Remove all listeners from the picker slot composites and destroys them.
     */
    _removePickerSlots : function() {
      var children = this.__pickerContainer.getChildren();

      for (var i = children.length - 1; i >= 0; i--) {
        var pickerSlot = qxWeb(children[i]);

        pickerSlot.off("trackstart", this._onTrackStart, this);
        pickerSlot.off("track", this._onTrack, this);
        pickerSlot.off("trackend", this._onTrackEnd, this);

        pickerSlot.setHtml("");
      }
    },


    /**
     * Creates a {@link qx.ui.mobile.container.Composite} which represents a picker label.
     * @param textValue {String} the caption of the label.
     * @return {qx.ui.mobile.basic.Label} The picker label
     */
    _createPickerValueLabel : function(textValue) {
      var pickerLabel = new qx.ui.mobile.basic.Label(textValue);
      pickerLabel.addClass("picker-label");
      return pickerLabel;
    },


    dispose : function() {
      this.base(qx.ui.mobile.dialog.Popup, "dispose");
      this._disposePickerModel();

      this._removePickerSlots();

      this.__pickerConfirmButton.off("tap", this.confirm, this);
      this.__pickerCancelButton.off("tap", this.hide, this);

      this._disposeObjects("__pickerContainer", "__pickerButtonContainer", "__pickerConfirmButton","__pickerCancelButton","__pickerContent");
    }
  }

});
