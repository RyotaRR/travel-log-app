import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Log = {
  id: number;
  title: string;
  date: string;
};

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  // 初回ロード時にデータ取得だお
  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("id");
      if (error) console.error(error);
      if (data) setLogs(data);
    };
    fetchLogs();
  }, []);

  // 追加
  const addLog = async () => {
    if (!title || !date) return;
    const { data, error } = await supabase
      .from("logs")
      .insert([{ title, date }])
      .select();
    if (error) {
      console.error("Insert error:", error.message);
      alert("追加に失敗しました: " + error.message);
      return;
    }
    if (data) setLogs([...logs, ...data]);
    setTitle("");
    setDate("");
  };

  // 削除
  const deleteLog = async (id: number) => {
    const { error } = await supabase.from("logs").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setLogs(logs.filter((log) => log.id !== id));
  };

  // 編集開始
  const startEdit = (log: Log) => {
    setEditingId(log.id);
    setEditTitle(log.title);
    setEditDate(log.date);
  };

  // 編集保存
  const saveEdit = async (id: number) => {
    const { error } = await supabase
      .from("logs")
      .update({ title: editTitle, date: editDate })
      .eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setLogs(
      logs.map((log) =>
        log.id === id ? { ...log, title: editTitle, date: editDate } : log
      )
    );
    setEditingId(null);
    setEditTitle("");
    setEditDate("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>旅ログアプリ</h1>

      <div style={{ marginBottom: "1rem" }}>
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
            {editingId === log.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
                <button onClick={() => saveEdit(log.id)}>保存</button>
              </>
            ) : (
              <>
                <strong>{log.title}</strong> - {log.date}
                <button onClick={() => startEdit(log)}>編集</button>
                <button onClick={() => deleteLog(log.id)}>削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
