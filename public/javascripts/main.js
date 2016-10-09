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
          reader: reader
        }
      },
      methods : {
        previewFile: function(e) {
          this.files = e.target.files || e.dataTransfer.files
          this.filename = this.files[0].name;
          console.log("filename", this.files[0].name);
          this.hasFile = true;
          
          // create a file reader to conver file
          
          this.reader.onload = (e) => {
            // create a new image object
            var img = new Image;
            
            // draw it on the canvas
            img.onload = function() { c.drawImage(0, img); };
            img.src = e.target.result;
          };
          this.reader.readAsDataURL(this.files[0]);
          
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
        
        selCoord: function(e) {
          console.log("e", e);
        }
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
      mounted: function() {
        // Obtain a reference to the canvas element using its id.
        c = new SectionedCanvas(this.$el.querySelector('canvas'), 2);
      }
    });
})();
