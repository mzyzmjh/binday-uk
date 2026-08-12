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
    <div className="glass-card p-6 border-stone-200 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-700" />
          <span>Home Assistant & Smart Home JSON API</span>
        </h3>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
          Poll your personalized JSON endpoint to power e-ink dashboards, Home Assistant Lovelace cards, and LED notification lights.
        </p>
      </div>

      {/* API Endpoint Box */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 shadow-sm">
        <label className="block text-xs font-bold text-stone-800">
          Personal JSON API Endpoint
        </label>
        <input
          type="text"
          readOnly
          value={endpointUrl}
          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sky-800 font-mono text-xs select-all focus:outline-none font-semibold shadow-sm"
        />
      </div>

      {/* YAML Configuration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-700" />
            <span>Home Assistant YAML Configuration</span>
          </span>
          <button
            onClick={() => handleCopy(sampleYaml, "yaml")}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
          >
            {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedYaml ? "Copied" : "Copy YAML"}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-200 overflow-x-auto leading-relaxed shadow-sm">
          {sampleYaml}
        </pre>
      </div>

      {/* cURL Test Command */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-700" />
            <span>cURL Command</span>
          </span>
          <button
            onClick={() => handleCopy(sampleCurl, "curl")}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-sm">
          {sampleCurl}
        </pre>
      </div>
    </div>
  );
};
