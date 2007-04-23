/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)


************************************************************************ */


qx.Class.define("qxunit.runner.ProgressBar",
{
  extend : qx.ui.layout.CanvasLayout,

  construct : function()
  {
    this.base(arguments);
    this.set({
      height : 20,
      width  : 200,
      backgroundColor : "#C1ECFF",
      border : "inset"
    });


    this.bar = new qx.ui.basic.Terminator();
    this.add(this.bar);
    this.bar.set({
      height : 16,
      width  : "0%",
      //left   : 0,
      backgroundColor: "#0000FF"
    });

  }, //construct

  members: {

    showOff: function() {
      this.debug("Entering showOff...");
      function e (i) {
        this.debug("Running i: "+i);
        if (i<=100) {
          this.update(String(i)+"%");
          i++;
          setTimeout("e("+i+")",100);
        } else {
          this.debug("i out of Range");
        }
      };
      e(0);
      this.debug("Leaving showOff...");
    },

    // update with increment
    increment : function (){
      
    },

    /*
     * @param val {String} val can be either a fraction ("5/12") specifying the degree
     *            of completeness with discrete values (like 5 of 12 items have
     *            been complete); or a percentage ("68%") of the degree of
     *            completeness.
     */
    update: function(val) {
      var paramError = "Parameter to 'update' function must be a string representing a fraction or a percentage.";  //type error
      if (typeof(val) != 'string') {
        throw new Error(paramError);
      }
      if(val.indexOf("/") > -1) {
        //handle curr/total spec
        quot = val.split("/");
        if ((quot.length != 2) ||
            (isNaN(quot[0] = parseInt(quot[0]))) ||
            (isNaN(quot[1] = parseInt(quot[1]))) ||
            (quot[0] <= 0) || (quot[1] <= 0)    ||
            (quot[0] > quot[1]))
        {
            throw new Error(paramError);
        } else {
          this.bar.setWidth(String(Math.round(quot[0]/quot[1]*100))+"%");
        };

      } else if (val[val.length-1] = "%") { // ends in '%'
        //handle percent spec
        var pcnt = parseInt(val.slice(0,val.length-1));
        if (pcnt==NaN || (pcnt < 0 || pcnt > 100) )
        {
          throw new Error(paramError);
        } else {
          this.bar.setWidth(String(pcnt)+"%");
        }
      } else {
        //throw invalid update spec exception
        throw new Error(paramError);
      }
      return true;
    }//update
  },//members

  properties: {
    status: {type: "integer", _legacy: true}
  }

});
/*
Setter of property 'backgroundColor' returned with an error: Error - Could not parse color: C1ECFF 
*/
