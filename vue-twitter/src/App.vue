<script setup>
import { ref } from "vue";
import { axios } from "axios";

const name = ref("");
const comment = ref("");
const post = ref([]);

async function submitPosts() {
  try {
    await axios.post(
      "https://vue-test-480e1-default-rtdb.firebaseio.com/posts.json",
      {
        name: name.value,
        comment: comment.value,
        createdAt: new Date().toISOString(),
      }
    );
    name.value = ""; //送信したら空欄に戻す
    comment.value = "";
    await fetchPosts();
  } catch (error) {
    console.error("投稿エラー:", error);
  }
}
</script>

<template>
  <div>
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
