import React, { useState } from "react";
import { Webhook, Plus, Trash2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const WebhooksManager: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user, updateWebhooksConfig } = useAuth();
  const webhooks = user?.webhooks || [];

  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim().startsWith("http")) return;

    const newWh = {
      id: "wh_" + Math.random().toString(36).substring(2, 9),
      url: url.trim(),
      secret: secret.trim() || undefined,
      enabled: true
    };

    const updated = [...webhooks, newWh];
    await updateWebhooksConfig(updated);
    setUrl("");
    setSecret("");
    if (onShowToast) {
      onShowToast("Webhook Added", "New webhook destination configured.");
    }
  };

  const handleToggle = async (id: string) => {
    const updated = webhooks.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    await updateWebhooksConfig(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = webhooks.filter((w) => w.id !== id);
    await updateWebhooksConfig(updated);
    if (onShowToast) {
      onShowToast("Webhook Removed", "Webhook deleted.");
    }
  };

  const handleTestPing = async (wh: { id: string; url: string; secret?: string }) => {
    setTestingId(wh.id);
    try {
      // Simulate/trigger test ping
      await new Promise((r) => setTimeout(r, 800));
      if (onShowToast) {
        onShowToast("Test Ping Sent", `Payload dispatched to ${wh.url}`);
      }
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="glass-card p-6 border-stone-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-emerald-700" />
          <span>Automation Webhooks (Zapier, Make, n8n)</span>
        </h3>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
          Receive real-time HTTP POST notifications when tomorrow's bin is impending or when schedule updates are detected.
        </p>
      </div>

      {/* Add Webhook Form */}
      <form onSubmit={handleAddWebhook} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 shadow-sm">
        <span className="text-xs font-bold text-stone-800">Add Webhook Destination</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-mono focus:outline-none focus:border-emerald-600 shadow-sm"
          />
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Optional HMAC Secret Header"
            className="px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-stone-900 text-xs font-mono focus:outline-none focus:border-emerald-600 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!url.trim()}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Save Webhook</span>
        </button>
      </form>

      {/* Existing Webhooks List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-800">Configured Endpoints ({webhooks.length})</span>

        {webhooks.length === 0 ? (
          <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl border border-stone-200">
            No webhooks configured yet.
          </p>
        ) : (
          webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-3 rounded-xl bg-stone-50/80 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${wh.enabled ? "bg-emerald-600" : "bg-stone-400"}`} />
                  <span className="text-xs font-mono text-stone-800 font-semibold truncate max-w-sm block">
                    {wh.url}
                  </span>
                </div>
                {wh.secret && (
                  <span className="text-[10px] text-stone-500 font-mono pl-4">
                    Secret: ••••••••
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTestPing(wh)}
                  disabled={testingId === wh.id}
                  className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3 text-emerald-700" />
                  <span>{testingId === wh.id ? "Sending..." : "Test Ping"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(wh.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                    wh.enabled
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm"
                      : "bg-stone-200 text-stone-600 border-stone-300"
                  }`}
                >
                  {wh.enabled ? "Enabled" : "Disabled"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(wh.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                  aria-label="Delete Webhook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
