import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Check, X, Clock, MessageCircle, History } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';
import type { StoryFieldSource } from '../../../models';

// Generic field type that can hold any value
interface GenericStoryField {
  value: unknown;
  confidence: string;
  source: StoryFieldSource;
  learnedAt: Date;
  lastConfirmed?: Date;
  history?: Array<{
    value: unknown;
    changedAt: Date;
    source: StoryFieldSource;
  }>;
}

interface StoryFieldProps {
  label: string;
  fieldPath: string;
  field: GenericStoryField | undefined;
  onUpdate: (value: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onViewHistory?: () => void;
  hasHistory?: boolean;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'textarea';
}

/**
 * StoryField - Individual editable field in the user story
 * Shows value, source badge, and edit/delete actions
 */
export const StoryField: FC<StoryFieldProps> = ({
  label,
  field,
  onUpdate,
  onDelete,
  onViewHistory,
  hasHistory = false,
  placeholder,
  inputType = 'text',
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasValue = field?.value !== undefined && field?.value !== null && field?.value !== '';

  const getDisplayValue = (): string => {
    if (!field?.value) return '';

    const value = field.value;

    // Handle different value types
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return (value as string[]).join(', ');

    // Handle objects (location, occupation, pets)
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      if ('details' in obj && obj.details) return String(obj.details);
      if ('city' in obj || 'country' in obj) {
        const loc = obj as { city?: string; country?: string };
        return [loc.city, loc.country].filter(Boolean).join(', ');
      }
      if ('type' in obj && obj.type) {
        const occ = obj as { type: string; details?: string };
        return occ.details || occ.type;
      }
      if ('has' in obj) {
        const pets = obj as { has: boolean; details?: string };
        return pets.details || (pets.has ? 'Yes' : 'No');
      }
    }

    return JSON.stringify(value);
  };

  const getSourceIcon = (source: StoryFieldSource) => {
    if (source === 'conversation') {
      return <MessageCircle size={12} />;
    }
    return <Edit3 size={12} />;
  };

  const getSourceLabel = (source: StoryFieldSource) => {
    if (source === 'conversation') {
      return t('myStory.labels.learnedFrom');
    }
    return t('myStory.labels.addedByYou');
  };

  const handleStartEdit = async () => {
    await light();
    setEditValue(getDisplayValue());
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editValue.trim()) return;

    setIsSaving(true);
    try {
      await onUpdate(editValue.trim());
      await medium();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    await light();
    setIsEditing(false);
    setEditValue('');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      await medium();
    } catch (error) {
      console.error('Failed to delete field:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const historyLength = hasHistory && field && 'history' in field ? field.history?.length || 0 : 0;

  return (
    <div className="rounded-xl border border-glass-border bg-glass-bg px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-mist-white/70">{label}</span>
            {hasValue && field?.source && (
              <span className="inline-flex items-center gap-1 rounded-full bg-glass-bg px-2 py-0.5 text-[10px] text-mist-white/40">
                {getSourceIcon(field.source)}
                {getSourceLabel(field.source)}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                {inputType === 'textarea' ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-glass-border bg-void-blue/50 px-3 py-2 text-sm text-mist-white placeholder-mist-white/30 focus:border-biolum-cyan/50 focus:outline-none focus:ring-1 focus:ring-biolum-cyan/30"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <input
                    type={inputType}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-glass-border bg-void-blue/50 px-3 py-2 text-sm text-mist-white placeholder-mist-white/30 focus:border-biolum-cyan/50 focus:outline-none focus:ring-1 focus:ring-biolum-cyan/30"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editValue.trim()}
                    className="flex items-center gap-1 rounded-lg bg-biolum-cyan/20 px-3 py-1.5 text-xs font-medium text-biolum-cyan transition-colors hover:bg-biolum-cyan/30 disabled:opacity-50"
                  >
                    <Check size={14} />
                    {t('myStory.actions.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 rounded-lg bg-glass-bg px-3 py-1.5 text-xs font-medium text-mist-white/70 transition-colors hover:bg-glass-bg-hover"
                  >
                    <X size={14} />
                    {t('myStory.actions.cancel')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {hasValue ? (
                  <p className="text-base text-mist-white">{getDisplayValue()}</p>
                ) : (
                  <p className="text-sm italic text-mist-white/30">
                    {placeholder || t('myStory.emptyField')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {hasValue && field?.learnedAt && !isEditing && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-mist-white/30">
              <Clock size={10} />
              {new Date(field.learnedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            {hasValue && hasHistory && historyLength > 0 && onViewHistory && (
              <button
                onClick={onViewHistory}
                className="rounded-lg p-2 text-mist-white/40 transition-colors hover:bg-glass-bg hover:text-mist-white/70"
                title={t('myStory.labels.viewHistory')}
              >
                <History size={16} />
              </button>
            )}
            <button
              onClick={handleStartEdit}
              className="rounded-lg p-2 text-mist-white/40 transition-colors hover:bg-glass-bg hover:text-biolum-cyan"
              title={t('myStory.actions.edit')}
            >
              <Edit3 size={16} />
            </button>
            {hasValue && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="hover:text-status-danger rounded-lg p-2 text-mist-white/40 transition-colors hover:bg-glass-bg disabled:opacity-50"
                title={t('myStory.actions.delete')}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
