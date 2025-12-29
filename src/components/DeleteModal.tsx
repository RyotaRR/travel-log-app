import React from "react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteModal({ onConfirm, onCancel }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {/* 上の警告エリア */}
        <div
          style={{
            background: "#ffe5e5",
            padding: "20px",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
          }}
        >
          <p style={{ margin: 0, color: "#b00000", fontWeight: "bold" }}>
            本当に削除しますか？
          </p>
        </div>

        {/* 下のボタンエリア */}
        <div
          style={{
            background: "#fafafa",
            padding: "15px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              background: "red",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px",
            }}
          >
            OK
          </button>

          <button
            onClick={onCancel}
            style={{
              background: "#ddd",
              padding: "6px 12px",
              borderRadius: "4px",
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
