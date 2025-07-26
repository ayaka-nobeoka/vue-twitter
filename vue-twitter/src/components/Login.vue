<script setup>
import { ref, onMounted } from "vue";

const username = ref("");

// 保存された名前があれば初期表示に反映
onMounted(() => {
  const saved = sessionStorage.getItem("username");
  if (saved) {
    username.value = saved;
  }
});

// 名前を保存
function saveName() {
  sessionStorage.setItem("username", username.value);
}

// 名前をリセット
function resetName() {
  username.value = "";
  sessionStorage.removeItem("username");
}
</script>

<template>
  <div>
    <h1>ログインページ</h1>
    <input type="text" v-model="username" />
    <button @click="saveName">保存</button>
    <button @click="resetName">リセット</button>
    <router-link to="/">ホームへ戻る</router-link>
  </div>
</template>

<style scoped></style>
