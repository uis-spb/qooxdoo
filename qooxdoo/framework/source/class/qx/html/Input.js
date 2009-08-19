/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Input wrap any valid HTML input element and make it accessible
 * through the normalized qooxdoo element interface.
 */
qx.Class.define("qx.html.Input",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param type {String} The type of the input field. Valid values are
   *   <code>text</code>, <code>textarea</code>, <code>select</code>,
   *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
   *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
   *   <code>file</code>, <code>search</code>, <code>reset</code>,
   *   <code>select</code> and <code>textarea</code>.
   */
  construct : function(type)
  {
    this.base(arguments);

    this.__type = type;

    // Update node name correctly
    if (type === "select" || type === "textarea") {
      this.setNodeName(type);
    } else {
      this.setNodeName("input");
    }
    
    if (this.__attachEnabledListener != null) {
      this.__attachEnabledListener();
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __type : null,
    // only used for webkit
    __enabled : true,

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    //overridden
    _createDomElement : function() {
      return qx.bom.Input.create(this.__type);
    },


    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);
      var element = this.getDomElement();

      if (name === "value") {
        qx.bom.Input.setValue(element, value);
      } else if (name === "wrap") {
        qx.bom.Input.setWrap(element, value);
      }
    },

    
    /**
     * Set the input element enabled / disabled. 
     * Webkit needs a special treatment because the set color of the input 
     * field changes automatically. Therefore, we use 
     * <code>-webkit-user-modify: read-only</code> and
     * <code>-webkit-user-select: none</code>
     * for disabling the fields in webkit. All other browsers use the disabled
     * attribute.
     * 
     * @param value {Boolean} true, if the inpout element should be enabled.
     */
    setEnabled : qx.core.Variant.select("qx.client",
    {
      "webkit" : function(value)
      {
        this.__enabled = value;
        var element = this.getDomElement();
        if (element != null && !value) {
          qx.bom.element.Style.set(element, "-webkit-user-modify", "read-only");
          qx.bom.element.Style.set(element, "-webkit-user-select", "none");
        } else if (element != null) {
          qx.bom.element.Style.set(element, "-webkit-user-modify", "");
          qx.bom.element.Style.set(element, "-webkit-user-select", "");          
        }        
      },

      "default" : function(value) 
      {
        this.setAttribute("disabled", value===false);
      }
    }),
    
    
    /**
     * Attaches a listener to the appear event which handles the setting of the 
     * css disabled state in webkit browsers. In all other browsers, the 
     * function is null.
     */
    __attachEnabledListener : qx.core.Variant.select("qx.client",
    {
      "webkit" : function()
      {
        this.addListener("appear", function() {
          var element = this.getDomElement();
          if (!this.__enabled) {
            qx.bom.element.Style.set(element, "-webkit-user-modify", "read-only");
            qx.bom.element.Style.set(element, "-webkit-user-select", "none");
          } else {
            qx.bom.element.Style.set(element, "-webkit-user-modify", "");
            qx.bom.element.Style.set(element, "-webkit-user-select", "");          
          }        
        }, this);        
      },

      "default" : null
    }),    


    /*
    ---------------------------------------------------------------------------
      INPUT API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of the input element.
     *
     * @param value {var} the new value
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setValue : function(value)
    {
      var element = this.getDomElement();

      if (element)
      {
        // Do not overwrite when already correct (on input events)
        // This is needed to keep caret position while typing.
        if (element.value != value) {
          qx.bom.Input.setValue(element, value);
        }
      }
      else
      {
        this._setProperty("value", value);
      }

      return this;
    },


    /**
     * Get the current value.
     *
     * @return {String} The element's current value.
     */
    getValue : function()
    {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Input.getValue(element);
      }

      return this._getProperty("value") || "";
    },


    /**
     * Sets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setWrap : function(wrap)
    {
      if (this.__type === "textarea") {
        this._setProperty("wrap", wrap);
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }

      return this;
    },


    /**
     * Gets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @return {Boolean} Whether wrapping is enabled or disabled.
     */
    getWrap : function()
    {
      if (this.__type === "textarea") {
        return this._getProperty("wrap");
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }
    }
  }
});