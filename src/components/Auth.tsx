import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) alert(error.message);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) alert(error.message);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) alert(error.message);
  };

  return (
    <div>
      <h2>{mode === "login" ? "ログイン" : "新規登録"}</h2>

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

      {mode === "login" ? (
        <>
          <button onClick={signIn}>ログイン</button>
          <p>
            アカウントがない？{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setMode("signup")}
            >
              新規登録へ
            </span>
          </p>
        </>
      ) : (
        <>
          <button onClick={signUp}>新規登録</button>
          <p>
            すでにアカウントがある？{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setMode("login")}
            >
              ログインへ
            </span>
          </p>
        </>
      )}

      <hr />
      <button onClick={signInWithGoogle}>Googleでログイン</button>
    </div>
  );
}
