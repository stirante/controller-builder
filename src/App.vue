<template>
  <div id="app">
    <v-app id="inspire">
      <v-app-bar app clipped-right color="blue-grey" dark>
        <v-toolbar-title>controller-builder</v-toolbar-title>
        <v-text-field v-model="controllerName" label="Controller name" dense
                      style="margin-top: 18px;margin-left: 30px;"/>
        <v-spacer></v-spacer>
        <v-btn icon @click="clearAll()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-dialog v-model="dialog" ref="dialog" width="600px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on" @click="updateData()">
              <v-icon>mdi-code-json</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">Animation controller JSON</span>
            </v-card-title>
            <v-card-text>
              <div style="display: flex">
                <v-textarea :value="controllerJson" ref="textarea" dense rows="1"/>
                <v-btn @click="copyJson()" icon>
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </div>
              <json-viewer :value="controller" :expand-depth=5></json-viewer>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="dialog = false">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-app-bar>

      <v-main>
        <v-dialog v-model="importDialog" ref="importDialog" width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Import animation controller</span>
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="option in imports" @click="importController(option)" :key="option">{{ option }}
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar" multi-line top color="red" timeout="-1">
          {{ errorMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn dark text v-bind="attrs" @click="snackbar = false;errorMessage = null">
              Close
            </v-btn>
          </template>
        </v-snackbar>
        <Drawflow ref="drawflow" v-on:error="showErrorMessage($event)" :loaded="this.imported" :name="controllerName"/>
      </v-main>

      <v-footer app color="blue-grey" class="white--text">
        <v-spacer></v-spacer>
        <span>&copy; Piotr "stirante" Brzozowski {{ new Date().getFullYear() }}</span>
      </v-footer>
    </v-app>
  </div>
</template>

<style>

.scrollable {
  overflow-y: auto;
  max-height: calc(100vh - 124px);
}
</style>

<script>
import JsonViewer from 'vue-json-viewer'
import stripJsonComments from "strip-json-comments";
import Drawflow from "@/pages/Drawflow";
import {Graph} from "graphlib"
import dagre from "dagre"

export default {
  props: {
    source: String,
  },
  components: {
    Drawflow,
    JsonViewer
  },
  beforeMount() {
    let dropZone = document.getElementsByTagName('body')[0];
    let ctx = this;
    dropZone.addEventListener('dragover', function (evt) {
      ctx.handleDragOver(evt);
    }, false);
    dropZone.addEventListener('drop', function (evt) {
      ctx.handleJSONDrop(evt);
    }, false);
  },
  methods: {
    clearAll() {
      this.controllerName = "controller.animation.name";
      this.controller = {};
      this.dialog = false;
      this.snackbar = false;
      this.errorMessage = "";
      this.$refs.drawflow.clear();
    },
    copyJson() {
      let element = this.$refs.textarea.$el.querySelector('textarea');
      element.select();
      element.setSelectionRange(0, this.controllerJson.length);
      document.execCommand("copy");
    },
    showErrorMessage(msg) {
      this.snackbar = true;
      this.errorMessage = msg;
    },
    load(jsonFile) {
      this.snackbar = false;
      let keys = Object.keys(jsonFile.animation_controllers);
      if (keys.length === 0) {
        this.errorMessage = "No animation controller found!"
        this.snackbar = true;
        return;
      }
      this.jsonFile = jsonFile;
      if (keys.length === 0) {
        this.importController(keys[0]);
        return;
      }
      this.imports = keys;
      this.importDialog = true;
    },
    handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
    },
    handleJSONDrop(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      let files = evt.dataTransfer.files;
      for (let i = 0; files.length; i++) {
        let f = files[i];
        if (!f) {
          return;
        }
        if (!f.type.match('application/json')) {
          continue;
        }

        let reader = new FileReader();
        let ctx = this;
        reader.onload = function (e) {
          ctx.load(JSON.parse(stripJsonComments(e.target.result)));
        };

        reader.readAsText(f);
      }
    },
    updateData() {
      try {
        this.controller = this.$refs.drawflow.getData();
      } catch (e) {
        this.showErrorMessage(e.message);
      }
    },
    importController(option) {
      this.controllerName = option;
      this.importDialog = false;
      for (const key in this.jsonFile.animation_controllers) {
        if (key !== option) {
          delete this.jsonFile.animation_controllers[key];
        }
      }
      let states = this.jsonFile.animation_controllers[option].states;
      let g = new Graph();
      g.setGraph({});
      g.setDefaultEdgeLabel(function () {
        return {};
      });
      for (const state in states) {
        g.setNode("state_" + state, {label: state, height: 66, width: 66 + (state.length * 20)});
      }
      for (const state in states) {
        if (!states[state].transitions) {
          continue;
        }
        for (const index in states[state].transitions) {
          let src = state;
          let dst = Object.keys(states[state].transitions[index])[0];
          let condition = states[state].transitions[index][dst];
          let id = "trans_" + src + "_" + dst + "_" + index + "_" + condition;
          g.setNode(id, {
            label: condition,
            src: src,
            dst: dst,
            index: index,
            height: 66,
            width: 74 + (state.length * 20)
          });
          g.setEdge("state_" + src, id);
          g.setEdge(id, "state_" + dst);
        }
      }

      dagre.layout(g);
      for (let nodesKey in g.nodes()) {
        let nodeId = g.nodes()[nodesKey];
        let node = g.node(nodeId);
        if (nodeId.indexOf("state_") === 0) {
          states[node.label].$x = node.x;
          states[node.label].$y = node.y;
        } else if (nodeId.indexOf("trans_") === 0) {
          states[node.src].transitions[node.index].$x = node.x;
          states[node.src].transitions[node.index].$y = node.y;
        }
      }
      this.imported = this.jsonFile;
      this.errorMessage = "";
    }
  },
  computed: {
    controllerJson() {
      return JSON.stringify(this.controller, null, 2);
    }
  },
  data: () => ({
    dialog: false,
    imported: null,
    controller: null,
    errorMessage: null,
    snackbar: false,
    importDialog: false,
    imports: [],
    jsonFile: null,
    controllerName: "controller.animation.name"
  })
}

</script>
