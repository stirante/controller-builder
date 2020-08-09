<!--suppress JSUnfilteredForInLoop -->
<template>
  <div class="transition">
    <v-dialog v-model="dialog" persistent max-width="600px">
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
          <span class="headline">Transition</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-text-field v-model="condition" label="Condition" hint="When this Molang expression return 1, animation controller will switch to new state" persistent-hint/>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <pre>{{ condition }}</pre>
  </div>
</template>

<style>
.transition {
  background: #7a0066;
  color: white;
}
pre {
  display: inline;
  border: 1px white solid;
  border-radius: 3px;
  padding: 1px 3px;
}
</style>

<script>


export default {
  name: 'Transition',
  mounted() {
    if (this.inputCondition) {
      this.condition = this.inputCondition;
    }
  },
  methods: {
    getCondition() {
      return this.condition;
    }
  },
  data: () => ({
    condition: "1",
    dialog: false
  }),
  computed: {},
  props: {
    inputCondition: String
  }
}
</script>
