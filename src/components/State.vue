<!--suppress JSUnfilteredForInLoop -->
<template>
  <div class="state">
    <v-dialog v-model="dialog" persistent scrollable max-width="600px" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            icon
            color="white"
            v-bind="attrs"
            v-on="on"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">State</span>
          <v-spacer/>
          <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" label="Name"/>
          <ArrayControl label="Animations" description="Animations or animation controllers to trigger enter, when in this state. Use names used in entity description." :data="animations" v-on:change="animations = $event"/>
          <ArrayControl label="Particle effects" description="Particle effects to activate, when in this state. Use names used in entity description." :data="particle_effects" v-on:change="particle_effects = arrayToEffectObjects($event)"/>
          <ArrayControl label="On entry" description="Molang expressions, entity events and commands to execute, when entering the state" :data="on_entry" v-on:change="on_entry = $event"/>
          <ArrayControl label="On exit" description="Molang expressions, entity events and commands to execute, when exiting the state" :data="on_exit" v-on:change="on_exit = $event"/>
        </v-card-text>
      </v-card>
    </v-dialog>
    {{ name }}
  </div>
</template>

<style>
.state {
  background: #217a00;
  color: white;
}
</style>

<script>


import ArrayControl from "@/components/ArrayControl";
export default {
  name: 'State',
  components: {ArrayControl},
  mounted() {
    if (this.inputName) {
      this.name = this.inputName;
    }
    if (this.inputAnimations) {
      this.animations = this.inputAnimations;
    }
    if (this.inputEffects) {
      this.particle_effects = this.effectObjectsToArray(this.inputEffects);
    }
    if (this.inputEntry) {
      this.on_entry = this.inputEntry;
    }
    if (this.inputExit) {
      this.on_exit = this.inputExit;
    }
  },
  methods: {
    arrayToEffectObjects(arr) {
      let result = [];
      for (let i = 0; i < arr.length; i++) {
        result.push({effect: arr[i]});
      }
      return result;
    },
    effectObjectsToArray(obj) {
      let result = [];
      for (let i = 0; i < obj.length; i++) {
        result.push(obj[i].effect);
      }
      return result;
    },
    getName() {
      return this.name;
    },
    getData() {
      return this.removeEmptyArrays({
        animations: this.animations,
        particle_effects: this.particle_effects,
        on_entry: this.on_entry,
        on_exit: this.on_exit
      });
    },
    removeEmptyArrays(object) {
      for (const key in object) {
        let prop = object[key];
        if (prop instanceof Array && prop.length === 0) {
          delete object[key];
        }
      }
      return object;
    }
  },
  data: () => ({
    name: "default",
    animations: [],
    particle_effects: [],
    on_entry: [],
    on_exit: [],
    dialog: false
  }),
  computed: {},
  props: {
    inputName: String,
    inputAnimations: Array,
    inputEffects: Array,
    inputEntry: Array,
    inputExit: Array
  }
}
</script>
