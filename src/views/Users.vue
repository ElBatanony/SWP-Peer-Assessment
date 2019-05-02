<template>
    <v-layout row>
    <v-flex >
      <v-text-field
            label="Find user"
            append-icon="search"
            color="success"
            v-model="searchName"
          ></v-text-field>
      <v-card>

        

        <v-list two-line>
          <template v-for="(account, index) in searchedAccounts">
            <v-list-tile :key="account.id" @click="$router.push('users/'+account.id)" >

              <v-list-tile-content>
                <v-list-tile-title>{{ account.name }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">{{ account.email }}</v-list-tile-sub-title>
                <v-list-tile-sub-title>{{ account.role }}</v-list-tile-sub-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-list-tile-action-text>{{ account.course }}-{{ account.group }}</v-list-tile-action-text>
                <v-icon>edit</v-icon>
              </v-list-tile-action>

            </v-list-tile>
            <v-divider v-if="index + 1 < accounts.length" :key="index" ></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";
export default {
  data : function () {
    return {
      searchName : ''
    }
  },
  computed: {
    ...mapState(["accounts"]),
    searchedAccounts() {
      return this.accounts.filter( x => x.name.toLowerCase().includes( this.searchName.toLowerCase() ) )
    }
  }
};
</script>
