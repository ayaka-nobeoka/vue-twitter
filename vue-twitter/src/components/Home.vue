<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const name = ref("");
const comment = ref("");
const post = ref([]);
const searchKeyword = ref("");
const errorMessage = ref("");
const replyText = ref({}); // 投稿ごとにテキストを保存

async function fetchPosts() {
  try {
    const response = await axios.get(
      "https://vue-test-480e1-default-rtdb.firebaseio.com/posts.json"
    );
    post.value = Object.entries(response.data)
      .map(([id, data]) => ({
        id,
        likeCount: data.likeCount ?? 0, // ← ここで未定義を補正！
        ...data,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("取得エラー:", error);
  }
}

async function submitPosts() {
  // 🛑 入力チェック
  if (!name.value.trim() || !comment.value.trim()) {
    errorMessage.value = "※名前とコメントは両方必須です";
    return;
  }

  // 🧹 エラーがなければクリアして投稿続行
  errorMessage.value = "";

  await axios.post(
    "https://vue-test-480e1-default-rtdb.firebaseio.com/posts.json",
    {
      name: name.value,
      comment: comment.value,
      createdAt: new Date().toISOString(),
      likeCount: 0, // ←いいねの数を増やせる！
      replies: {}, //返信してもらうもののデータを入れる空の箱！
    }
  );

  name.value = "";
  comment.value = "";
  await fetchPosts();
}

//返信する時の関数
async function submitReply(postId) {
  const text = replyText.value[postId];
  if (!text || !text.trim()) return;

  await axios.post(
    `https://vue-test-480e1-default-rtdb.firebaseio.com/posts/${postId}/replies.json`,
    {
      name: name.value,
      comment: text,
      createdAt: new Date().toISOString(),
    }
  );

  replyText.value[postId] = ""; // フォームクリア
  await fetchPosts(); // 再取得
}

function formatDate(datetime) {
  return new Date(datetime).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  fetchPosts(); // ✅ ここを忘れずに！
});
async function deletePost(id) {
  try {
    await axios.delete(
      `https://vue-test-480e1-default-rtdb.firebaseio.com/posts/${id}.json`
    );
    await fetchPosts(); // 更新
  } catch (error) {
    console.error("削除エラー:", error);
  }
}

const filteredPosts = computed(() =>
  post.value.filter((item) => {
    const keyword = searchKeyword.value.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.comment?.toLowerCase().includes(keyword)
    );
  })
);
async function likePost(id, currentCount) {
  try {
    await axios.patch(
      `https://vue-test-480e1-default-rtdb.firebaseio.com/posts/${id}.json`,
      {
        likeCount: currentCount + 1,
      }
    );
    await fetchPosts(); // ← 更新
  } catch (error) {
    console.error("いいね失敗:", error);
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
    <router-link to="/login" class="text-purple-700 underline mb-4 block">
      ログインページへ
    </router-link>
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-4">掲示板</h1>

      <label class="block font-semibold mb-1">🔍検索</label>
      <input
        v-model="searchKeyword"
        class="w-full border border-gray-300 p-2 rounded"
        type="text"
        placeholder="名前 or コメント"
      />
    </div>
    <div class="bg-white p-4 border border-gray-400 mb-6">
      <h2 class="text-lg font-bold text-blue-800 border-b pb-1 mb-2">
        📩 新規投稿
      </h2>

      <label class="block text-sm font-bold mb-1">名前</label>
      <input
        v-model="name"
        class="w-full border border-gray-400 p-1 text-sm mb-2"
        type="text"
      />

      <label class="block text-sm font-bold mb-1">コメント</label>
      <textarea
        v-model="comment"
        class="w-full border border-gray-400 p-1 text-sm mb-2"
        rows="3"
      ></textarea>
      <p v-if="errorMessage" class="text-red-600 text-sm mb-2">
        {{ errorMessage }}
      </p>
      <button
        @click="submitPosts"
        class="bg-gray-200 hover:bg-gray-300 text-black px-4 py-1 border border-gray-500 text-sm"
      >
        投稿する
      </button>
    </div>

    <div class="bg-white p-4 border border-gray-400">
      <h2 class="text-lg font-bold text-blue-800 border-b pb-1 mb-2">
        📜 投稿一覧
      </h2>
      <ul class="space-y-2 mt-2">
        <li
          v-for="item in filteredPosts"
          :key="item.id"
          class="bg-gray-100 border p-2 rounded text-sm"
        >
          <p><strong>名前：</strong>{{ item.name }}</p>
          <p><strong>コメント：</strong>{{ item.comment }}</p>
          <p class="text-xs text-gray-500">
            投稿日時：{{ formatDate(item.createdAt) }}
          </p>
          <!-- いいねボタン -->
          <button
            @click="likePost(item.id, item.likeCount ?? 0)"
            class="bg-pink-50 text-pink-600 text-xs border border-pink-300 px-2 py-1 rounded hover:bg-pink-100 mr-2"
          >
            ❤️ {{ item.likeCount ?? 0 }}
          </button>
          <button
            @click="deletePost(item.id)"
            class="mt-2 text-red-600 text-xs border border-red-400 px-2 py-1 rounded hover:bg-red-100 transition"
          >
            🗑 削除
          </button>
          <!-- 📝返信フォーム -->
          <div class="mt-2">
            <textarea
              v-model="replyText[item.id]"
              placeholder="返信を入力"
              class="w-full border border-gray-300 rounded p-1 text-xs mb-1"
              rows="2"
            ></textarea>
            <button
              @click="submitReply(item.id)"
              class="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded hover:bg-blue-200"
            >
              返信する
            </button>
          </div>

          <!-- 💬返信一覧 -->
          <ul
            v-if="item.replies"
            class="mt-2 pl-4 border-l-2 border-gray-300 text-xs space-y-1"
          >
            <li
              v-for="(reply, replyId) in item.replies"
              :key="replyId"
              class="text-gray-700"
            >
              💬 <strong>{{ reply.name }}</strong
              >：{{ reply.comment }}
            </li>
          </ul>
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
