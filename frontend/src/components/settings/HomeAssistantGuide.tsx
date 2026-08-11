import React, { useState } from "react";
import { Cpu, Copy, Check, Terminal, Code2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const HomeAssistantGuide: React.FC<{ onShowToast?: (title: string, message: string) => void }> = ({ onShowToast }) => {
  const { user } = useAuth();
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const apiToken = user?.tokens?.apiToken || "demo-api-token";
  const origin = window.location.origin;
  const endpointUrl = `${origin}/api/schedule?token=${apiToken}`;

  const sampleYaml = `# Home Assistant configuration.yaml
sensor:
  - platform: rest
    name: "Next Bin Collection"
    resource: "${endpointUrl}"
    value_template: "{{ value_json.next_collection.display_name }}"
    json_attributes_path: "$.next_collection"
    json_attributes:
      - date
      - days_until
      - color
      - raw_type
    scan_interval: 21600 # Update every 6 hours`;

  const sampleCurl = `curl -X GET "${endpointUrl}"`;

  const handleCopy = (text: string, type: "yaml" | "curl") => {
    navigator.clipboard.writeText(text);
    if (type === "yaml") {
      setCopiedYaml(true);
      setTimeout(() => setCopiedYaml(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
    if (onShowToast) {
      onShowToast("Copied to Clipboard", "Code snippet copied.");
    }
  };

  return (
    <div className="glass-card p-6 border-slate-800 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>Home Assistant & Smart Home JSON API</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Poll your personalized JSON endpoint to power e-ink dashboards, Home Assistant Lovelace cards, and LED notification lights.
        </p>
      </div>

      {/* API Endpoint Box */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Personal JSON API Endpoint
        </label>
        <input
          type="text"
          readOnly
          value={endpointUrl}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sky-400 font-mono text-xs select-all focus:outline-none"
        />
      </div>

      {/* YAML Configuration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Home Assistant YAML Configuration</span>
          </span>
          <button
            onClick={() => handleCopy(sampleYaml, "yaml")}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
          >
            {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedYaml ? "Copied" : "Copy YAML"}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {sampleYaml}
        </pre>
      </div>

      {/* cURL Test Command */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>cURL Command</span>
          </span>
          <button
            onClick={() => handleCopy(sampleCurl, "curl")}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
          {sampleCurl}
        </pre>
      </div>
    </div>
  );
};
