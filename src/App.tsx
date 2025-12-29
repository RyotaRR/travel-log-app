import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";

type Log = {
  id: number;
  title: string;
  date: string;
  user_id: string;
};

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [session, setSession] = useState<any>(null);

  // ログイン状態を監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // ログインしているユーザーのログだけ取得
  useEffect(() => {
    if (!session) return;

    const fetchLogs = async () => {
      const uid = session.user.id;

      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", uid)
        .order("id");

      if (data) setLogs(data);
    };

    fetchLogs();
  }, [session]);

  // 追加
  const addLog = async () => {
    const uid = session.user.id;

    const { data, error } = await supabase
      .from("logs")
      .insert([{ title, date, user_id: uid }])
      .select();

    if (data) setLogs([...logs, ...data]);
    setTitle("");
    setDate("");
  };

  // 削除
  const deleteLog = async (id: number) => {
    await supabase.from("logs").delete().eq("id", id);
    setLogs(logs.filter((log) => log.id !== id));
  };

  // ログアウト
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return <Auth />;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>旅ログアプリ</h1>
      <button onClick={signOut}>ログアウト</button>

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
            {log.title} - {log.date}
            <button onClick={() => deleteLog(log.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
