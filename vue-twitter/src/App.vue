<script setup>
import { ref } from "vue";
import axios from "axios";
import Login from "./components/Login.vue";

const name = ref("");
const comment = ref("");
const post = ref([]);

async function fetchPosts() {
  try {
    const response = await axios.get(
      "https://vue-test-480e1-default-rtdb.firebaseio.com/posts.json"
    );
    post.value = Object.entries(response.data).map(([id, data]) => ({
      id,
      ...data,
    }));
  } catch (error) {
    console.error("取得エラー:", error);
  }
}
</script>

<template>
  <div>
    <Login />
    <h1>掲示板！</h1>
    名前
    <div><input type="text" v-model="name" /></div>
    コメント
    <div><textarea v-model="comment"></textarea></div>
    <br />
    <button @click="submitPosts">投稿する</button>
    <br /><br />
    <h2>投稿一覧</h2>
  </div>
</template>

<style scoped></style>
