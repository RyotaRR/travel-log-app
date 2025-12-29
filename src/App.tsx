import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import DeleteModal from "./components/DeleteModal";

export default function App() {
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  // モーダル用
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  // セッション取得
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ログ取得
  useEffect(() => {
    if (!session) return;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setLogs(data || []);
    };

    fetchLogs();
  }, [session]);

  // ログ追加
  const addLog = async () => {
    const uid = session.user.id;

    const { data, error } = await supabase
      .from("logs")
      .insert([{ title, date, user_id: uid }])
      .select();

    if (error) {
      alert("INSERT エラー: " + error.message);
      return;
    }

    if (data) setLogs([...logs, ...data]);
    setTitle("");
    setDate("");
  };

  // 削除ボタン押したとき
  const confirmDelete = (id: string) => {
    setTargetId(id);
    setShowDeleteModal(true);
  };

  // 実際に削除
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

  // ログインしていない時は Auth 画面
  if (!session) return <Auth />;

  return (
    <div style={{ padding: "20px" }}>
      {/* ログアウトボタン */}
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

      {/* 追加フォーム */}
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

      {/* ログ一覧 */}
      <ul>
        {logs.map((log) => (
          <li key={log.id} style={{ marginTop: "10px" }}>
            {log.date} - {log.title}
            <button
              style={{ marginLeft: "10px", color: "red" }}
              onClick={() => confirmDelete(log.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={deleteLog}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
