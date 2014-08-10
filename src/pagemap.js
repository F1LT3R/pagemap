(function (window){

  'use strict';

  // Output styles that can be updated using 
  var styles = {
      
      // The background color of the PageMap
      'background': {fill: '#024'},
      
      // Some default colors in case the user does not provide styles
      '0': {stroke:'#FA0', fill:false, lineWidth:1},
      '1': {stroke:'#AF0', fill:false, lineWidth:1},
      '2': {stroke:'#F0A', fill:false, lineWidth:1},
      '3': {stroke:'#0AF', fill:false, lineWidth:1},
      '4': {stroke:'#A0F', fill:false, lineWidth:1},
      '5': {stroke:'#0FF', fill:false, lineWidth:1},
      '6': {stroke:'#FF0', fill:false, lineWidth:1},
      '7': {stroke:'#F0F', fill:false, lineWidth:1}
    },

    pagepath,
    
    // The groups of rectangles are stored here
    groups = {},
    
    // The reference to the CANVAS Element
    canvas,
    
    // The reference to the 2D CANVAS Context
    context;

  // Merge incomingObject with mergeToObject
  function shallowMerge (incomingObject, mergeToObject) {
    for(var key in incomingObject){
      mergeToObject[key] = incomingObject[key];
    }
    return mergeToObject;
  }


  // Global pagemap Interface
  window.pagemap = (function () {
    
    // Return an object as a global interface
    return {

      // Creates a new pagemap space
      create: function (url, width, height) {

        // Store the dimensions of the Document and the Window
        var docWidth = document.body.clientWidth,
        docHeight = document.body.clientHeight,
        winWidth = window.outerWidth,
        winHeight = window.outerHeight;

        // Create a CANVAS element
        canvas = document.createElement('canvas');

        // Set the ID of the CANVAS for later styling
        canvas.setAttribute('id', 'pagemapCanvas');
      
        // Set the dimensions of the CANVAS to be win/doc size (depending on which is biggest) 
        canvas.width = width || winWidth > docWidth ? winWidth : docWidth;
        canvas.height = height || winHeight > docHeight ? winHeight : docHeight;
        
        // Get the 2D Context of the CANVAS after the dimensions have been set
        context = canvas.getContext('2d');
        
        // Turn of imageSmoothing
        context.imageSmoothingEnabled = false;

        // Store the pagepath variable for later use
        pagepath = url;

        // Return the pagemap object for later use
        return this;

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

          // Use the BoundingClientRect if a DOM Element is passed
          var rect = xOrElement.getBoundingClientRect();

          // Add the DOM Element's shape to the group
          theGroup.push({
            x:rect.left,
            y:rect.top,
            w:rect.width,
            h:rect.height
          });

        }

        // Returns the groups of rectangles
        return groups;
      },


      // draws pagemap with color key and url to canvas on popup
      // renders data from JSON object if one is passed
      // if nothing is passed then render
      render: function (jsonObject) {

        var i=0,
          currentStyle,
          strokeStyle,
          fillStyle,
          lineWidth,
          name;

        // Fill the background canvas
        context.fillStyle = styles.background.fill;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Offset the context to draw sharper lines
        context.translate(0.5,0.5);
        
        // Set the default lineWidth in case the style does not get set
        context.lineWidth = 1;

        // Draw the paths
        function draw (rect) {

          // Begin/close-path required for each shape
          context.beginPath();

          // If there is a current FillStyle, fill the rect on the CANVAS
          if (fillStyle) {
            context.fillRect(rect.x, rect.y, rect.w, rect.h);
          }

          // If there is a current StrokeStyle, stroke the rect on the CANVAS
          if (strokeStyle) {
            context.rect(rect.x, rect.y, rect.w, rect.h);
            context.stroke();
          }

          // Begin/close-path required for each shape
          context.closePath();

        }

        // STUB: Render a JSON object if one is passed
        if (jsonObject) {
          return;
        }

        // Or if no JSON object is passed, loop through the groups and draw the rects...
        for (name in groups) {

          // Check if there is a style for the current group name, or fallback to the provided default styles
          currentStyle = styles[name] || styles[i];

          // Set the unique styles for the current group...
          // 
          // Set the fill style
          fillStyle = currentStyle.fill;
          if (fillStyle) context.fillStyle = fillStyle;
          //
          // Set the stroke style
          strokeStyle = currentStyle.stroke;
          if (strokeStyle) context.strokeStyle = strokeStyle;
          //
          //Set the lineWidth style
          lineWidth = currentStyle.lineWidth;
          if (lineWidth) context.lineWidth = lineWidth;
          
          // Draw the set of rects for each group
          groups[name].forEach(draw);
          
          // Increment 'i' (used to set provided default group colors)
          i+=1;

        }

      },


      // Display the CANVAS Element that contains the rendered rect data
      display: function (opacity) {
        
        // Create a new STYlE Element to style the pagemap CANVAS
        var pagemapStyles = document.createElement('style');
        
        // Add styles to the new STYLE Element (blur the BODY Element)
        pagemapStyles.innerHTML = 'body{\n'+
          'filter:blur(1px);\n'+
          '-webkit-filter:blur(1px);\n'+
          '-moz-filter:blur(1px);\n' +
          '}\n'+
          '\n'+

          // Style the pagemap CANVAS
          'canvas#pagemapCanvas{\n'+
            
            // Turn off anti-aliasing
            'image-rendering: optimizeSpeed;\n' +
            'image-rendering: -moz-crisp-edges;\n' +
            'image-rendering: -webkit-optimize-contrast;\n' +
            'image-rendering: -o-crisp-edges;\n' +
            'image-rendering: optimize-contrast;\n' +
            '-ms-interpolation-mode: nearest-neighbor;\n' +
            
            // Position the CANVAS and make it slightly transparent
            'position:absolute;\n'+
            'top:0;\n'+
            'left:0;\n'+
            'z-index:999999999;\n'+
            'opacity:'+(opacity||0.75)+';\n'+
          '}\n';


        // Get the HTML Node in the DOM
        var html = document.getElementsByTagName('html')[0],
        
        // Get the HEAD Node in the DOM
        head = document.getElementsByTagName('head')[0];
      
        // Append the STYLE Element to the HEAD
        head.appendChild(pagemapStyles);
        
        // APpend the CANVAS to the HTML
        html.appendChild(canvas);

      },


      // Updates the Style settings
      style: function (styleObject) {
      
        // Return Style settings object after updating
        return shallowMerge(styleObject, styles);

      },

      
      // return: PNG Data
      // toPNG: function () {
      // },

      
      // return: JSON data
      // toJSON: function () {
      // }

    };

  })();

})(this);