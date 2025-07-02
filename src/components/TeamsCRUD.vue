<template>
  <DialogWarning
      :msg="dialogDeleteMsg"
      :show="dialogDeleteShow"
      @response="(action) => dialogDeleteEvent(action)"
  />
  <v-card>
    <v-form ref="form" v-model="formDataValid">
      <v-card-text>
        <v-switch
            v-model="formDataReadOnly"
            v-if="formButtonEditShow"
            :true-value="false"
            :false-value="true"
            label="Modify"
        ></v-switch>
        <v-text-field
            v-model="formData.id"
            :readonly="formInputIdReadOnly"
            :rules="[() => !!formData.id || 'This field is required']"
            append-inner-icon="mdi-account"
            label="Team ID"
        ></v-text-field>
        <v-text-field
            v-model="formData.ldap_group"
            :readonly="formDataReadOnly"
            append-inner-icon="mdi-account"
            label="LDAP Group"
        ></v-text-field>
        <v-divider></v-divider>
        <v-autocomplete
            v-model="formData.users"
            v-model:search="usersSearch"
            :items="usersChoices"
            :readonly="formDataReadOnly"
            @input="getUsers"
            :loading="usersSearchLoading"
            label="Users"
            chips
            closable-chips
            multiple
        >
        </v-autocomplete>
      </v-card-text>
      <v-divider v-if="!formDataReadOnly"></v-divider>
      <v-card-actions v-if="!formDataReadOnly">
        <v-btn variant="text" @click="formReset">Reset</v-btn>
        <v-spacer></v-spacer>
        <v-btn
            v-if="formButtonDeleteShow"
            color="red"
            variant="text"
            @click="formDelete"
        >Delete
        </v-btn
        >
        <v-btn color="primary" variant="text" @click="formSubmit">Submit</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import {reactive, ref, onMounted, watch, nextTick} from "vue";
import {useRoute, useRouter} from "vue-router/dist/vue-router";

import DialogWarning from "@/components/DialogWarning";

import api from "@/api/common";
import {apiErrorStore} from "@/store/api_error";
import {loginDataStore} from "@/store/login_data";

const apiError = apiErrorStore();
const loginData = loginDataStore();

const route = useRoute();
const router = useRouter();

const dialogDeleteShow = ref(false);
const dialogDeleteMsg = ref("");

function dialogDeleteEvent(action) {
  if (action === "cancel") {
    dialogDeleteShow.value = false;
    dialogDeleteMsg.value = "";
  } else {
    dialogDeleteShow.value = false;
    dialogDeleteMsg.value = "";
    let url = `/api/v1/teams/${formData.id}`;
    api.delete(url).then(() => {
      router.push({
        name: "TeamsSearch",
      });
    });
  }
}

const form = ref(null);
const formData = reactive({});
const formDataReadOnly = ref(true);
const formDataValid = ref(false);
const formButtonDeleteShow = ref(true);
const formButtonEditShow = ref(false);
const formInputIdReadOnly = ref(true);

const usersChoices = ref([]);
const usersSearch = ref("");
const usersSearchLoading = ref(true);

function formConfigure() {
  if (route.params.team !== "_new") {
    formInputIdReadOnly.value = true;
    formDataReadOnly.value = true;
    formButtonEditShow.value = true;
  } else if (route.params.team === "_new") {
    formInputIdReadOnly.value = false;
    formDataReadOnly.value = false;
    formButtonDeleteShow.value = false;
    formButtonEditShow.value = false;
  } else {
    formInputIdReadOnly.value = true;
    formDataReadOnly.value = true;
    formButtonEditShow.value = false;
  }
}

function formDelete(event) {
  dialogDeleteShow.value = true;
  dialogDeleteMsg.value = `Are you sure you want to delete Team: ${route.params.team}`;
}

function formReset(event) {
  event.preventDefault();
  formGetTeamData();
  formDataValid.value = false;
  nextTick(() => {
    form.value.resetValidation();
  });
}

function formSubmit(event) {
  event.preventDefault();
  let method = "put";
  let url = `/api/v1/teams/${formData.id}`;
  let data = {
    ldap_group: formData.ldap_group,
    users: formData.users,
  };
  if (route.params.team === "_new") {
    method = "post";
  }
  api.request(method, url, data).then((data) => {
    if (route.params.team === "_new") {
      formButtonDeleteShow.value = true;
      router.push({
        name: "TeamsCRUD",
        params: {team: formData.id},
      });
    } else {
      formDataReadOnly.value = true;
      formGetTeamData();
    }
  });
}

function formGetTeamData() {
  if (route.params.team === "_new") {
    formDataValid.value = false;
    nextTick(() => {
      form.value.resetValidation();
    });
    formData["id"] = "";
    formData["ldap_group"] = "";
    formData["users"] = [];
  } else {
    api
        .get(`/api/v1/teams/${route.params.team}`)
        .then((data) => {
          if (data) {
            formData["id"] = data["id"];
            formData["ldap_group"] = data["ldap_group"];
            formData["users"] = data["users"];
          }
        });
  }
  getUsers();
  usersSearchLoading.value = false;
}

function getUsers() {
  usersSearchLoading.value = true;
  usersChoices.value = [];
  if (!formData.users) {
    formData.users = ""
  }
  api.get(`/api/v1/users`, {user_id: usersSearch.value}).then((data) => {
    if (data) {
      data.result.forEach((user) => {
        if (
            !usersChoices.value.some((choice) => choice === user.id)
        ) {
          usersChoices.value.push(user.id);
        }
      });
    }
  });
  usersSearchLoading.value = false;
}

watch(
    () => [route.params.team, loginData.getUserDataIsAdmin],
    () => {
      if (route.name === "TeamsCRUD") {
        formConfigure();
        formGetTeamData();
      }
    },
);

onMounted(async () => {
  formConfigure();
  formGetTeamData();
  apiError.setRedirect({name: "TeamsSearch",});
});
</script>
