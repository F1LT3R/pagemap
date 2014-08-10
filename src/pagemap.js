(function (win){

  "use strict";

  var settings = {
    
    color: {
      
      background: '#024',
      
      group: {
        // 0: {strokeStyle:false, fillStyle:"#FA0", lineWidth:1},
        0: {strokeStyle:'#FA0', fillStyle:false, lineWidth:1},
        1: {strokeStyle:'#AF0', fillStyle:false, lineWidth:1},
        2: {strokeStyle:'#0AF', fillStyle:false, lineWidth:1},
        3: {strokeStyle:'#F0A', fillStyle:false, lineWidth:1},
        4: {strokeStyle:'#A0F', fillStyle:false, lineWidth:1},
        5: {strokeStyle:'#0FF', fillStyle:false, lineWidth:1},
        6: {strokeStyle:'#FF0', fillStyle:false, lineWidth:1},
        7: {strokeStyle:'#F0F', fillStyle:false, lineWidth:1}
      }

    }
  },

  pagepath,
  groups = {},
  canvas,
  context;

  // Merge incomingObject with mergeToObject
  // function shallowMerge (incomingObject, mergeToObject) {
  //   for(var key in incomingObject){
  //     mergeToObject[key] = incomingObject[key];
  //   }
  //   return mergeToObject;
  // }


  // Global Interface

  win.pagemap = (function () {
    
    return {

      create: function (url, width, height) {

        var docWidth = document.body.clientWidth,
        docHeight = document.body.clientHeight,
        winWidth = window.outerWidth,
        winHeight = window.outerHeight;

        canvas = document.createElement('canvas');
      
        canvas.width = width || winWidth > docWidth ? winWidth : docWidth;
        canvas.height = height || winHeight > docHeight ? winHeight : docHeight;
        
        context = canvas.getContext('2d');
        context.imageSmoothingEnabled = false;

        pagepath = url;

        return context;

      },


      // Adds a new rectangle to the group object, stored by groupName
      add: function (name, xOrElement, y, width, height) {
        
        // Reference the group name
        var theGroup = groups[name];
        
        // If it does not exist, create it
        if (!theGroup){
          theGroup = groups[name] = [];
        }
        
        // If we are receiving shape...
        if (typeof xOrElement === 'number') {

          // Add the shape to the group
          theGroup.push({
            x:xOrElement,
            y:y,
            w:width,
            h:height
          });

        // If we are consuming a DOM Element...
        } else if (typeof xOrElement === 'object') {

          var rect = xOrElement.getBoundingClientRect();

          // Add the dom element's shape to the group
          theGroup.push({
            x:rect.left,
            y:rect.top,
            w:rect.width,
            h:rect.height
          });

        }

        return groups;
      },


      // draws pagemap with color key and url to canvas on popup
      // renders data from JSON object if one is passed
      // if nothing is passed then render
      render: function (jsonObject) {

        var i=0
          , fillStyle
          , strokeStyle
          , lineWidth
          , name
          ;

        // Fill the background canvas
        context.fillStyle = settings.color.background;
        context.fillRect(0,0,canvas.width, canvas.height);
        // context.translate(0.5,0.5);
        // context.lineWidth = 1;


        function draw (rect) {

          context.beginPath();

          if (fillStyle) {
            context.fillRect(rect.x, rect.y, rect.w, rect.h);
          }

          if (strokeStyle) {
            context.rect(rect.x, rect.y, rect.w, rect.h);
            context.stroke();
          }

          context.closePath();

        }



        // Render a JSON object if one is passed
        if (jsonObject) {
          return;
        }

        // Or loop through the groups and draw...
        for (name in groups) {
          
          // Set the unique styles for the current group
          fillStyle = settings.color.group[i].fillStyle;
          if (fillStyle) context.fillStyle = fillStyle;
          
          strokeStyle = settings.color.group[i].strokeStyle;
          if (strokeStyle) {
            context.strokeStyle = strokeStyle;
          }
          
          lineWidth = settings.color.group[i].lineWidth;
          if (lineWidth) {
            context.lineWidth = lineWidth;
          }
          
          // Draw the set of rects for each group
          groups[name].forEach(draw);
          
          // Increment 'i' (used to set group colors)
          i+=1;

        }

      },


      display: function (opacity) {
        var pagemapStyles = document.createElement('style');
        
        pagemapStyles.innerHTML = 'body{\n'+
          'filter:blur(1px);\n'+
          '-webkit-filter:blur(1px);\n'+
          '-moz-filter:blur(1px);\n' +
          '}\n'+
          'canvas#pagemapCanvas{\n'+
            'image-rendering: optimizeSpeed;\n' +
            'image-rendering: -moz-crisp-edges;\n' +
            'image-rendering: -webkit-optimize-contrast;\n' +
            'image-rendering: -o-crisp-edges;\n' +
            'image-rendering: optimize-contrast;\n' +
            '-ms-interpolation-mode: nearest-neighbor;\n' +
          '}';


        var html = document.getElementsByTagName('html')[0],
        head = document.getElementsByTagName('head')[0];
        
        canvas.setAttribute('style', 'position:absolute;top:0;left:0;z-index:999999999;opacity:'+(opacity||.75));
        canvas.setAttribute('id', 'pagemapCanvas');

        head.appendChild(pagemapStyles);

        html.appendChild(canvas);
      },


      // changes the global settings
      // returns settings object after updating
      // settings: function (settingsObject) {
      //   return shallowMerge(settingsObject, settings);
      // },

      
      // return: PNG Data
      // toPNG: function () {
      // },

      
      // return: JSON data
      // toJSON: function () {
      // }

    };

  })();

})(window);