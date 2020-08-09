<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="fill-height col-2">
        <v-list>
          <v-list-item class="drag-drawflow node-item" draggable="true" @dragstart="drag" data-node="State">
            <v-list-item-content>
              <v-list-item-title>State</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="drag-drawflow node-item" draggable="true" @dragstart="drag" data-node="Transition">
            <v-list-item-content>
              <v-list-item-title>Transition</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col class="fill-height col-10 chart-bg">
        <div ref="container" @drop="drop" @dragover="allowDrop"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
:root {
  --border-color: #cacaca;
  --background-color: #ffffff;

  --background-box-title: #f7f7f7;
}

.chart-bg {
  position: relative;
  background: var(--background-color);
  background-size: 25px 25px;
  background-image: linear-gradient(to right, #f1f1f1 1px, transparent 1px),
  linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
}

.parent-drawflow {
  display: flex;
  overflow: hidden;
  touch-action: none;
  outline: none;
  width: 100%;
  height: 100%;
}

.drawflow {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;

}

.drawflow .parent-node {
  position: relative;
}

.drawflow .drawflow-node {
  display: flex;
  align-items: center;
  position: absolute;
  background: var(--background-color);
  min-height: 40px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  color: black;
  z-index: 2;
}

.drawflow .drawflow-node.selected {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.drawflow .drawflow-node:hover {
  cursor: move;
}

.drawflow .drawflow-node .inputs, .drawflow .drawflow-node .outputs {
  width: 0px;
}

.drawflow .drawflow-node .drawflow_content_node {
  width: 100%;
  display: block;
}

.drawflow_content_node > div {
  padding: 15px;
}

.drawflow .drawflow-node .input, .drawflow .drawflow-node .output {
  position: relative;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  cursor: crosshair;
  z-index: 1;
  margin-bottom: 5px;
}

.drawflow .drawflow-node .input {
  left: -11px;
  top: 2px;
}

.drawflow .drawflow-node .output {
  right: 9px;
  top: 2px;
}

.drawflow svg {
  z-index: 0;
  position: absolute;
  overflow: visible !important;
}

.drawflow .connection {
  position: absolute;
  transform: translate(9999px, 9999px);
}

.drawflow .connection .main-path {
  fill: none;
  stroke-width: 5px;
  stroke: #607d8b;
  transform: translate(-9999px, -9999px);
}

.drawflow .connection .main-path:hover {
  cursor: pointer;
}

.drawflow .connection .main-path.selected {
  stroke: #90a4ae;
}

.drawflow .connection .point {
  cursor: move;
  stroke: black;
  stroke-width: 2;
  fill: white;
  transform: translate(-9999px, -9999px);
}

.drawflow .connection .point.selected, .drawflow .connection .point:hover {
  fill: #90a4ae;
}

.drawflow .main-path {
  fill: none;
  stroke-width: 5px;
  stroke: #607d8b;
}

.drawflow .selectbox {
  z-index: 3;
  position: absolute;
  transform: translate(9999px, 9999px);
}

.drawflow-delete {
  position: absolute;
  display: block;
  width: 30px;
  height: 30px;
  background: #607d8b;
  color: white;
  z-index: 4;
  border: 2px solid var(--border-color);
  line-height: 30px;
  font-weight: bold;
  text-align: center;
  border-radius: 50%;
  font-family: monospace;
  cursor: pointer;
}

.drawflow > .drawflow-delete {
  margin-left: -15px;
  margin-top: 15px;
}

.parent-node .drawflow-delete {
  right: -15px;
  top: -15px;
}

.node-item:hover {
  cursor: move;
  background: lightgray;
}

</style>

<script>
import Vue from "vue";
import Drawflow from "../drawflow/drawflow"
import State from "@/components/State";
import Transition from "@/components/Transition";
import vuetify from "../plugins/vuetify"

export default {
  name: 'Drawflow',
  created() {
  },
  mounted() {
    this.editor = new Drawflow(this.$refs.container, Vue);
    this.editor.reroute = true;
    this.editor.start();
    let ctx = this;
    this.editor.on('connectionCreated', function (ev) {
      let nodes = ctx.editor.getNodesForModule(ctx.editor.module);
      let src = nodes[ev.output_id].name;
      let dst = nodes[ev.input_id].name;
      if (src === dst) {
        ctx.$emit('error', "You can't connect those nodes!");
        ctx.editor.removeSingleConnection(ev.output_id, ev.input_id, ev.output_class, ev.input_class);
      }
    });
    this.editor.registerNode("State", State, {}, {vuetify});
    this.editor.registerNode("Transition", Transition, {}, {vuetify});

    if (this.loaded) {
      this.loadJson(this.loaded);
    }
  },
  watch: {
    loaded: function (newVal) {
      this.loadJson(newVal);
    }
  },
  methods: {
    loadJson(json) {
      this.editor.clear();
      let keys = Object.keys(json.animation_controllers);
      let states = json.animation_controllers[keys[0]].states;
      for (const state in states) {
        states[state].$id = this.editor.addNode("State", 1, 1, states[state].$x, states[state].$y, "State", {
          inputName: state,
          inputAnimations: states[state].animations,
          inputEffects: states[state].particle_effects,
          inputEntry: states[state].on_entry,
          inputExit: states[state].on_exit
        }, "State", "vue");
      }
      for (const state in states) {
        if (!states[state].transitions) {
          continue;
        }
        for (const index in states[state].transitions) {
          let src = state;
          let dst = Object.keys(states[state].transitions[index])[0];
          let condition = states[state].transitions[index][dst];
          let id = this.editor.addNode("Transition", 1, 1, states[state].transitions[index].$x, states[state].transitions[index].$y, "Transition", {
            inputCondition: condition
          }, "Transition", "vue");
          this.editor.addConnection(states[src].$id, id, "output_1", "input_1");
          this.editor.addConnection(id, states[dst].$id, "output_1", "input_1");
        }
      }
    },
    drag(ev) {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    },
    drop(ev) {
      if (ev.dataTransfer.files.length !== 0) return;
      ev.preventDefault();
      let data = ev.dataTransfer.getData("node");
      let pos_x = ev.clientX * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)));
      let pos_y = ev.clientY * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) - (this.editor.precanvas.getBoundingClientRect().y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)));
      this.editor.addNode(data, 1, 1, pos_x, pos_y, data, {}, data, "vue");
    },
    allowDrop(ev) {
      ev.preventDefault();
    },
    getData() {
      let nodes = this.editor.getNodesForModule(this.editor.module);
      let controllers = {
        "format_version": "1.10.0",
        "animation_controllers": {
        }
      };
      controllers.animation_controllers[this.name] = {"states": {}}
      for (const id in nodes) {
        let node = nodes[id].componentInstance;
        if (nodes[id].name === "State") {
          let data = node.getData();
          data.transitions = [];
          for (const index in nodes[id].outputs.output_1.connections) {
            let transition = nodes[nodes[id].outputs.output_1.connections[index].node];
            if (transition.outputs.output_1.connections.length === 0) continue;
            let target = nodes[transition.outputs.output_1.connections[0].node];
            let json = {};
            json[target.componentInstance.getName()] = transition.componentInstance.getCondition();
            data.transitions.push(json);
          }
          if (data.transitions.length === 0) {
            delete data.transitions;
          }
          if (controllers.animation_controllers[this.name].states[node.getName()]) {
            throw new Error("Multiple states named '" + node.getName() + "'!")
          }
          controllers.animation_controllers[this.name].states[node.getName()] = data;
        }
      }
      return controllers;
    },
    clear() {
      this.editor.clear();
    }
  },
  data: () => ({
    editor: null
  }),
  props: {
    loaded: Object,
    name: String
  }
}
</script>
