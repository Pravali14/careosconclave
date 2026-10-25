import React from 'react';
import {
  Sparkles,
  Activity,
  Calendar,
  FlaskConical,
  CreditCard,
  Building2,
  PhoneCall,
  CheckCircle2,
  Cpu,
  Shield,
  Layers,
  Zap,
} from 'lucide-react';
import { useCareOS } from '../../services/store';

export const MultiAgentNetwork: React.FC = () => {
  const { agentLogs } = useCareOS();

  const AGENTS = [
    {
      name: 'Queue Predictor Agent',
      icon: Activity,
      desc: 'Predicts waiting times dynamically, balances multi-doctor queues, and detects consultation bottlenecks.',
      status: 'Active · Polling',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 12ms latency',
    },
    {
      name: 'Scheduling Agent',
      icon: Calendar,
      desc: 'Enforces schedule integrity, detects double-booking conflicts, and proposes dynamic buffer slots.',
      status: 'Active · Enforcing',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 18ms latency',
    },
    {
      name: 'Voice Agent (CareVoice)',
      icon: PhoneCall,
      desc: 'Coordinates conversational patient inquiries with authorized tool execution via Gemini AI (Telugu/English).',
      status: 'Active · Listening',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 25ms latency',
    },
    {
      name: 'Diagnostics & Triage Agent',
      icon: FlaskConical,
      desc: 'Monitors radiology and laboratory turnarounds; alerts clinicians instantly upon panic/STAT report release.',
      status: 'Active · Routing',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 15ms latency',
    },
    {
      name: 'Billing & Ledger Agent',
      icon: CreditCard,
      desc: 'Captures and aggregates itemized charges across visits, radiology, and labs idempotently without leakage.',
      status: 'Active · Auditing',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 14ms latency',
    },
    {
      name: 'Operations & Bed Agent',
      icon: Building2,
      desc: 'Monitors hospital-wide bed occupancy, nursing tasks, and propagates doctor delay notices to reception.',
      status: 'Active · Orchestrating',
      color: 'text-[#0F9D8A] border-[#0F9D8A]/30 bg-[#E8F7F3]',
      tools: '4 Tools · 16ms latency',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-[#0F9D8A]" />
            <h2 className="text-lg font-bold text-[#243746] tracking-tight">
              CareOS Multi-Agent Intelligence Topology
            </h2>
          </div>
          <p className="text-xs text-[#536B7E]">
            Event-driven cooperative agents communicating through validated application APIs and strict RBAC boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-md bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30 font-semibold font-mono">
            6 Specialized Agents Online · Zero Hallucination
          </span>
        </div>
      </div>

      {/* Agents Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.name}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${agent.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#243746] text-sm">{agent.name}</h3>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-[#536B7E] leading-relaxed">{agent.desc}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#0F9D8A] font-mono">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {agent.tools}
                </span>
                <span className="text-emerald-700 font-semibold">100% SLA</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Action Stream */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <h3 className="font-bold text-[#243746] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0F9D8A]" />
            Autonomous Agent Action Stream ({agentLogs.length} Events)
          </h3>
          <span className="text-[#536B7E] font-mono">Zero Hallucination Protocol</span>
        </div>

        <div className="space-y-2.5">
          {agentLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#F8FCFB] rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F9D8A]">{log.agentName}</span>
                  <span className="text-[10px] text-[#536B7E] font-mono">[{log.timestamp}]</span>
                </div>
                <p className="text-[#243746] text-[11px] font-medium">{log.action}</p>
                <span className="text-[#536B7E] text-[10px] block">{log.impact}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30 shrink-0 self-start sm:self-auto">
                {log.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
