import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Briefcase, Heart, MapPin, Brain, Sparkles } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { useHaptics } from '../hooks/useHaptics';
import { useUserStory } from '../hooks/useUserStory';
import { StorySection, StoryField, EmptyStoryPrompt } from '../components/features/story';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
/**
 * MyStoryPage - User's personal story profile page
 * Displays and allows editing of AI-learned information about the user
 */
export const MyStoryPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navbarBottom } = useUI();
  const { light } = useHaptics();
  const { story, isLoading, updateField, forgetField, getKnownFieldCount } = useUserStory();

  const handleBack = async () => {
    await light();
    navigate('/profile');
  };

  // Helper to check if a section has any filled fields
  const sectionHasContent = (sectionData: Record<string, unknown> | undefined): boolean => {
    if (!sectionData) return false;
    return Object.values(sectionData).some((field) => {
      if (!field || typeof field !== 'object') return false;
      return 'value' in field && field.value !== undefined && field.value !== null;
    });
  };

  // Create update handler for a specific field
  const handleUpdateField = (fieldPath: string) => async (value: string) => {
    // Handle special field types
    if (fieldPath === 'coreIdentity.age') {
      await updateField(fieldPath, parseInt(value) || 0);
    } else if (fieldPath === 'relationships.hasPets') {
      await updateField(fieldPath, { has: true, details: value });
    } else if (fieldPath === 'lifeSituation.occupation') {
      await updateField(fieldPath, { type: 'other', details: value });
    } else if (fieldPath === 'coreIdentity.location') {
      await updateField(fieldPath, { city: value });
    } else if (
      fieldPath.includes('interests') ||
      fieldPath.includes('hobbies') ||
      fieldPath.includes('Triggers') ||
      fieldPath.includes('Activities')
    ) {
      // Array fields - split by comma
      await updateField(
        fieldPath,
        value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else {
      await updateField(fieldPath, value);
    }
  };

  const handleForgetField = (fieldPath: string) => async () => {
    await forgetField(fieldPath);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-void-blue">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const knownFieldCount = getKnownFieldCount();
  const isEmpty = !story || knownFieldCount === 0;

  return (
    <div className="flex h-full flex-col bg-void-blue">
      {/* Header */}
      <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="rounded-lg p-2 text-mist-white/70 transition-colors hover:bg-glass-bg hover:text-mist-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-medium text-mist-white">{t('myStory.title')}</h1>
            <p className="text-xs text-mist-white/50">{t('myStory.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ paddingBottom: `${navbarBottom + 24}px` }}
      >
        {isEmpty ? (
          <EmptyStoryPrompt />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            {/* Privacy note */}
            <p className="mb-4 text-center text-xs text-mist-white/40">
              {t('myStory.privacy.note')}
            </p>

            {/* Tier 1: Core Identity */}
            <StorySection
              title={t('myStory.sections.coreIdentity')}
              icon={<User size={18} />}
              depth={1}
              defaultOpen={true}
              isEmpty={!sectionHasContent(story?.coreIdentity)}
            >
              <StoryField
                label={t('myStory.fields.name')}
                fieldPath="coreIdentity.name"
                field={story?.coreIdentity?.name}
                onUpdate={handleUpdateField('coreIdentity.name')}
                onDelete={handleForgetField('coreIdentity.name')}
                placeholder={t('myStory.placeholders.name')}
              />
              <StoryField
                label={t('myStory.fields.age')}
                fieldPath="coreIdentity.age"
                field={story?.coreIdentity?.age}
                onUpdate={handleUpdateField('coreIdentity.age')}
                onDelete={handleForgetField('coreIdentity.age')}
                placeholder={t('myStory.placeholders.age')}
                inputType="number"
              />
              <StoryField
                label={t('myStory.fields.pronouns')}
                fieldPath="coreIdentity.pronouns"
                field={story?.coreIdentity?.pronouns}
                onUpdate={handleUpdateField('coreIdentity.pronouns')}
                onDelete={handleForgetField('coreIdentity.pronouns')}
                placeholder={t('myStory.placeholders.pronouns')}
              />
              <StoryField
                label={t('myStory.fields.location')}
                fieldPath="coreIdentity.location"
                field={story?.coreIdentity?.location}
                onUpdate={handleUpdateField('coreIdentity.location')}
                onDelete={handleForgetField('coreIdentity.location')}
                placeholder={t('myStory.placeholders.location')}
              />
            </StorySection>

            {/* Tier 2: Life Situation */}
            <StorySection
              title={t('myStory.sections.lifeSituation')}
              icon={<Briefcase size={18} />}
              depth={2}
              isEmpty={!sectionHasContent(story?.lifeSituation)}
            >
              <StoryField
                label={t('myStory.fields.occupation')}
                fieldPath="lifeSituation.occupation"
                field={story?.lifeSituation?.occupation}
                onUpdate={handleUpdateField('lifeSituation.occupation')}
                onDelete={handleForgetField('lifeSituation.occupation')}
                placeholder={t('myStory.placeholders.occupation')}
                hasHistory
              />
              <StoryField
                label={t('myStory.fields.livingArrangement')}
                fieldPath="lifeSituation.livingArrangement"
                field={story?.lifeSituation?.livingArrangement}
                onUpdate={handleUpdateField('lifeSituation.livingArrangement')}
                onDelete={handleForgetField('lifeSituation.livingArrangement')}
                placeholder={t('myStory.placeholders.livingArrangement')}
              />
              <StoryField
                label={t('myStory.fields.dailySchedule')}
                fieldPath="lifeSituation.dailySchedule"
                field={story?.lifeSituation?.dailySchedule}
                onUpdate={handleUpdateField('lifeSituation.dailySchedule')}
                onDelete={handleForgetField('lifeSituation.dailySchedule')}
                placeholder={t('myStory.placeholders.dailySchedule')}
              />
            </StorySection>

            {/* Tier 3: Relationships */}
            <StorySection
              title={t('myStory.sections.relationships')}
              icon={<Heart size={18} />}
              depth={3}
              isEmpty={!sectionHasContent(story?.relationships)}
            >
              <StoryField
                label={t('myStory.fields.romanticStatus')}
                fieldPath="relationships.romanticStatus"
                field={story?.relationships?.romanticStatus}
                onUpdate={handleUpdateField('relationships.romanticStatus')}
                onDelete={handleForgetField('relationships.romanticStatus')}
                placeholder={t('myStory.placeholders.romanticStatus')}
                hasHistory
              />
              <StoryField
                label={t('myStory.fields.hasPets')}
                fieldPath="relationships.hasPets"
                field={story?.relationships?.hasPets}
                onUpdate={handleUpdateField('relationships.hasPets')}
                onDelete={handleForgetField('relationships.hasPets')}
                placeholder={t('myStory.placeholders.hasPets')}
              />
              <StoryField
                label={t('myStory.fields.supportSystem')}
                fieldPath="relationships.supportSystem"
                field={story?.relationships?.supportSystem}
                onUpdate={handleUpdateField('relationships.supportSystem')}
                onDelete={handleForgetField('relationships.supportSystem')}
                placeholder={t('myStory.placeholders.supportSystem')}
              />
            </StorySection>

            {/* Tier 4: Background */}
            <StorySection
              title={t('myStory.sections.background')}
              icon={<MapPin size={18} />}
              depth={4}
              isEmpty={!sectionHasContent(story?.background)}
            >
              <StoryField
                label={t('myStory.fields.hometown')}
                fieldPath="background.hometown"
                field={story?.background?.hometown}
                onUpdate={handleUpdateField('background.hometown')}
                onDelete={handleForgetField('background.hometown')}
                placeholder={t('myStory.placeholders.hometown')}
              />
              <StoryField
                label={t('myStory.fields.culturalBackground')}
                fieldPath="background.culturalBackground"
                field={story?.background?.culturalBackground}
                onUpdate={handleUpdateField('background.culturalBackground')}
                onDelete={handleForgetField('background.culturalBackground')}
                placeholder={t('myStory.placeholders.culturalBackground')}
              />
            </StorySection>

            {/* Tier 5: Personal */}
            <StorySection
              title={t('myStory.sections.personal')}
              icon={<Sparkles size={18} />}
              depth={5}
              isEmpty={!sectionHasContent(story?.personal)}
            >
              <StoryField
                label={t('myStory.fields.interests')}
                fieldPath="personal.interests"
                field={story?.personal?.interests}
                onUpdate={handleUpdateField('personal.interests')}
                onDelete={handleForgetField('personal.interests')}
                placeholder={t('myStory.placeholders.interests')}
              />
              <StoryField
                label={t('myStory.fields.hobbies')}
                fieldPath="personal.hobbies"
                field={story?.personal?.hobbies}
                onUpdate={handleUpdateField('personal.hobbies')}
                onDelete={handleForgetField('personal.hobbies')}
                placeholder={t('myStory.placeholders.hobbies')}
              />
              <StoryField
                label={t('myStory.fields.copingActivities')}
                fieldPath="personal.copingActivities"
                field={story?.personal?.copingActivities}
                onUpdate={handleUpdateField('personal.copingActivities')}
                onDelete={handleForgetField('personal.copingActivities')}
                placeholder={t('myStory.placeholders.copingActivities')}
              />
            </StorySection>

            {/* Tier 6: Therapeutic Context */}
            <StorySection
              title={t('myStory.sections.therapeuticContext')}
              subtitle={t('myStory.sections.therapeuticContextSubtitle')}
              icon={<Brain size={18} />}
              depth={6}
              isEmpty={!sectionHasContent(story?.therapeuticContext)}
            >
              <StoryField
                label={t('myStory.fields.knownTriggers')}
                fieldPath="therapeuticContext.knownTriggers"
                field={story?.therapeuticContext?.knownTriggers}
                onUpdate={handleUpdateField('therapeuticContext.knownTriggers')}
                onDelete={handleForgetField('therapeuticContext.knownTriggers')}
                placeholder={t('myStory.placeholders.knownTriggers')}
              />
            </StorySection>
          </motion.div>
        )}
      </main>
    </div>
  );
};
