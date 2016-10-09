(function() {
    var c;
    var counter = 0;
    var genId = function() {
      counter += 1;
      return counter;
    }
    
    // define and register vue components
    Vue.component('file-picker', {
      template: '#file-picker',
      data: function() {
        var reader = new FileReader();
        return {
          hasFile: false,
          filename: '',
          files: null,
          reader: reader,
          refreshHandler: null
        }
      },
      methods : {
        uploadFile: function(e) {
          e.preventDefault();
          if (this.refreshHandler) {
            clearTimeout(this.refreshHandler);
          }
          
          var mountImages = this.mountImages;
          
          // send file data using AJAX
          function sendFileWhenDone(fileData) {
            // you can access the file data from the file reader's event object as:
            
            console.log("File data we sent: ", fileData);
            
            // Send AJAX request with form data
            $.ajax({
              type: "POST",
              // specify the url we want to upload our file to
              url: '/uploadFile',
              // this is how we pass in the actual file data from the form
              data: fileData,
              processData: false,
              contentType: false,
              success: function(JSONsentFromServer) {
                // what do you do went it goes through
                if (JSONsentFromServer.success) {
                  console.log("[Message]", JSONsentFromServer.message);
                  mountImages(JSONsentFromServer.message);
                }
              },
              error: function(errorSentFromServer) {
                // what to do if error
                console.log("[Error]", errorSentFromServer);
              }
            })
              
          }
          
          this.files = e.target.files || e.dataTransfer.files;
          var file = this.files[0];
          
          // create the container for our file data
          var fd = new FormData();
          
          // encode the file
          fd.append('seed', file);
          
          sendFileWhenDone(fd);
        },
        mountImages: function(url) {
          
          var insertImage = function(baseUrlOrData, section) {
            // create a new image object
            var img = new Image;
            
            // draw it on the canvas
            img.onload = function() {
              c.drawImage(section, img);
            };
            
            if (section === 0) {
              img.src = baseUrlOrData;
            }
            else {
              img.src = baseUrlOrData + '?t=' + new Date().getTime();
            }
          } 
          
          // create a file reader to conver file
          this.reader.onload = (e) => {
            insertImage(e.target.result, 0);
          };
          
          // Display the first image
          this.reader.readAsDataURL(this.files[0]);
          
          // Display second
          this.refreshHandler = window.setTimeout(function() {
            insertImage(url, 1);
          }, 2000);
        }
      }
    });


    // define and register vue components
    Vue.component('coord-map', {
      template: '#coord-map',
      props: ['pair', 'active']
    });

    // define and register vue components
    Vue.component('coord-map-list', {
      template: '#coord-map-list',
      data: function() {
        return {
          coordMap : [],
          curCoordMap: null,
          curCoordId: -1,
          curCoord: -1,
        }
      },
      methods: {
        // `addCoordMap`
        // Inserts a new coord-map into the list, mapping from 0,0 to 0,0
        //  
        // @pre: the button must be pressed to 
        // @post: a new coord-map is inserted into the DOM
        // @post: the coord map list has one more coord map from 0,0 => 0,0
        // @post: the canvas is upadted to show this mapping
        // 
        // @params: none
        // @returns: none (immutably replaces coordMapList with a new coordMap
        // contact'd in)
        addCoordMap: function(){
          // make new point
          var id = genId();
          var cm = {
            id: id,
            origin: {x : 0, y: 0},
            dest: {
              x : Math.floor(250*Math.random() + 50),
              y: Math.floor(250*Math.random() + 50),},
          }
          
          // add to list
          this.coordMap.push(cm);
          
          // select new one
          this.selectCoordMap(id);
          this.selCoord(0);
        },
        
        rmvCoordMap: function(coordId) {
          // console.log("removing this index:", coordId);          
          this.coordMap = this.coordMap.filter(function(cm, id) {
            if (cm.id === coordId)  return false;
            else { 
              // deselct if matching
              this.selectCoordMap(cm.id);
              return true
            };
          }.bind(this))
        },
        
        selectCoordMap: function(coordId) {
          if (coordId === this.curCoordId) {
            this.curCoordId = -1;
            this.curCoordMap = null;
          } else {
            this.curCoordId = coordId;
            var cand = this.coordMap.filter(function(cm) {
              return cm.id === coordId;
            });
            this.curCoordMap = (this.coordMap.length > 0) ? cand[0] : null;
          }
          // console.log("selected", this.curCoordMap);
        },
        selCoord: function(coord) {
          this.curCoord =  coord;
        }
      },
      mounted: function() {
        console.log("mounted point list");
        c.setClickHandler(function(e) {
          console.log("evt", e);
          console.log("this", this.curCoordMap);
          var x = e.layerX;
          var y = e.layerY;
          var curCoordMap = this.curCoordMap;
          switch (this.curCoord) {
            case 0:
            case 1:
              curCoordMap['origin'].x = x;
              curCoordMap['origin'].y = y;
              break;
            case 2:
            case 3:
              curCoordMap['dest'].x = x;
              curCoordMap['dest'].y = y;
              break;
          }
        }.bind(this));
      },
      updated: function() {
        // update boards
        var l = this.coordMap;
        c.drawLines(l);
      }
    });

    var vm = new Vue({
      el: '#app-container',
      data: function() {
        return {}
      },
      created: function() {
        c = new SectionedCanvas('#cv', 2);
      },
      mounted: function() {
        // gotta refersh the thing now that we're in the DOM
        c.initialize();
      }
    });
})();
