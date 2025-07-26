<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

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

async function submitPosts() {
  await axios.post(
    "https://vue-test-480e1-default-rtdb.firebaseio.com/posts.json",
    {
      name: name.value,
      comment: comment.value,
      createdAt: new Date().toISOString(),
    }
  );

  name.value = "";
  comment.value = "";
  await fetchPosts();
}

onMounted(() => {
  fetchPosts(); // ✅ ここを忘れずに！
});
</script>

<template>
  <div>
    <nav><router-link to="/login">ログインページへ</router-link></nav>
    <h1 class="text-2xl text-blue-600">Tailwind OK?</h1>
    <h1>掲示板！</h1>
    名前
    <div><input type="text" v-model="name" /></div>
    コメント
    <div><textarea v-model="comment"></textarea></div>
    <br />
    <button @click="submitPosts">投稿する</button>
    <br /><br />

    <h2>投稿一覧</h2>
    <ul>
      <li v-for="item in post" :key="item.id">
        {{ item.name }}: {{ item.comment }}
      </li>
    </ul>
  </div>
</template>

<style scoped></style>

<!-- 👀ポイント -->
<!-- v-for="item in post"　　配列 post を1つずつ item にしてループ -->
<!-- :key="item.id"　各項目に一意のキーを設定-->
<!-- : は何？ v-bind: の省略形。HTML属性に変数を渡す時に使う-->
