import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import DeleteModal from "./components/DeleteModal";
import ProfileRegister from "./components/ProfileRegister"; // ← 追加

export default function App() {
  const [session, setSession] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false); // ← 追加

  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

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
  // ③ 天気取得関数 ← ★ここに書くのがベスト
  const fetchWeather = async (city) => {
    const apiKey = "YOUR_API_KEY";
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=ja&units=metric`
    );
    return await res.json();
  };

  const addLog = async () => {
    const uid = session.user.id;

    // 天気取得
    const weatherData = await fetchWeather("Osaka");
    const weather = weatherData.weather[0].description;
    const temp = weatherData.main.temp;

    // Supabase に保存
    const { data, error } = await supabase
      .from("logs")
      .insert([
        {
          title,
          date,
          user_id: uid,
          weather,
          temp,
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

  const confirmDelete = (id: string) => {
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

      {showDeleteModal && (
        <DeleteModal
          onConfirm={deleteLog}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
