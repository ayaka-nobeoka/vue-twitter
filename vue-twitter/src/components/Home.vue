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
  <div class="min-h-screen bg-pink-50">
    <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <router-link to="/login" class="text-purple-700 underline mb-4 block">
        ログインページへ
      </router-link>

      <h1 class="text-3xl font-bold mb-4">Tailwind は動いてる？</h1>
      <h2 class="text-2xl font-bold mb-6">📋 掲示板！</h2>

      <div class="mb-4">
        <label class="block font-semibold mb-1">名前</label>
        <input
          v-model="name"
          class="w-full border border-gray-300 p-2 rounded"
          type="text"
        />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">コメント</label>
        <textarea
          v-model="comment"
          class="w-full border border-gray-300 p-2 rounded"
        ></textarea>
      </div>

      <button
        @click="submitPosts"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-bold transition"
      >
        投稿する
      </button>

      <h2 class="text-xl font-bold mt-10">📝 投稿一覧</h2>
      <ul class="space-y-2 mt-2">
        <li
          v-for="item in post"
          :key="item.id"
          class="bg-gray-100 border p-2 rounded"
        >
          {{ item.name }}: {{ item.comment }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped></style>

<!-- 👀ポイント -->
<!-- v-for="item in post"　　配列 post を1つずつ item にしてループ -->
<!-- :key="item.id"　各項目に一意のキーを設定-->
<!-- : は何？ v-bind: の省略形。HTML属性に変数を渡す時に使う-->
