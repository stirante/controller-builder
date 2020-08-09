<!--suppress JSUnfilteredForInLoop -->
<template>
  <v-card class="array-control">
    <v-card-title>
      <span class="headline">{{label}}</span>
      <v-spacer></v-spacer>
      <v-btn icon @click="add()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle v-if="description">
      {{description}}
    </v-card-subtitle>
    <v-card-text>
      <div v-for="(item, index) in arr" :key="index" style="display: flex">
        <v-btn icon @click="remove(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-text-field :value="item" v-on:change="arr[index] = $event;$emit('change', arr)" dense></v-text-field>
      </div>
    </v-card-text>
  </v-card>
</template>

<style>
.array-control {
  margin-bottom: 20px;
}
</style>

<script>


export default {
  name: 'ArrayControl',
  mounted() {
    if (this.data) {
      this.arr = this.data;
    }
  },
  methods: {
    remove(index) {
      this.arr.splice(index, 1);
      this.$emit('change', this.arr);
    },
    add() {
      this.arr.push("");
      this.$emit('change', this.arr);
    },
    getData() {
      return this.arr;
    }
  },
  data: () => ({
    arr: []
  }),
  computed: {},
  props: {
    data: Array,
    label: String,
    description: String
  }
}
</script>
