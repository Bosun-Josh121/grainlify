import { useState, useEffect } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { Shield, Globe, Plus, Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { Modal, ModalFooter, ModalButton, ModalInput, ModalSelect } from '../../../shared/components/ui/Modal';
import { createEcosystem, getAdminEcosystems, deleteEcosystem } from '../../../shared/api/client';

interface Ecosystem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website_url: string | null;
  status: string;
  project_count: number;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export function AdminPage() {
  const { theme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    websiteUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEcosystems = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminEcosystems();
      setEcosystems(response.ecosystems || []);
    } catch (error) {
      console.error('Failed to fetch ecosystems:', error);
      alert(error instanceof Error ? error.message : 'Failed to load ecosystems.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEcosystems();
    
    // Listen for ecosystem updates
    const handleEcosystemsUpdated = () => {
      fetchEcosystems();
    };
    window.addEventListener('ecosystems-updated', handleEcosystemsUpdated);
    return () => {
      window.removeEventListener('ecosystems-updated', handleEcosystemsUpdated);
    };
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteEcosystem(id);
      // Refresh the list
      await fetchEcosystems();
      // Dispatch event to update other pages
      window.dispatchEvent(new CustomEvent('ecosystems-updated'));
    } catch (error) {
      console.error('Failed to delete ecosystem:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete ecosystem. Make sure it has no associated projects.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createEcosystem({
        name: formData.name,
        description: formData.description || undefined,
        website_url: formData.websiteUrl || undefined,
        status: formData.status as 'active' | 'inactive',
      });
      
      // Success - close modal and reset form
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        websiteUrl: ''
      });
      
      // Refresh ecosystems list
      await fetchEcosystems();
      // Dispatch event to update other pages
      window.dispatchEvent(new CustomEvent('ecosystems-updated'));
    } catch (error) {
      console.error('Failed to create ecosystem:', error);
      alert(error instanceof Error ? error.message : 'Failed to create ecosystem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className={`backdrop-blur-[40px] bg-gradient-to-br rounded-[28px] border shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-10 transition-all overflow-hidden relative ${
        theme === 'dark'
          ? 'from-white/[0.08] to-white/[0.04] border-white/10'
          : 'from-white/[0.15] to-white/[0.08] border-white/20'
      }`}>
        {/* Decorative gradient */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#c9983a]/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-[12px] bg-gradient-to-br from-[#c9983a] to-[#a67c2e] shadow-[0_6px_20px_rgba(162,121,44,0.35)] border border-white/10">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-[36px] font-bold transition-colors ${
                  theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                }`}>Admin Panel</h1>
              </div>
              <p className={`text-[16px] max-w-3xl transition-colors ${
                theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
              }`}>
                Manage ecosystems, review requests, and oversee platform operations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-[12px] backdrop-blur-[20px] border transition-colors ${
                theme === 'dark'
                  ? 'bg-white/[0.08] border-white/15 text-[#d4d4d4]'
                  : 'bg-white/[0.15] border-white/25 text-[#7a6b5a]'
              }`}>
                <span className="text-[13px] font-medium">Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Management Section */}
      <div className={`backdrop-blur-[40px] rounded-[24px] border shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 transition-colors ${
        theme === 'dark'
          ? 'bg-white/[0.08] border-white/10'
          : 'bg-white/[0.15] border-white/20'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-[24px] font-bold mb-2 transition-colors ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
            }`}>Ecosystem Management</h2>
            <p className={`text-[14px] transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`}>Add, edit, or remove ecosystems from the platform</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group px-6 py-3.5 bg-gradient-to-br from-[#c9983a] to-[#a67c2e] text-white rounded-[16px] font-semibold text-[14px] shadow-[0_6px_20px_rgba(162,121,44,0.35)] hover:shadow-[0_10px_30px_rgba(162,121,44,0.5)] transition-all flex items-center gap-2.5 border border-white/10 hover:scale-105"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add New Ecosystem
            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Ecosystems List */}
        <div className="mt-6">
          {isLoading ? (
            <div className={`text-center py-12 transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`}>
              Loading ecosystems...
            </div>
          ) : ecosystems.length === 0 ? (
            <div className={`text-center py-12 transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`}>
              No ecosystems found. Add your first ecosystem above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecosystems.map((ecosystem) => {
                const firstLetter = ecosystem.name.charAt(0).toUpperCase();
                const colors = [
                  'bg-gradient-to-br from-[#c9983a] to-[#a67c2e]',
                  'bg-gradient-to-br from-purple-500 to-purple-600',
                  'bg-gradient-to-br from-blue-500 to-blue-600',
                  'bg-gradient-to-br from-green-500 to-green-600',
                  'bg-gradient-to-br from-red-500 to-red-600',
                  'bg-gradient-to-br from-pink-500 to-pink-600',
                ];
                const colorIndex = ecosystem.name.charCodeAt(0) % colors.length;
                const bgColor = colors[colorIndex];

                return (
                  <div
                    key={ecosystem.id}
                    className={`backdrop-blur-[30px] rounded-[16px] border p-5 transition-all hover:scale-[1.02] ${
                      theme === 'dark'
                        ? 'bg-white/[0.06] border-white/10'
                        : 'bg-white/[0.12] border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-[12px] ${bgColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {firstLetter}
                      </div>
                      <button
                        onClick={() => handleDelete(ecosystem.id, ecosystem.name)}
                        disabled={deletingId === ecosystem.id}
                        className={`p-2 rounded-[10px] transition-all ${
                          deletingId === ecosystem.id
                            ? 'opacity-50 cursor-not-allowed'
                            : theme === 'dark'
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-red-500/30 text-red-600'
                        }`}
                        title="Delete ecosystem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className={`text-[18px] font-bold mb-2 transition-colors ${
                      theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                    }`}>{ecosystem.name}</h3>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className={`text-[11px] transition-colors ${
                          theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                        }`}>Projects</p>
                        <p className={`text-[20px] font-bold transition-colors ${
                          theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                        }`}>{ecosystem.project_count}</p>
                      </div>
                      <div>
                        <p className={`text-[11px] transition-colors ${
                          theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                        }`}>Contributors</p>
                        <p className={`text-[20px] font-bold transition-colors ${
                          theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                        }`}>{ecosystem.user_count}</p>
                      </div>
                    </div>

                    {ecosystem.description && (
                      <p className={`text-[13px] mb-3 line-clamp-2 transition-colors ${
                        theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                      }`}>{ecosystem.description}</p>
                    )}

                    {ecosystem.website_url && (
                      <a
                        href={ecosystem.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-[13px] transition-colors ${
                          theme === 'dark' ? 'text-[#c9983a] hover:text-[#e8c77f]' : 'text-[#a67c2e] hover:text-[#c9983a]'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className={`text-[11px] px-2 py-1 rounded-[6px] ${
                        ecosystem.status === 'active'
                          ? theme === 'dark'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-green-500/30 text-green-700'
                          : theme === 'dark'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-gray-500/30 text-gray-700'
                      }`}>
                        {ecosystem.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className={`backdrop-blur-[30px] rounded-[16px] border p-5 flex items-start gap-4 transition-colors mt-6 ${
          theme === 'dark'
            ? 'bg-white/[0.06] border-white/10'
            : 'bg-white/[0.12] border-white/20'
        }`}>
          <div className="p-2 rounded-[10px] bg-gradient-to-br from-[#c9983a]/20 to-[#a67c2e]/10 border border-[#c9983a]/20">
            <Sparkles className="w-5 h-5 text-[#c9983a]" />
          </div>
          <div>
            <p className={`text-[14px] font-medium mb-1 transition-colors ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
            }`}>Ecosystem Management Tips</p>
            <p className={`text-[13px] leading-relaxed transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`}>
              Add ecosystems with accurate descriptions and valid website URLs. You can only delete ecosystems that have no associated projects.
            </p>
          </div>
        </div>
      </div>

      {/* Add Ecosystem Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Ecosystem"
        width="lg"
      >
        <p className={`text-[14px] mb-6 transition-colors ${
          theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
        }`}>Create a new ecosystem entry for the platform</p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <ModalInput
              label="Ecosystem Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="e.g., Web3 Ecosystem"
              required
            />

            <ModalInput
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Describe the ecosystem..."
              rows={4}
              required
            />

            <ModalSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />

            <ModalInput
              label="Website URL"
              type="url"
              value={formData.websiteUrl}
              onChange={(value) => setFormData({ ...formData, websiteUrl: value })}
              placeholder="https://example.com"
              required
            />
          </div>

          <ModalFooter>
            <ModalButton onClick={() => setShowAddModal(false)}>
              Cancel
            </ModalButton>
            <ModalButton type="submit" variant="primary" disabled={isSubmitting}>
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Add Ecosystem'}
            </ModalButton>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}