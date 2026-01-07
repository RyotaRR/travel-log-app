import { useState } from "react";
import { supabase } from "../supabaseClient";
export default function Auth({ onStartRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) alert(error.message);
  };

  return (
    <div>
      <h2>ログイン</h2>

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

      <button onClick={signIn}>ログイン</button>

      <p>
        アカウントがない？{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={onStartRegister}
        >
          新規登録へ
        </span>
      </p>
    </div>
  );
}
