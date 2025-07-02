import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const loginDataStore = defineStore("loginData", () => {
  const timestamp = ref(0);
  const userData = ref({});

  const isTimestampOlderThan = (seconds) => {
    const currentTimeStamp = Date.now();
    const secondsAgo = currentTimeStamp - seconds * 1000; // convert seconds to milliseconds
    return timestamp.value < secondsAgo;
  };

  const getUserData = computed(() => userData.value);
  const getUserDataId = computed(() => userData.value.id);
  const getUserDataIsAdmin = computed(() => userData.value.admin);

  function setTimestamp() {
    timestamp.value = Date.now();
  }

  function resetTimestamp() {
    timestamp.value = 0;
  }
  function resetUserData() {
    userData.value = {};
  }

  function setUserData(data) {
    userData.value = data;
  }

  return {
    timestamp,
    userData,
    isTimestampOlderThan,
    getUserData,
    getUserDataId,
    getUserDataIsAdmin,
    resetTimestamp,
    resetUserData,
    setTimestamp,
    setUserData,
  };
});
