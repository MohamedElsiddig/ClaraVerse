import { useEffect, useState, useRef } from 'react';
import { Save, User, Globe, Server, Key, Lock } from 'lucide-react';
import { db, type PersonalInfo, type APIConfig } from '../db';
import { useTheme, ThemeMode } from '../hooks/useTheme';

const Settings = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    avatar_url: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    theme_preference: 'system'
  });

  const [apiConfig, setApiConfig] = useState<APIConfig>({
    ollama_base_url: '',
    comfyui_base_url: '',
    openai_api_key: '',
    openai_base_url: '',
    api_type: 'ollama'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  const { setTheme } = useTheme();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const savedPersonalInfo = await db.getPersonalInfo();
      const savedApiConfig = await db.getAPIConfig();

      if (savedPersonalInfo) {
        setPersonalInfo(savedPersonalInfo);
        setTheme(savedPersonalInfo.theme_preference as ThemeMode);
      }
      
      if (savedApiConfig) {
        setApiConfig({
          ...savedApiConfig,
          openai_base_url: savedApiConfig.openai_base_url || 'https://api.openai.com/v1',
        });
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save effect for personalInfo and apiConfig
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setIsSaving(true);
    setSaveStatus('idle');
    saveTimeout.current = setTimeout(async () => {
      try {
        await db.updatePersonalInfo(personalInfo);
        await db.updateAPIConfig(apiConfig);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 600); // debounce 600ms
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [personalInfo, apiConfig]);

  // When theme_preference changes, update the theme immediately
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ThemeMode;
    setPersonalInfo(prev => ({ ...prev, theme_preference: value }));
    setTheme(value);
  };

  // Timezone options helper
  let timezoneOptions: string[] = [];
  try {
    // @ts-ignore
    timezoneOptions = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  } catch {
    timezoneOptions = [];
  }
  if (!timezoneOptions.length) {
    timezoneOptions = [
      'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata',
      'Europe/Paris', 'Europe/Berlin', 'America/Los_Angeles', 'Australia/Sydney'
    ];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Personal Information Section */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-sakura-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={personalInfo.avatar_url}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, avatar_url: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>
      </div>

      {/* API Configuration Section with Server Selection */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-sakura-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            API Configuration
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setApiConfig(prev => ({ ...prev, api_type: 'ollama' }))}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  apiConfig.api_type === 'ollama'
                    ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-500/10'
                    : 'border-gray-200 hover:border-sakura-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">Ollama</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Local AI models</p>
                </div>
              </button>
              <button
                onClick={() => setApiConfig(prev => ({ ...prev, api_type: 'openai' }))}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  apiConfig.api_type === 'openai'
                    ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-500/10'
                    : 'border-gray-200 hover:border-sakura-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">OpenAI-like API</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Compatible with OpenAI API format</p>
                </div>
              </button>
            </div>
          </div>

          {apiConfig.api_type === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ollama Base URL
              </label>
              <input
                type="url"
                value={apiConfig.ollama_base_url}
                onChange={(e) => setApiConfig(prev => ({ ...prev, ollama_base_url: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                placeholder="http://localhost:11434"
              />
            </div>
          )}

          {apiConfig.api_type === 'openai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Base URL <span className="text-xs text-gray-500">(Optional - uses OpenAI if blank)</span>
                </label>
                <input
                  type="url"
                  value={apiConfig.openai_base_url}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, openai_base_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                  placeholder="https://api.openai.com/v1 or your custom endpoint"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key <span className="text-xs text-gray-500">(Optional for some API providers)</span>
                </label>
                <input
                  type="password"
                  value={apiConfig.openai_api_key}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, openai_api_key: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                  placeholder="sk-..."
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ComfyUI Base URL
            </label>
            <input
              type="url"
              value={apiConfig.comfyui_base_url}
              onChange={(e) => setApiConfig(prev => ({ ...prev, comfyui_base_url: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
              placeholder="http://localhost:8188"
            />
          </div>

          {/* n8n Configuration Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-sakura-500" />
              n8n Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  n8n Base URL
                </label>
                <input
                  type="url"
                  value={apiConfig.n8n_base_url || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, n8n_base_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                  placeholder="http://localhost:5678"
                />
                <p className="mt-1 text-sm text-gray-500">The URL where your n8n instance is running</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  n8n API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiConfig.n8n_api_key || ''}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, n8n_api_key: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                    placeholder="Your n8n API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showApiKey ? (
                      <Lock className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Key className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">API key for authenticating with your n8n instance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-sakura-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme
            </label>
            <select
              value={personalInfo.theme_preference}
              onChange={handleThemeChange}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <select
              value={personalInfo.timezone}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
            >
              {timezoneOptions.map((tz: string) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <span className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors ${
          isSaving
            ? 'bg-gray-400'
            : saveStatus === 'success'
            ? 'bg-green-500'
            : saveStatus === 'error'
            ? 'bg-red-500'
            : 'bg-sakura-500'
        }`}>
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Auto Save'}
        </span>
      </div>
    </div>
  );
};

export default Settings;