import './style.css'

const width = 1600;
const height = 800;
const inputField = document.getElementById("staticInputField");

class GameScene extends Phaser.Scene{
  constructor() {
    super("scene-game")
    this.mode = "drag";
  }

  preload(){
    this.load.image("bg", "/assets/background.png")
    this.load.image("button", "/assets/LOGO.png")
    this.load.image("vertex", "/assets/kreis.png")
    this.load.image("vertex-marked", "/assets/kreis2.png")
  }

  create() {
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    this.graphics = this.add.graphics();
    
    const spawnerVertex = this.add.text(800 - 600, 10, "Add Vertex", {
      fill: 'rgb(189, 189, 189)',
      fontSize: 30, 
      backgroundColor: 'cornflowerblue', 
      padding: { left: 30, right: 30, top: 3, bottom: 3},
      fontFamily: 'Valken'
    })
    .setInteractive()
    .on('pointerdown', () => this.addVertex(width/2, height/2), this);
    
    this.currentMode = this.add.text(1350, 50, `${this.mode}`, { fill: 'rgb(189, 189, 189)', fontSize: 20, backgroundColor: 'cornflowerblue', fontFamily: 'Valken', padding: {left: 10, right: 10, top: 3, bottom: 3}});

    function createModeButton(x, y, text, mode) {
      return this.add.text(x, y, text, {
          fill: 'rgb(189, 189, 189)',
          fontSize: 30, 
          backgroundColor: 'cornflowerblue', 
          padding: { left: 30, right: 30, top: 3, bottom: 3},
          fontFamily: 'Valken'
      })
      .setInteractive()
      .on('pointerdown', () => this.selectMode(mode), this);
  }

    const dragMode = createModeButton.call(this, 800 - 350, 10, "Drag", "drag");
    const lineMode = createModeButton.call(this, 800 - 190, 10, "Line", "line");
    const valueMode = createModeButton.call(this, 800 - 45 , 10, "Value", "value");
    const deleteMode = createModeButton.call(this, 800 + 125, 10, "Delete", "delete");
    const dijkstra = createModeButton.call(this, 800 + 305, 10, "Dijkstra", "dijkstra");

  }

  selectMode(mode) {
    this.mode = mode;

    this.children.each(child => {
      if(child.getData('vertexInstance')) {
        const vertexInstance = child.getData('vertexInstance');
        if(vertexInstance)
          vertexInstance.modeChanged();
      }
      else if(child.getData("edgeInstance")) {
        const edgeInstance = child.getData("edgeInstance");
        if(edgeInstance)
          edgeInstance.modeChanged();
      }
    });
  }


  addVertex(x, y, value) {
    return new Vertex(this, x, y, value);
  }

  updateGraphics() {
    this.children.each((child) => {
      if (child instanceof Vertex) {
        for (let i = 0; i < child.edges.length; i++) {
          child.edges[i].updatePosition(child, child.edges[i].vertex2);
        }
      }
    });
  }

  setEdgesAndVerticesActive(active) {
    this.children.each(child => {
      if(child instanceof Edge) {
        const edgeInstance = child.getData('edgeInstance');
        if(active)
          edgeInstance.valueText.setInteractive();
        else
          edgeInstance.valueText.disableInteractive();
      }

      if(child instanceof Vertex) {
        const vertexInstance = child.getData('vertexInstance');
        if(active)
          vertexInstance.setInteractive();
        else
          vertexInstance.disableInteractive();
      }
    });
  }


  update() {
    this.currentMode.setText("Current mode: " + this.mode);
  }

}


const config = {
  type:Phaser.WEBGL,
  width:width,
  height:height,
  canvas:gameCanvas,
  scene:[GameScene]
}

const game = new Phaser.Game(config)

class Edge extends Phaser.GameObjects.Sprite {
  constructor(scene, vertex1, vertex2) {
    super(scene);
    scene.add.existing(this);
    this.scene = scene;
    this.setData("edgeInstance", this);

    this.vertex1 = vertex1;
    this.vertex2 = vertex2;

    this.lineGraphics = this.scene.add.graphics();
    this.drawConnection(0x6495ED);

    const midX = (this.vertex1.x + this.vertex2.x) / 2;
    const midY = (this.vertex1.y + this.vertex2.y) / 2 - 15;

    this.valueText = this.scene.add.text(midX, midY, "0", {
      fontSize: 30,
      fill: 'rgb(189, 189, 189)',
      padding: { x: 10, y: 5 },
      align: 'center',
      fontFamily: 'Valken',
      stroke: 'black',
      strokeThickness: 5
    }).setOrigin(0.5);
  }

  setWeight(weight) {
    this.valueText.text = weight;
  }

  getWeight() {
    return Number(this.valueText.text);
  }

  drawConnection(color) {
    this.lineGraphics.clear();
    this.lineGraphics.lineStyle(2, color, 1);
  
    const dx = this.vertex2.x - this.vertex1.x;
    const dy = this.vertex2.y - this.vertex1.y;
    const angle = Math.atan2(dy, dx);
  
    const radius = 55;
  
    const startX = this.vertex1.x + radius * Math.cos(angle);
    const startY = this.vertex1.y + radius * Math.sin(angle);
    const endX = this.vertex2.x - radius * Math.cos(angle);
    const endY = this.vertex2.y - radius * Math.sin(angle);
  
    this.lineGraphics.beginPath();
    this.lineGraphics.moveTo(startX, startY);
    this.lineGraphics.lineTo(endX, endY);
    this.lineGraphics.strokePath();
  
    // Draw arrow
    const arrowLength = 10;
    const arrowX1 = endX - arrowLength * Math.cos(angle - Math.PI / 6);
    const arrowY1 = endY - arrowLength * Math.sin(angle - Math.PI / 6);
    const arrowX2 = endX - arrowLength * Math.cos(angle + Math.PI / 6);
    const arrowY2 = endY - arrowLength * Math.sin(angle + Math.PI / 6);
  
    this.lineGraphics.beginPath();
    this.lineGraphics.moveTo(endX, endY);
    this.lineGraphics.lineTo(arrowX1, arrowY1);
    this.lineGraphics.lineTo(arrowX2, arrowY2);
    this.lineGraphics.closePath();
    this.lineGraphics.fillStyle(color, 1);
    this.lineGraphics.fillPath();

    this.scene.children.bringToTop(this.valueText);
    }

  updatePosition(vertex1, vertex2) {
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;

    this.drawConnection(0x6495ED);

    const midX = (this.vertex1.x + this.vertex2.x) / 2;
    const midY = (this.vertex1.y + this.vertex2.y) / 2 - 15;
    this.valueText.setPosition(midX, midY);
  }

  destroy() {
    this.lineGraphics.destroy();
    this.valueText.removeAllListeners(); 
    this.valueText.destroy();
    this.scene.children.remove(this);
  }

  modeChanged() {
    this.valueText.removeAllListeners(); 
    
    switch (this.scene.mode) {
      case "value":
        this.valueText.setInteractive()
        this.scene.children.bringToTop(this.lineGraphics);

        this.valueText.on('pointerdown', (pointer, localX, localY, event) => {
          this.scene.setEdgesAndVerticesActive(false);
  
          event.stopPropagation();
  
          this.drawConnection(0xBDBDBD);
  
          inputField.type = "number";
          inputField.value = this.getWeight();
          inputField.focus();
          inputField.select();
  
          if (this.enterKeyHandler) {
            this.scene.input.keyboard.removeListener('keydown-ENTER', this.enterKeyHandler);
          }
  
          this.enterKeyHandler = () => {

            if(inputField.value == "")
              inputField.value = this.getWeight();

            this.setWeight(inputField.value)

            const otherEdge = this.vertex2.getEdgeOfVertex(this.vertex1)
            if (otherEdge != null) {
              otherEdge.setWeight(inputField.value)
            }

            inputField.value = ""
            inputField.blur()
            this.scene.setEdgesAndVerticesActive(true)
            this.drawConnection(0x6495ED)
          }
  
          this.scene.input.keyboard.once('keydown-ENTER', this.enterKeyHandler)
  
          this.scene.input.once('pointerdown', () => {
            inputField.value = ""
            inputField.blur()
            this.scene.setEdgesAndVerticesActive(true)
            this.drawConnection(0x6495ED)
          })
        }, this)
        break;

        case "delete": 
          this.valueText.setInteractive();
            this.valueText.once('pointerdown', () => {
              this.vertex1.disconnectFrom(this.vertex2);
              this.vertex2.disconnectFrom(this.vertex1);
            }, this);
        break;

        default:
          if (this.valueText && this.valueText.disableInteractive) {
            this.valueText.disableInteractive()
          }
        break;
    }
  }
  

  

}

class Vertex extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "vertex");
    scene.add.existing(this);
    this.scene = scene;
    this.setData('vertexInstance', this); 

    this.x = x;
    this.y = y;

    this.edges = [];
    this.size = 0.8;

    this.setInteractive();
    this.setScale(this.size);


    this.scene.input.setDraggable(this);

    this.valueText = this.scene.add.text(this.x, this.y, "0", {
      fontSize: 30,
      fill: 'rgb(189, 189, 189)',
      padding: { x: 10, y: 5 },
      align: 'center',
      fontFamily: 'Valken',
      stroke: 'black',
      strokeThickness: 5
    }).setOrigin(0.5)

    this.selected = false;
    this.selectedVertex = this;
    this.algorithm = "";

    //For Dijkstra:
    this.cost = Number.MAX_SAFE_INTEGER;
    this.previousVertex = null;

    this.modeChanged();
  }
  
  modeChanged() {
    this.removeAllListeners();
    this.selected = false;
    this.selectedVertex = this;
    this.setTexture("vertex");
    this.setInteractive();
    this.algorithm = null;

    
    switch(this.scene.mode) {
      
      case "clickable":
        
        this.once('pointerdown', () => {
          
          if(this.algorithm == "dijkstra") {
            this.selectedVertex.dijkstra(this.selectedVertex, this);
            this.scene.selectMode("drag");
            return;
          }
          else if(this.selectedVertex.isConnectedTo(this)) //Line Mode
            this.selectedVertex.disconnectFrom(this);
          else
            this.selectedVertex.connectTo(this);
            this.scene.selectMode("line");
        })
        break;


      case "drag":

      this.scene.input.setDraggable(this);

        this.on('dragstart', () => {
          this.setScale(this.size * 1.1);
        })
      
        this.on('drag', (pointer, dragX, dragY) => {
          this.x = dragX;
          this.y = dragY;
          this.valueText.setPosition(this.x, this.y);
          this.scene.updateGraphics();
        });
      
        this.on('dragend', () => {
          this.setScale(this.size);
        });

        break;

        case "line":
          this.scene.input.setDraggable(this, false);

          this.once('pointerdown', (pointer) => {

            if(this.selected)
                return;

            this.selected = true;

            //const gameObj = this.scene.input.hitTestPointer(pointer)[0];
            //if(gameObj instanceof Vertex) {
              this.scene.mode = "clickable";
              this.scene.children.each(child => {
                if(child instanceof Vertex && child.input) {
                  const vertexInstance = child.getData('vertexInstance');
                  if(vertexInstance && vertexInstance.selected == false) {  
                    vertexInstance.modeChanged();
                    vertexInstance.selectedVertex = this;
                  }
                }
              });
            }
            
          //}
        )

          break;

        case "value":
          this.scene.input.setDraggable(this, false);
          
          this.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation(); 
            
            this.setTexture("vertex-marked");
            this.scene.setEdgesAndVerticesActive(false);

            inputField.type = "text";
            inputField.value = this.getValue();
            inputField.focus();
            inputField.select(inputField);

            this.enterKeyHandler = () => {

              if(inputField.value == "")
                inputField.value = this.getValue();

              this.setValue(inputField.value);

              inputField.value = "";
              inputField.blur();
              this.scene.setEdgesAndVerticesActive(true);
              this.setTexture("vertex");
            };
            
            this.scene.input.keyboard.once('keydown-ENTER', this.enterKeyHandler);
            
            this.scene.input.once('pointerdown', () => {
              inputField.value = "";
              inputField.blur();
              this.scene.setEdgesAndVerticesActive(true);
              this.setTexture("vertex");

              this.scene.input.keyboard.removeListener('keydown-ENTER', this.enterKeyHandler);
            });

          }, this);
          
          break;

        case "delete":
          this.once('pointerdown', () => {
            this.destroy();
          }, this);
          break;

        case "dijkstra":
          this.once('pointerdown', () => {

            if(this.selected)
                return;

            this.selected = true;

            this.scene.mode = "clickable";
            this.scene.children.each(child => {
              if(child instanceof Vertex) {
                const vertexInstance = child.getData('vertexInstance');
                if(vertexInstance && vertexInstance.selected == false) {
                  vertexInstance.modeChanged();
                  vertexInstance.selectedVertex = this;
                  vertexInstance.algorithm = "dijkstra";
                }
              }
            });
            
          })
          break;
          
    }


  }

  dijkstra(start, end) {
    console.log("Dijkstra from: " + start.getValue() + " to " + end.getValue());

    const visited = new Set();

    start.cost = 0;

    const pq = new PriorityQueue(); 
    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
      const currentVertex = pq.dequeue();

      if(visited.has(currentVertex)) {
        continue; 
      }

      visited.add(currentVertex);

      console.log("Investigating " + currentVertex.getValue());

      for(let i = 0; i < currentVertex.edges.length; i++){
        console.log(currentVertex.cost + currentVertex.edges[i].getWeight() + " < " + currentVertex.edges[i].vertex2.cost + " ?");

        const neighbor = currentVertex.edges[i].vertex2;
        const newCost = (currentVertex.cost + currentVertex.edges[i].getWeight());

        if( newCost < neighbor.cost) {
          neighbor.cost = (currentVertex.cost + currentVertex.edges[i].getWeight());
          neighbor.previousVertex = currentVertex;
          pq.enqueue(neighbor, newCost);
          console.log("Shorter path found!")
        }
      }

    }

    let beforeVertex = end;
    let currentVertex = end.previousVertex;
    
    let path = [];
    
    this.scene.updateGraphics();

    while(currentVertex != null) { //GET PATH

      let edge = currentVertex.getEdgeOfVertex(beforeVertex);
      this.scene.children.bringToTop(edge.lineGraphics);
      edge.drawConnection(0xff0000);
      beforeVertex = currentVertex;
      path.push(currentVertex.getValue());

      
      currentVertex = currentVertex.previousVertex;
    }

    path.reverse();
    console.log(path)
  
    //RESET
    this.scene.children.each(child => {
      if(child instanceof Vertex) {
        const vertexInstance = child.getData('vertexInstance');
        vertexInstance.cost = Number.MAX_SAFE_INTEGER;
        vertexInstance.previousVertex = null;
      }
    });


  }

  isConnectedTo(vertex) {

    for(let i = 0; i < this.edges.length; i++) {
      if(this.edges[i].vertex2 == vertex)
          return true;
    }

    return false;
  }

  connectTo(vertex) {
    const newEdge = new Edge(this.scene, this, vertex);
    
    const otherEdge = vertex.getEdgeOfVertex(this);
    if(otherEdge != null) {
      const otherEdgeWeight = otherEdge.getWeight();
      newEdge.setWeight(otherEdgeWeight);
    }

    console.log("Pushing");
    this.edges.push(newEdge);
    console.log(this.edges);
  }

  disconnectFrom(vertex) {
    for(let i = 0; i < this.edges.length; i++) {
      if(this.edges[i].vertex2 == vertex) {
        this.edges[i].destroy();
        this.edges.splice(i, 1);
        break;
      }
    }


    this.scene.updateGraphics();
  }

  destroy() {
    const edgesToDisconnect = [...this.edges];
    edgesToDisconnect.forEach(edge => {
      this.disconnectFrom(edge.vertex2);
    });
    
    this.scene.children.each(child => {
      if(child instanceof Vertex) {
        const vertexInstance = child.getData("vertexInstance");
        if(vertexInstance != this)
          vertexInstance.disconnectFrom(this); 
      }
    })

    this.removeAllListeners(); 
    this.valueText.destroy();
    this.scene.children.remove(this);
  }

  getEdgeOfVertex(vertex) {
    for (let i = 0; i < this.edges.length; i++) {
      if (this.edges[i].vertex2 === vertex) {
        return this.edges[i];
      }
    }

    return null;
  }

  getVertices() {
    return this.connectedVertices;
  }

  getValue() {
    return this.valueText.text;
  }

  setValue(value) {
    this.valueText.setText(value);
  }
}

class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(vertex, priority) {
    this.items.push({ vertex, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.items.shift().vertex;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
