"use client";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import SearchInput from "../components/SearchInput";
import ActionMenu from "../components/ActionMenu";
import EmptyState from "../components/EmptyState";
import Icon from "../../components/Icon";

const mockPaymentProviders = [
  { id: 'prov_stripe', name: 'Stripe', icon: 'credit_card', enabled: true, mode: 'live', currency: 'USD', payment_types: ['one-time', 'subscription', 'credits'], processing_fee: 2.9, fixed_fee: 0.30, configured: true, last_updated: '2026-06-15T10:00:00Z', config: { publishable_key: 'pk_live_****9f3a', secret_key: 'sk_live_****3b7k', webhook_signing_secret: 'whsec_****2d8f', price_id_creator_monthly: 'price_creator_monthly_001', price_id_pro_monthly: 'price_pro_monthly_001', price_id_agency_monthly: 'price_agency_monthly_001', success_url: '/pay/success', cancel_url: '/pay/cancel', webhook_endpoint_url: '/api/webhooks/stripe', allow_subscriptions: true, allow_one_time_credit_purchase: true } },
  { id: 'prov_paypal', name: 'PayPal', icon: 'currency_bitcoin', enabled: true, mode: 'sandbox', currency: 'USD', payment_types: ['one-time', 'subscription'], processing_fee: 3.5, fixed_fee: 0.49, configured: true, last_updated: '2026-06-14T08:00:00Z', config: { client_id: 'AYP****3f9a', client_secret: 'EPh****8k2m', webhook_id: 'WH-****9d3a', webhook_endpoint_url: '/api/webhooks/paypal', success_url: '/pay/success', cancel_url: '/pay/cancel', merchant_email: 'merchant@viralstudio.ai', allow_subscriptions: true, allow_one_time_credit_purchase: false } },
  { id: 'prov_youcanpay', name: 'YouCan Pay', icon: 'globe', enabled: false, mode: 'sandbox', currency: 'MAD', payment_types: ['one-time'], processing_fee: 2.5, fixed_fee: 2.00, configured: false, last_updated: '2026-06-10T12:00:00Z', config: { public_key: 'pk_****7b2k', private_key: 'sk_****9f4a', webhook_secret: 'whsec_****3d8f', webhook_endpoint_url: '/api/webhooks/youcanpay', success_url: '/pay/success', cancel_url: '/pay/cancel', merchant_id_or_account_id: 'merchant_001', allow_one_time_credit_purchase: true, allow_subscriptions: false } },
  { id: 'prov_youcanstore', name: 'YouCan Store API', icon: 'business', enabled: false, mode: 'development', currency: 'MAD', payment_types: ['one-time', 'credits'], processing_fee: 0, fixed_fee: 0, configured: false, last_updated: '2026-06-05T09:00:00Z', config: { client_id: 'yc_****3f9a', client_secret: 'ycs_****8k2m', access_token: 'yca_****9d3a', refresh_token: 'ycr_****4b7k', store_id: 'store_001', store_domain: 'mystore.youcan.shop', webhook_secret: 'whsec_****2d8f', orders_webhook_url: '/api/webhooks/youcan', products_sync: false, payments_sync: false } },
];

const mockCreditPackages = [
  { id: 'pkg_001', name: 'Starter', credits: 100, bonus_credits: 0, price: 9, currency: 'USD', active: true, allowed_payment_methods: ['stripe', 'paypal'], display_order: 1 },
  { id: 'pkg_002', name: 'Creator', credits: 500, bonus_credits: 25, price: 29, currency: 'USD', active: true, allowed_payment_methods: ['stripe', 'paypal'], display_order: 2 },
  { id: 'pkg_003', name: 'Pro', credits: 1200, bonus_credits: 60, price: 59, currency: 'USD', active: true, allowed_payment_methods: ['stripe', 'paypal', 'youcanpay'], display_order: 3 },
  { id: 'pkg_004', name: 'Agency', credits: 3000, bonus_credits: 150, price: 129, currency: 'USD', active: true, allowed_payment_methods: ['stripe', 'paypal', 'youcanpay'], display_order: 4 },
];

const mockPlanMappings = [
  { id: 'map_001', plan_id: 'plan_free', plan_name: 'Free', stripe_price_id: '', paypal_plan_id: '', youcanpay_plan_id: '', monthly_price: 0, yearly_price: 0, credits_included: 100, active: true },
  { id: 'map_002', plan_id: 'plan_creator', plan_name: 'Creator', stripe_price_id: 'price_creator_monthly_001', paypal_plan_id: 'P-0T79W70L2P8970423M7DKMLI', youcanpay_plan_id: '', monthly_price: 29, yearly_price: 290, credits_included: 1000, active: true },
  { id: 'map_003', plan_id: 'plan_pro', plan_name: 'Pro', stripe_price_id: 'price_pro_monthly_001', paypal_plan_id: 'P-3WU23450LP6970427M7DJPLI', youcanpay_plan_id: '', monthly_price: 79, yearly_price: 790, credits_included: 5000, active: true },
  { id: 'map_004', plan_id: 'plan_agency', plan_name: 'Agency', stripe_price_id: 'price_agency_monthly_001', paypal_plan_id: 'P-7J459234KP6970427M7DKLMI', youcanpay_plan_id: '', monthly_price: 199, yearly_price: 1990, credits_included: 20000, active: true },
];

const mockWebhookEndpoints = [
  { id: 'wh_001', provider: 'Stripe', endpoint: '/api/webhooks/stripe', status: 'active', last_event: '2026-06-20T14:30:00Z', last_error: null },
  { id: 'wh_002', provider: 'PayPal', endpoint: '/api/webhooks/paypal', status: 'active', last_event: '2026-06-20T12:00:00Z', last_error: null },
  { id: 'wh_003', provider: 'YouCan Pay', endpoint: '/api/webhooks/youcanpay', status: 'inactive', last_event: null, last_error: 'Not configured' },
  { id: 'wh_004', provider: 'YouCan Store', endpoint: '/api/webhooks/youcan', status: 'inactive', last_event: null, last_error: 'Not configured' },
];

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function maskValue(val) {
  if (!val || val.length < 8) return val || "—";
  return val.substring(0, 4) + "****" + val.substring(val.length - 4);
}

export default function PaymentMethodsPage() {
  const [activeSection, setActiveSection] = useState("providers");
  const [providers, setProviders] = useState(mockPaymentProviders);
  const [creditPackages, setCreditPackages] = useState(mockCreditPackages);
  const [planMappings, setPlanMappings] = useState(mockPlanMappings);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerModalTab, setProviderModalTab] = useState("general");
  const [showProviderSelect, setShowProviderSelect] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingMapping, setEditingMapping] = useState(null);
  const [confirmDisable, setConfirmDisable] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    default_currency: "USD",
    minimum_credit_purchase: 10,
    tax_enabled: false,
    invoice_enabled: true,
    auto_add_credits_after_payment: true,
    auto_change_plan_after_subscription_payment: true,
    failed_payment_action: "keep_plan",
    refund_policy_text: "All sales are final. Refunds are issued at the discretion of ViralStudio AI for technical issues resulting in service failure.",
    payment_success_redirect_url: "/pay/success",
    payment_failed_redirect_url: "/pay/failed",
  });
  const [newPackage, setNewPackage] = useState({
    name: "", credits: 100, bonus_credits: 0, price: 9, currency: "USD", active: true, allowed_payment_methods: ["stripe"], display_order: 1,
  });

  const sections = [
    { id: "providers", label: "Providers", icon: "credit_card" },
    { id: "general", label: "General Settings", icon: "settings" },
    { id: "packages", label: "Credit Packages", icon: "gift" },
    { id: "mappings", label: "Plan Mappings", icon: "checklist" },
    { id: "webhooks", label: "Webhooks", icon: "webhook" },
  ];

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      showToast("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => showToast("Failed to copy"));
  }

  function toggleProvider(id) {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    const p = providers.find(x => x.id === id);
    showToast(`${p?.name || "Provider"} ${p?.enabled ? "disabled" : "enabled"} successfully`);
    setConfirmDisable(null);
  }

  function deleteProvider(id) {
    setProviders(prev => prev.filter(p => p.id !== id));
    showToast("Provider removed");
    setConfirmDelete(null);
  }

  function saveProviderConfig() {
    setProviders(prev => prev.map(p => p.id === editingProvider.id ? { ...p, ...editingProvider, last_updated: new Date().toISOString() } : p));
    showToast(`${editingProvider.name} configuration saved`);
    setEditingProvider(null);
  }

  function savePackage() {
    if (editingPackage) {
      setCreditPackages(prev => prev.map(p => p.id === editingPackage.id ? editingPackage : p));
      showToast(`Package "${editingPackage.name}" updated`);
    } else {
      const pkg = { ...newPackage, id: 'pkg_' + Date.now() };
      setCreditPackages(prev => [...prev, pkg]);
      showToast(`Package "${newPackage.name}" added`);
    }
    setEditingPackage(null);
    setShowAddPackage(false);
  }

  function saveMapping() {
    setPlanMappings(prev => prev.map(m => m.id === editingMapping.id ? editingMapping : m));
    showToast(`Mapping for ${editingMapping.plan_name} saved`);
    setEditingMapping(null);
  }

  function saveGeneralSettings() {
    showToast("General payment settings saved");
  }

  function testConnection(providerName) {
    showToast(`Testing connection to ${providerName}...`);
    setTimeout(() => showToast(`${providerName} connection successful`), 1500);
  }

  function testWebhook(providerName) {
    showToast(`Sending test webhook to ${providerName}...`);
  }

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Payment Methods"
        subtitle="Manage payment providers, credit packages, and subscription mappings"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Payment Methods" }]}
        actions={[
          { label: "View Logs", icon: "history", onClick: () => window.location.href = "/admin/payment-logs" },
          { label: "Add Payment Method", icon: "add", variant: "primary", onClick: () => setShowProviderSelect(true) },
        ]}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-surface-container-high border border-surface-border rounded-xl px-4 py-3 shadow-2xl animate-dropdown-open flex items-center gap-2.5">
          <Icon name="check_circle" className="text-green-400" size={16} />
          <span className="text-xs text-white font-medium">{toast}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-surface-container-low border border-surface-border/50 rounded-lg p-0.5 overflow-x-auto hide-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${
              activeSection === s.id
                ? "primary-gradient text-white"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            <Icon name={s.icon} size={12} />
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "providers" && (
        <>
          <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <Icon name="error" className="text-error shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-error font-medium">Never expose secret keys in frontend. Use environment variables or encrypted server-side storage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {providers.map((p) => (
              <div key={p.id} className="glass-card rounded-xl p-4 card-glow glass-card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.configured ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                    <Icon name={p.icon} className={p.configured ? "text-green-400" : "text-yellow-400"} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{p.name}</p>
                    <p className="text-[9px] text-on-surface-variant">{p.configured ? "Configured" : "Missing keys"}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${p.enabled ? "bg-green-400" : "bg-on-surface-variant"}`} />
                </div>
                <div className="flex items-center justify-between text-[9px] text-on-surface-variant">
                  <span className={`px-2 py-0.5 rounded-full border ${p.mode === "live" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                    {p.mode}
                  </span>
                  <span>{formatDate(p.last_updated)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden card-glow">
            <div className="flex items-center justify-between p-4 border-b border-surface-border/50">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Icon name="credit_card" className="text-primary" size={14} />
                Provider Configuration
              </h3>
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search providers..." className="w-56" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-border/30">
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Provider</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Mode</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Currency</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Payment Types</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Fee</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Configured</th>
                    <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Updated</th>
                    <th className="text-right px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8">
                        <EmptyState icon="credit_card" title="No providers found" description="Try adjusting your search or add a new payment method." />
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map((p) => (
                      <tr key={p.id} className="border-b border-surface-border/20 hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-surface-border/50 flex items-center justify-center">
                              <Icon name={p.icon} className="text-primary" size={15} />
                            </div>
                            <span className="font-medium text-white">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={p.enabled ? "active" : "inactive"} /></td>
                        <td className="px-4 py-3"><span className="text-white capitalize">{p.mode}</span></td>
                        <td className="px-4 py-3"><span className="text-on-surface-variant">{p.currency}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {p.payment_types.map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-container-high border border-surface-border/30 text-on-surface-variant">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {p.processing_fee}%{p.fixed_fee > 0 && ` + $${p.fixed_fee.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={p.configured ? "completed" : "incomplete"} /></td>
                        <td className="px-4 py-3 text-on-surface-variant text-[9px]">{formatDate(p.last_updated)}</td>
                        <td className="px-4 py-3 text-right">
                          <ActionMenu
                            items={[
                              { label: "Configure", icon: "settings", onClick: () => { setEditingProvider({ ...p }); setProviderModalTab("general"); } },
                              { label: "Test Connection", icon: "bolt", onClick: () => testConnection(p.name) },
                              { label: p.enabled ? "Disable" : "Enable", icon: p.enabled ? "close" : "check", onClick: () => setConfirmDisable(p) },
                              { label: "Edit", icon: "edit", onClick: () => { setEditingProvider({ ...p }); setProviderModalTab("general"); } },
                              { label: "Delete", icon: "delete", variant: "danger", onClick: () => setConfirmDelete(p) },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 card-glow">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="info" className="text-secondary" size={14} />
              <h3 className="text-xs font-semibold text-white">Need another provider?</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">ViralStudio AI supports custom payment integrations. Contact the development team to add new payment gateways.</p>
            <button className="btn-subtle px-3 py-1.5 rounded-lg text-[10px] font-medium text-on-surface-variant">Request Integration</button>
          </div>
        </>
      )}

      {activeSection === "general" && (
        <div className="glass-card rounded-2xl overflow-hidden card-glow">
          <div className="p-4 border-b border-surface-border/50">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Icon name="settings" className="text-primary" size={14} />
              General Payment Settings
            </h3>
          </div>
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Default Currency</label>
                <select
                  value={generalSettings.default_currency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, default_currency: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MAD">MAD (د.م.)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Minimum Credit Purchase</label>
                <input
                  type="number"
                  value={generalSettings.minimum_credit_purchase}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, minimum_credit_purchase: Number(e.target.value) })}
                  className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Failed Payment Action</label>
                <select
                  value={generalSettings.failed_payment_action}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, failed_payment_action: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="keep_plan">Keep Plan</option>
                  <option value="downgrade">Downgrade</option>
                  <option value="suspend">Suspend</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setGeneralSettings({ ...generalSettings, tax_enabled: !generalSettings.tax_enabled })}
                    className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${generalSettings.tax_enabled ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${generalSettings.tax_enabled ? "ml-[18px]" : "ml-[3px]"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white">Enable Tax</span>
                    <p className="text-[9px] text-on-surface-variant">Apply taxes to payments</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setGeneralSettings({ ...generalSettings, invoice_enabled: !generalSettings.invoice_enabled })}
                    className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${generalSettings.invoice_enabled ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${generalSettings.invoice_enabled ? "ml-[18px]" : "ml-[3px]"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white">Enable Invoices</span>
                    <p className="text-[9px] text-on-surface-variant">Generate invoices for each payment</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setGeneralSettings({ ...generalSettings, auto_add_credits_after_payment: !generalSettings.auto_add_credits_after_payment })}
                    className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${generalSettings.auto_add_credits_after_payment ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${generalSettings.auto_add_credits_after_payment ? "ml-[18px]" : "ml-[3px]"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white">Auto-Add Credits</span>
                    <p className="text-[9px] text-on-surface-variant">Add credits immediately after payment</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setGeneralSettings({ ...generalSettings, auto_change_plan_after_subscription_payment: !generalSettings.auto_change_plan_after_subscription_payment })}
                    className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${generalSettings.auto_change_plan_after_subscription_payment ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${generalSettings.auto_change_plan_after_subscription_payment ? "ml-[18px]" : "ml-[3px]"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white">Auto-Change Plan</span>
                    <p className="text-[9px] text-on-surface-variant">Upgrade plan after subscription payment</p>
                  </div>
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Payment Success Redirect URL</label>
                  <input
                    type="text"
                    value={generalSettings.payment_success_redirect_url}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, payment_success_redirect_url: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Payment Failed Redirect URL</label>
                  <input
                    type="text"
                    value={generalSettings.payment_failed_redirect_url}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, payment_failed_redirect_url: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Refund Policy Text</label>
              <textarea
                rows={3}
                value={generalSettings.refund_policy_text}
                onChange={(e) => setGeneralSettings({ ...generalSettings, refund_policy_text: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button onClick={saveGeneralSettings} className="px-4 py-2 primary-gradient text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "packages" && (
        <div className="glass-card rounded-2xl overflow-hidden card-glow">
          <div className="flex items-center justify-between p-4 border-b border-surface-border/50">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Icon name="gift" className="text-primary" size={14} />
              Credit Packages
            </h3>
            <button
              onClick={() => { setNewPackage({ name: "", credits: 100, bonus_credits: 0, price: 9, currency: "USD", active: true, allowed_payment_methods: ["stripe"], display_order: 1 }); setShowAddPackage(true); }}
              className="px-3 py-1.5 primary-gradient text-white rounded-lg text-[10px] font-semibold hover:brightness-110 transition-all"
            >
              <Icon name="add" size={12} className="inline mr-1" />
              Add Package
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border/30">
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Credits</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Bonus</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Currency</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Allowed Methods</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Order</th>
                  <th className="text-right px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {creditPackages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-surface-border/20 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{pkg.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{pkg.credits.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {pkg.bonus_credits > 0 ? (
                        <span className="text-green-400">+{pkg.bonus_credits}</span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white">${pkg.price}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{pkg.currency}</td>
                    <td className="px-4 py-3"><StatusBadge status={pkg.active ? "active" : "inactive"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {pkg.allowed_payment_methods.map((m) => (
                          <span key={m} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-container-high border border-surface-border/30 text-on-surface-variant capitalize">{m}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{pkg.display_order}</td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu
                        items={[
                          { label: "Edit", icon: "edit", onClick: () => { setEditingPackage({ ...pkg }); setShowAddPackage(true); } },
                          { label: pkg.active ? "Disable" : "Enable", icon: pkg.active ? "close" : "check", onClick: () => { setCreditPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, active: !p.active } : p)); showToast(`${pkg.name} ${pkg.active ? "disabled" : "enabled"}`); } },
                          { label: "Duplicate", icon: "content_copy", onClick: () => { const dup = { ...pkg, id: 'pkg_' + Date.now(), name: pkg.name + " (Copy)" }; setCreditPackages(prev => [...prev, dup]); showToast("Package duplicated"); } },
                          { label: "Delete", icon: "delete", variant: "danger", onClick: () => { setCreditPackages(prev => prev.filter(p => p.id !== pkg.id)); showToast("Package deleted"); } },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "mappings" && (
        <div className="glass-card rounded-2xl overflow-hidden card-glow">
          <div className="p-4 border-b border-surface-border/50">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Icon name="checklist" className="text-primary" size={14} />
              Subscription Plans - Payment Mapping
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border/30">
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Stripe Price ID</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">PayPal Plan ID</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">YouCan Pay Plan ID</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Monthly</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Yearly</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Credits</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {planMappings.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border/20 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{m.plan_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-on-surface-variant font-mono">{m.stripe_price_id || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-on-surface-variant font-mono">{m.paypal_plan_id || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-on-surface-variant font-mono">{m.youcanpay_plan_id || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-white">${m.monthly_price}</td>
                    <td className="px-4 py-3 text-white">${m.yearly_price}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{m.credits_included.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.active ? "active" : "inactive"} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingMapping({ ...m })}
                        className="btn-subtle px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-on-surface-variant hover:text-white transition-all"
                      >
                        <Icon name="edit" size={12} className="inline mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === "webhooks" && (
        <div className="glass-card rounded-2xl overflow-hidden card-glow">
          <div className="p-4 border-b border-surface-border/50">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Icon name="webhook" className="text-primary" size={14} />
              Webhook Endpoints
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border/30">
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Endpoint URL</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Last Event</th>
                  <th className="text-left px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Last Error</th>
                  <th className="text-right px-4 py-3 text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockWebhookEndpoints.map((wh) => (
                  <tr key={wh.id} className="border-b border-surface-border/20 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{wh.provider}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] text-on-surface-variant font-mono bg-surface-container-low px-2 py-1 rounded border border-surface-border/30">{wh.endpoint}</code>
                        <button
                          onClick={() => copyToClipboard(wh.endpoint, wh.id)}
                          className="btn-subtle w-6 h-6 flex items-center justify-center rounded-lg"
                          title="Copy URL"
                        >
                          <Icon name={copiedId === wh.id ? "check" : "content_copy"} className={copiedId === wh.id ? "text-green-400" : "text-on-surface-variant"} size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={wh.status} /></td>
                    <td className="px-4 py-3 text-on-surface-variant text-[9px]">{wh.last_event ? formatDate(wh.last_event) : "—"}</td>
                    <td className="px-4 py-3">
                      {wh.last_error ? (
                        <span className="text-error text-[9px]">{wh.last_error}</span>
                      ) : (
                        <span className="text-on-surface-variant">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyToClipboard(wh.endpoint, wh.id + "_copy")}
                          className="btn-subtle px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-on-surface-variant hover:text-white transition-all"
                        >
                          <Icon name="content_copy" size={11} className="inline mr-1" />
                          Copy
                        </button>
                        <button
                          onClick={() => testWebhook(wh.provider)}
                          className="btn-subtle px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-on-surface-variant hover:text-white transition-all"
                        >
                          <Icon name="bolt" size={11} className="inline mr-1" />
                          Test
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showProviderSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowProviderSelect(false)}>
          <div className="bg-surface-container border border-surface-border/80 rounded-2xl max-w-sm w-full mx-4 p-5 animate-dropdown-open" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-4">Select Payment Provider</h3>
            <div className="space-y-2">
              {[
                { id: 'stripe', name: 'Stripe', icon: 'credit_card', desc: 'Credit cards & subscriptions' },
                { id: 'paypal', name: 'PayPal', icon: 'currency_bitcoin', desc: 'PayPal payments' },
                { id: 'youcanpay', name: 'YouCan Pay', icon: 'globe', desc: 'Moroccan payment gateway' },
                { id: 'youcanstore', name: 'YouCan Store API', icon: 'business', desc: 'E-commerce integration' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    const exists = providers.find(p => p.id === 'prov_' + opt.id);
                    if (exists) {
                      showToast(`${opt.name} is already configured`);
                    } else {
                      const newProv = {
                        id: 'prov_' + opt.id,
                        name: opt.name,
                        icon: opt.icon,
                        enabled: false,
                        mode: opt.id === 'youcanstore' ? 'development' : opt.id === 'stripe' ? 'live' : 'sandbox',
                        currency: opt.id === 'youcanpay' || opt.id === 'youcanstore' ? 'MAD' : 'USD',
                        payment_types: ['one-time'],
                        processing_fee: opt.id === 'stripe' ? 2.9 : opt.id === 'paypal' ? 3.5 : opt.id === 'youcanpay' ? 2.5 : 0,
                        fixed_fee: opt.id === 'stripe' ? 0.30 : opt.id === 'paypal' ? 0.49 : opt.id === 'youcanpay' ? 2.00 : 0,
                        configured: false,
                        last_updated: new Date().toISOString(),
                        config: {},
                      };
                      setProviders(prev => [...prev, newProv]);
                      showToast(`${opt.name} added. Configure it now.`);
                    }
                    setShowProviderSelect(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-surface-container-low border border-surface-border/50 hover:border-primary/30 hover:bg-surface-container-high transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon name={opt.icon} className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{opt.name}</p>
                    <p className="text-[9px] text-on-surface-variant">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowProviderSelect(false)} className="w-full mt-3 px-3 py-2 bg-surface-container-high border border-surface-border rounded-lg text-xs font-medium text-on-surface-variant hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingProvider(null)}>
          <div className="bg-surface-container border border-surface-border/80 rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto animate-dropdown-open" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 pb-3 border-b border-surface-border/50 sticky top-0 bg-surface-container z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name={editingProvider.icon} className="text-primary" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configure {editingProvider.name}</h3>
                  <p className="text-[9px] text-on-surface-variant">{editingProvider.mode} mode • {editingProvider.currency}</p>
                </div>
              </div>
              <button onClick={() => setEditingProvider(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-high border border-surface-border/50 hover:bg-surface-container-higher transition-all">
                <Icon name="close" className="text-on-surface-variant" size={14} />
              </button>
            </div>

            <div className="flex gap-1.5 px-5 pt-4 pb-2 border-b border-surface-border/30 overflow-x-auto hide-scrollbar">
              {["general", "credentials", "webhook"].filter(t => {
                if (t === "pricing" && editingProvider.id === "prov_stripe") return true;
                return true;
              }).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProviderModalTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                    providerModalTab === tab ? "bg-primary/20 text-primary border border-primary/30" : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {tab === "general" ? "General" : tab === "credentials" ? "Credentials" : tab === "webhook" ? "Webhook" : tab === "pricing" ? "Pricing" : tab}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {providerModalTab === "general" && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEditingProvider({ ...editingProvider, enabled: !editingProvider.enabled })}
                      className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.enabled ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.enabled ? "ml-[18px]" : "ml-[3px]"}`} />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white">Enabled</span>
                      <p className="text-[9px] text-on-surface-variant">Activate this payment provider</p>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Mode</label>
                      <select
                        value={editingProvider.mode}
                        onChange={(e) => setEditingProvider({ ...editingProvider, mode: e.target.value })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      >
                        {editingProvider.id === "prov_stripe" && <><option value="test">Test</option><option value="live">Live</option></>}
                        {editingProvider.id === "prov_paypal" && <><option value="sandbox">Sandbox</option><option value="live">Live</option></>}
                        {editingProvider.id === "prov_youcanpay" && <><option value="sandbox">Sandbox</option><option value="live">Live</option></>}
                        {editingProvider.id === "prov_youcanstore" && <><option value="development">Development</option><option value="production">Production</option></>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Currency</label>
                      <select
                        value={editingProvider.currency}
                        onChange={(e) => setEditingProvider({ ...editingProvider, currency: e.target.value })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="MAD">MAD (د.م.)</option>
                      </select>
                    </div>
                  </div>

                  {editingProvider.id === "prov_stripe" && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Subscription Settings</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, allow_subscriptions: !editingProvider.config.allow_subscriptions } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.allow_subscriptions ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.allow_subscriptions ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Allow Subscriptions</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, allow_one_time_credit_purchase: !editingProvider.config.allow_one_time_credit_purchase } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.allow_one_time_credit_purchase ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.allow_one_time_credit_purchase ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Allow One-Time Credit Purchase</span>
                      </label>
                    </div>
                  )}

                  {editingProvider.id === "prov_paypal" && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Subscription Settings</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, allow_subscriptions: !editingProvider.config.allow_subscriptions } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.allow_subscriptions ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.allow_subscriptions ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Allow Subscriptions</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, allow_one_time_credit_purchase: !editingProvider.config.allow_one_time_credit_purchase } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.allow_one_time_credit_purchase ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.allow_one_time_credit_purchase ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Allow One-Time Credit Purchase</span>
                      </label>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Merchant Email</label>
                        <input
                          type="email"
                          value={editingProvider.config.merchant_email || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, merchant_email: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="merchant@viralstudio.ai"
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanpay" && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Subscription Settings</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, allow_one_time_credit_purchase: !editingProvider.config.allow_one_time_credit_purchase } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.allow_one_time_credit_purchase ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.allow_one_time_credit_purchase ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Allow One-Time Credit Purchase</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer opacity-50 pointer-events-none">
                        <div className="w-9 h-5 rounded-full bg-surface-container-high border border-surface-border/50 flex items-center">
                          <span className="w-3.5 h-3.5 rounded-full bg-white ml-[3px] block" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-white">Allow Subscriptions</span>
                          <p className="text-[9px] text-on-surface-variant">Not available for this provider</p>
                        </div>
                      </label>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Merchant ID / Account ID</label>
                        <input
                          type="text"
                          value={editingProvider.config.merchant_id_or_account_id || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, merchant_id_or_account_id: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                          placeholder="merchant_001"
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanstore" && (
                    <div className="space-y-3">
                      <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Store Settings</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Store ID</label>
                          <input
                            type="text"
                            value={editingProvider.config.store_id || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, store_id: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                            placeholder="store_001"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Store Domain</label>
                          <input
                            type="text"
                            value={editingProvider.config.store_domain || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, store_domain: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                            placeholder="mystore.youcan.shop"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, products_sync: !editingProvider.config.products_sync } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.products_sync ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.products_sync ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Products Sync</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, payments_sync: !editingProvider.config.payments_sync } })}
                          className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingProvider.config.payments_sync ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingProvider.config.payments_sync ? "ml-[18px]" : "ml-[3px]"}`} />
                        </div>
                        <span className="text-xs font-medium text-white">Payments Sync</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {providerModalTab === "credentials" && (
                <div className="space-y-4">
                  {editingProvider.id === "prov_stripe" && (
                    <>
                      <div className="bg-error/10 border border-error/20 rounded-lg px-3 py-2 flex items-start gap-2">
                        <Icon name="error" className="text-error shrink-0 mt-0.5" size={12} />
                        <p className="text-[9px] text-error font-medium">Never expose secret keys in frontend. Use environment variables.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Publishable Key</label>
                          <input
                            type="text"
                            value={editingProvider.config.publishable_key || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, publishable_key: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                            placeholder={maskValue(editingProvider.config.publishable_key)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Secret Key</label>
                          <input
                            type="password"
                            value={editingProvider.config.secret_key || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, secret_key: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                            placeholder={maskValue(editingProvider.config.secret_key)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Signing Secret</label>
                        <input
                          type="password"
                          value={editingProvider.config.webhook_signing_secret || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_signing_secret: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.webhook_signing_secret)}
                        />
                      </div>
                    </>
                  )}

                  {editingProvider.id === "prov_paypal" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Client ID</label>
                        <input
                          type="text"
                          value={editingProvider.config.client_id || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, client_id: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.client_id)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Client Secret</label>
                        <input
                          type="password"
                          value={editingProvider.config.client_secret || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, client_secret: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.client_secret)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook ID</label>
                        <input
                          type="password"
                          value={editingProvider.config.webhook_id || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_id: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.webhook_id)}
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanpay" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Public Key</label>
                        <input
                          type="text"
                          value={editingProvider.config.public_key || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, public_key: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.public_key)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Private Key</label>
                        <input
                          type="password"
                          value={editingProvider.config.private_key || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, private_key: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.private_key)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Secret</label>
                        <input
                          type="password"
                          value={editingProvider.config.webhook_secret || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_secret: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.webhook_secret)}
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanstore" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Client ID</label>
                        <input
                          type="text"
                          value={editingProvider.config.client_id || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, client_id: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.client_id)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Client Secret</label>
                        <input
                          type="password"
                          value={editingProvider.config.client_secret || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, client_secret: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.client_secret)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Access Token</label>
                        <input
                          type="password"
                          value={editingProvider.config.access_token || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, access_token: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.access_token)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Refresh Token</label>
                        <input
                          type="password"
                          value={editingProvider.config.refresh_token || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, refresh_token: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.refresh_token)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Secret</label>
                        <input
                          type="password"
                          value={editingProvider.config.webhook_secret || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_secret: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          placeholder={maskValue(editingProvider.config.webhook_secret)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {providerModalTab === "webhook" && (
                <div className="space-y-4">
                  {editingProvider.id === "prov_stripe" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Endpoint URL</label>
                          <input
                            type="text"
                            value={editingProvider.config.webhook_endpoint_url || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_endpoint_url: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Success URL</label>
                          <input
                            type="text"
                            value={editingProvider.config.success_url || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, success_url: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Cancel URL</label>
                          <input
                            type="text"
                            value={editingProvider.config.cancel_url || ""}
                            onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, cancel_url: e.target.value } })}
                            className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {editingProvider.id === "prov_paypal" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Endpoint URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.webhook_endpoint_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_endpoint_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Success URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.success_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, success_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Cancel URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.cancel_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, cancel_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanpay" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Webhook Endpoint URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.webhook_endpoint_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, webhook_endpoint_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Success URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.success_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, success_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Cancel URL</label>
                        <input
                          type="text"
                          value={editingProvider.config.cancel_url || ""}
                          onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, cancel_url: e.target.value } })}
                          className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {editingProvider.id === "prov_youcanstore" && (
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Orders Webhook URL</label>
                      <input
                        type="text"
                        value={editingProvider.config.orders_webhook_url || ""}
                        onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, orders_webhook_url: e.target.value } })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {providerModalTab === "pricing" && editingProvider.id === "prov_stripe" && (
                <div className="space-y-4">
                  <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">Price IDs</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Creator Monthly Price ID</label>
                      <input
                        type="text"
                        value={editingProvider.config.price_id_creator_monthly || ""}
                        onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, price_id_creator_monthly: e.target.value } })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Pro Monthly Price ID</label>
                      <input
                        type="text"
                        value={editingProvider.config.price_id_pro_monthly || ""}
                        onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, price_id_pro_monthly: e.target.value } })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Agency Monthly Price ID</label>
                      <input
                        type="text"
                        value={editingProvider.config.price_id_agency_monthly || ""}
                        onChange={(e) => setEditingProvider({ ...editingProvider, config: { ...editingProvider.config, price_id_agency_monthly: e.target.value } })}
                        className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-5 pt-0 sticky bottom-0 bg-surface-container rounded-b-2xl border-t border-surface-border/50">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-3 py-2 bg-surface-container-high border border-surface-border rounded-lg text-xs font-medium text-on-surface-variant hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => testConnection(editingProvider.name)}
                className="px-3 py-2 btn-subtle rounded-lg text-xs font-medium text-on-surface-variant hover:text-white transition-all"
              >
                <Icon name="bolt" size={12} className="inline mr-1" />
                Test Connection
              </button>
              <button
                onClick={saveProviderConfig}
                className="px-4 py-2 primary-gradient text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all ml-auto"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddPackage || editingPackage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddPackage(false); setEditingPackage(null); }}>
          <div className="bg-surface-container border border-surface-border/80 rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto animate-dropdown-open" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 pb-3 border-b border-surface-border/50 sticky top-0 bg-surface-container z-10 rounded-t-2xl">
              <h3 className="text-sm font-bold text-white">{editingPackage ? "Edit Package" : "Add Credit Package"}</h3>
              <button onClick={() => { setShowAddPackage(false); setEditingPackage(null); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-high border border-surface-border/50 hover:bg-surface-container-higher transition-all">
                <Icon name="close" className="text-on-surface-variant" size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Package Name</label>
                <input
                  type="text"
                  value={editingPackage ? editingPackage.name : newPackage.name}
                  onChange={(e) => {
                    if (editingPackage) setEditingPackage({ ...editingPackage, name: e.target.value });
                    else setNewPackage({ ...newPackage, name: e.target.value });
                  }}
                  className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Starter"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Credits</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.credits : newPackage.credits}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingPackage) setEditingPackage({ ...editingPackage, credits: v });
                      else setNewPackage({ ...newPackage, credits: v });
                    }}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Bonus Credits</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.bonus_credits : newPackage.bonus_credits}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingPackage) setEditingPackage({ ...editingPackage, bonus_credits: v });
                      else setNewPackage({ ...newPackage, bonus_credits: v });
                    }}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.price : newPackage.price}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingPackage) setEditingPackage({ ...editingPackage, price: v });
                      else setNewPackage({ ...newPackage, price: v });
                    }}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Currency</label>
                  <select
                    value={editingPackage ? editingPackage.currency : newPackage.currency}
                    onChange={(e) => {
                      if (editingPackage) setEditingPackage({ ...editingPackage, currency: e.target.value });
                      else setNewPackage({ ...newPackage, currency: e.target.value });
                    }}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="MAD">MAD (د.م.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.display_order : newPackage.display_order}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingPackage) setEditingPackage({ ...editingPackage, display_order: v });
                      else setNewPackage({ ...newPackage, display_order: v });
                    }}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Allowed Payment Methods</label>
                <div className="flex flex-wrap gap-2">
                  {["stripe", "paypal", "youcanpay", "youcanstore"].map((method) => {
                    const methods = editingPackage ? editingPackage.allowed_payment_methods : newPackage.allowed_payment_methods;
                    const checked = methods.includes(method);
                    return (
                      <label key={method} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-[10px] font-medium ${
                        checked ? "border-primary/50 bg-primary/10 text-primary" : "border-surface-border/50 bg-surface-container-low text-on-surface-variant hover:text-white"
                      }`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const updated = checked ? methods.filter(m => m !== method) : [...methods, method];
                            if (editingPackage) setEditingPackage({ ...editingPackage, allowed_payment_methods: updated });
                            else setNewPackage({ ...newPackage, allowed_payment_methods: updated });
                          }}
                          className="sr-only"
                        />
                        <span className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${checked ? "bg-primary border-primary" : "border-surface-border"}`}>
                          {checked && <Icon name="check" size={8} className="text-white" />}
                        </span>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </label>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => {
                    if (editingPackage) setEditingPackage({ ...editingPackage, active: !editingPackage.active });
                    else setNewPackage({ ...newPackage, active: !newPackage.active });
                  }}
                  className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${(editingPackage ? editingPackage.active : newPackage.active) ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${(editingPackage ? editingPackage.active : newPackage.active) ? "ml-[18px]" : "ml-[3px]"}`} />
                </div>
                <span className="text-xs font-medium text-white">Active</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0 sticky bottom-0 bg-surface-container rounded-b-2xl border-t border-surface-border/50">
              <button
                onClick={() => { setShowAddPackage(false); setEditingPackage(null); }}
                className="flex-1 px-3 py-2 bg-surface-container-high border border-surface-border rounded-lg text-xs font-medium text-on-surface-variant hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={savePackage}
                className="flex-1 px-3 py-2 primary-gradient text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
              >
                {editingPackage ? "Update Package" : "Add Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingMapping(null)}>
          <div className="bg-surface-container border border-surface-border/80 rounded-2xl max-w-lg w-full mx-4 animate-dropdown-open" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 pb-3 border-b border-surface-border/50">
              <h3 className="text-sm font-bold text-white">Edit Plan Mapping - {editingMapping.plan_name}</h3>
              <button onClick={() => setEditingMapping(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-high border border-surface-border/50 hover:bg-surface-container-higher transition-all">
                <Icon name="close" className="text-on-surface-variant" size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Stripe Price ID</label>
                  <input
                    type="text"
                    value={editingMapping.stripe_price_id}
                    onChange={(e) => setEditingMapping({ ...editingMapping, stripe_price_id: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">PayPal Plan ID</label>
                  <input
                    type="text"
                    value={editingMapping.paypal_plan_id}
                    onChange={(e) => setEditingMapping({ ...editingMapping, paypal_plan_id: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">YouCan Pay Plan ID</label>
                  <input
                    type="text"
                    value={editingMapping.youcanpay_plan_id}
                    onChange={(e) => setEditingMapping({ ...editingMapping, youcanpay_plan_id: e.target.value })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={editingMapping.monthly_price}
                    onChange={(e) => setEditingMapping({ ...editingMapping, monthly_price: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Yearly Price ($)</label>
                  <input
                    type="number"
                    value={editingMapping.yearly_price}
                    onChange={(e) => setEditingMapping({ ...editingMapping, yearly_price: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-on-surface-variant mb-1.5 uppercase tracking-wider">Credits Included</label>
                  <input
                    type="number"
                    value={editingMapping.credits_included}
                    onChange={(e) => setEditingMapping({ ...editingMapping, credits_included: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-surface-border/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEditingMapping({ ...editingMapping, active: !editingMapping.active })}
                  className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center ${editingMapping.active ? "bg-primary" : "bg-surface-container-high border border-surface-border/50"}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 block ${editingMapping.active ? "ml-[18px]" : "ml-[3px]"}`} />
                </div>
                <span className="text-xs font-medium text-white">Active</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button
                onClick={() => setEditingMapping(null)}
                className="flex-1 px-3 py-2 bg-surface-container-high border border-surface-border rounded-lg text-xs font-medium text-on-surface-variant hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveMapping}
                className="flex-1 px-3 py-2 primary-gradient text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
              >
                Save Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDisable !== null}
        onClose={() => setConfirmDisable(null)}
        onConfirm={() => toggleProvider(confirmDisable.id)}
        title={confirmDisable?.enabled ? "Disable Provider" : "Enable Provider"}
        message={`Are you sure you want to ${confirmDisable?.enabled ? "disable" : "enable"} ${confirmDisable?.name}? ${confirmDisable?.enabled ? "This will stop all payments through this provider." : ""}`}
        confirmLabel={confirmDisable?.enabled ? "Disable" : "Enable"}
        confirmVariant={confirmDisable?.enabled ? "danger" : "primary"}
      />

      <ConfirmModal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteProvider(confirmDelete.id)}
        title="Delete Provider"
        message={`Are you sure you want to remove ${confirmDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
