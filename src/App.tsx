import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import DeleteModal from "./components/DeleteModal";
import ProfileRegister from "./components/ProfileRegister";
import type { Session } from "@supabase/supabase-js"; //vercel対応

// ログの型定義
type TravelLog = {
  id: number;
  title: string;
  date: string;
  image_url?: string;
  user_id: string;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false); // ← 追加

  const [logs, setLogs] = useState<TravelLog[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const fetchLogs = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", session!.user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLogs(data || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchLogs();
  }, [session]);

  const addLog = async () => {
    const uid = session?.user.id;
    if (!uid) return;
    // デバッグ用ログ
    console.log("addLog called");
    console.log("title:", title);
    console.log("date:", date);
    console.log("session:", session);

    // Supabase に保存
    const { data, error } = await supabase
      .from("logs")
      .insert([
        {
          title,
          date,
          user_id: uid,
        },
      ])
      .select();

    // ★ エラー確認（必須）
    if (error) {
      console.error("INSERT ERROR:", error);
      alert("エラーが発生しました: " + error.message);
      return;
    }

    // ローカル state に反映
    if (data) setLogs([...logs, ...data]);

    // 入力欄クリア
    setTitle("");
    setDate("");
  };

  const confirmDelete = (id: number) => {
    setTargetId(id);
    setShowDeleteModal(true);
  };

  const deleteLog = async () => {
    if (!targetId) return;

    const { error } = await supabase.from("logs").delete().eq("id", targetId);

    if (error) {
      alert("削除に失敗しました: " + error.message);
      return;
    }

    setLogs(logs.filter((log) => log.id !== targetId));
    setShowDeleteModal(false);
    setTargetId(null);
  };
  // 画像アップロード処理
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    logId: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

    // Storage にアップロード
    const { error } = await supabase.storage
      .from("log-images")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from("log-images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // logs テーブルに保存
    await supabase.from("logs").update({ image_url: imageUrl }).eq("id", logId);
    // 画像反映のためにリロード
    window.location.reload();

    // UIを更新
    await fetchLogs();
  };

  // 🔥 ここが重要：ログインしていない場合の画面切り替え
  if (!session) {
    if (showRegisterForm) {
      return <ProfileRegister onComplete={() => setShowRegisterForm(false)} />;
    }

    return <Auth onStartRegister={() => setShowRegisterForm(true)} />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        style={{
          marginBottom: "20px",
          padding: "6px 12px",
          background: "#dddddd46",
          borderRadius: "6px",
        }}
      >
        ログアウト
      </button>

      <h2>旅ログ</h2>

      <div>
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={addLog}>追加</button>
      </div>

      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <p>{log.title}</p>
            <p>{log.date}</p>

            {/* 画像があれば表示 */}
            {log.image_url && (
              <img
                src={`${log.image_url}?t=${Date.now()}`}
                alt="log image"
                style={{ width: "200px", borderRadius: "8px" }}
              />
            )}

            {/* 画像アップロード */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, log.id)}
            />

            <button onClick={() => confirmDelete(log.id)}>削除</button>
          </li>
        ))}
      </ul>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={deleteLog}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
