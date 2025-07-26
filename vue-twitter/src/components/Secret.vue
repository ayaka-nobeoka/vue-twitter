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
  <div
    class="max-w-xl mx-auto p-6 bg-gray-900 text-gray-100 rounded-lg shadow-lg mt-10"
  >
    <!-- ナビゲーション -->
    <router-link
      to="/login"
      class="text-blue-300 underline mb-4 block hover:text-blue-400"
    >
      ログインページへ戻る
    </router-link>

    <!-- タイトル -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-center text-blue-200 mb-4">
        こっちは秘密掲示板🌙
      </h1>

      <!-- 検索欄 -->
      <label class="block font-semibold text-sm text-gray-300 mb-1"
        >🔍 検索</label
      >
      <input
        v-model="searchKeyword"
        class="w-full bg-gray-800 border border-gray-600 text-gray-100 p-2 rounded"
        type="text"
        placeholder="名前やコメントを検索"
      />
    </div>

    <!-- 新規投稿フォーム -->
    <div class="bg-gray-800 p-4 border border-gray-700 rounded mb-6">
      <h2
        class="text-lg font-bold text-blue-200 border-b border-gray-600 pb-1 mb-3"
      >
        📩 新規投稿
      </h2>

      <label class="block text-sm font-bold text-gray-300 mb-1">名前</label>
      <input
        v-model="name"
        class="w-full bg-gray-900 border border-gray-600 text-gray-100 p-1 mb-2 rounded"
        type="text"
      />

      <label class="block text-sm font-bold text-gray-300 mb-1">コメント</label>
      <textarea
        v-model="comment"
        class="w-full bg-gray-900 border border-gray-600 text-gray-100 p-1 mb-2 rounded"
        rows="3"
      ></textarea>

      <p v-if="errorMessage" class="text-red-400 text-sm mb-2">
        {{ errorMessage }}
      </p>

      <button
        @click="submitPosts"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
      >
        投稿する
      </button>
    </div>

    <!-- 投稿一覧 -->
    <div class="bg-gray-800 p-4 border border-gray-700 rounded">
      <h2
        class="text-lg font-bold text-blue-200 border-b border-gray-600 pb-1 mb-3"
      >
        📜 投稿一覧
      </h2>

      <ul class="space-y-3">
        <li
          v-for="item in filteredPosts"
          :key="item.id"
          class="bg-gray-900 border border-gray-700 p-3 rounded text-sm"
        >
          <p><strong class="text-blue-300">名前：</strong>{{ item.name }}</p>
          <p>
            <strong class="text-blue-300">コメント：</strong>{{ item.comment }}
          </p>
          <p class="text-xs text-gray-400">
            投稿日時：{{ formatDate(item.createdAt) }}
          </p>

          <!-- いいねボタン -->
          <button
            @click="likePost(item.id, item.likeCount ?? 0)"
            class="bg-gray-700 hover:bg-gray-600 text-pink-300 text-xs px-2 py-1 rounded mr-2"
          >
            ❤️ {{ item.likeCount ?? 0 }}
          </button>

          <!-- 削除ボタン -->
          <button
            @click="deletePost(item.id)"
            class="text-red-400 text-xs border border-red-400 px-2 py-1 rounded hover:bg-red-900"
          >
            🗑 削除
          </button>

          <!-- 返信フォーム -->
          <div class="mt-3">
            <textarea
              v-model="replyText[item.id]"
              placeholder="返信を書く"
              class="w-full bg-gray-900 border border-gray-600 text-gray-100 p-1 rounded text-xs mb-2"
              rows="2"
            ></textarea>
            <button
              @click="submitReply(item.id)"
              class="bg-gray-700 hover:bg-gray-600 text-blue-300 px-2 py-1 text-xs rounded"
            >
              返信する
            </button>
          </div>

          <!-- 返信一覧 -->
          <ul
            v-if="item.replies"
            class="mt-2 pl-4 border-l-2 border-gray-600 text-xs space-y-1"
          >
            <li
              v-for="(reply, replyId) in item.replies"
              :key="replyId"
              class="text-gray-300"
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
