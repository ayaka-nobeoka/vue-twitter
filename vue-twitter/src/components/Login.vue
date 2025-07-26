<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const router = useRouter();

// 初期表示で sessionStorage に保存されてたらセット
onMounted(() => {
  const saved = sessionStorage.getItem("username");
  if (saved) {
    username.value = saved;
  }
});

// 保存してから /secret に移動！
function saveName() {
  sessionStorage.setItem("username", username.value);
  router.push("/secret"); // ←ここでログイン後のページへ遷移！
}

// 名前をリセット
function resetName() {
  username.value = "";
  sessionStorage.removeItem("username");
}
</script>
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">
        ログインページ
      </h1>

      <input
        type="text"
        v-model="username"
        placeholder="名前を入力"
        class="w-full border border-gray-300 rounded px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <div class="flex justify-between mb-4">
        <button
          @click="saveName"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded"
        >
          保存
        </button>
        <button
          @click="resetName"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 text-sm rounded"
        >
          リセット
        </button>
      </div>

      <router-link
        to="/"
        class="block text-center text-sm text-blue-600 hover:underline"
      >
        ホームへ戻る
      </router-link>
    </div>
  </div>
</template>

<style scoped></style>
