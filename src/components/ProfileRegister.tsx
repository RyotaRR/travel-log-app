import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProfileRegister({ onComplete }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("ユーザー作成に失敗しました");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      address,
      phone,
      gender,
    });

    if (profileError) {
      alert("プロフィール保存エラー: " + profileError.message);
      return;
    }

    alert("登録が完了しました！");
    onComplete(); // ← Auth画面へ戻る
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>新規登録</h2>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="text"
        placeholder="住所"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        type="text"
        placeholder="電話番号"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">性別を選択</option>
        <option value="male">男性</option>
        <option value="female">女性</option>
        <option value="other">その他</option>
      </select>

      <div style={{ marginTop: "10px" }}>
        <button onClick={register}>登録</button>

        {/* ← 追加：戻るボタン */}
        <button
          onClick={onComplete}
          style={{ marginLeft: "10px", background: "#ddd" }}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
