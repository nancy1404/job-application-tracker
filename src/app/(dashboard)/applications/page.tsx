'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedbackMessage } from '@/components/ui/feedback-message';

type Company = {
  id: string;
  name: string;
};

type Application = {
  id: string;
  title: string;
  usedResumeId?: string | null;
  usedResume?: {
    id: string;
    title: string;
  } | null;
  opportunityType?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  outcome?: string;
  outcomeDate?: string | null;
  outcomeNotes?: string | null;
  jobUrl?: string | null;
  description?: string | null;
  status: string;
  appliedDate?: string | null;
  notes?: string | null;
  company?: Company | null;
};

type Resume = {
  id: string;
  title: string;
};

type Reminder = {
  id: string;
  dueDate: string;
  status: string;
  application?: {
    id: string;
  } | null;
};

type AiInsight = {
  id: string;
  applicationId: string;
  resumeId: string;
  matchScore: number;
  summary?: string | null;
  strengths?: string[] | null;
  gaps?: string[] | null;
  suggestions?: string[] | null;
};

type FollowUpTimingOption = 'THREE_DAYS' | 'ONE_WEEK' | 'TWO_WEEKS' | 'CUSTOM';

const statusOptions = ['INTERESTED', 'SAVED', 'APPLIED', 'INTERVIEW', 'OFFER'];
const legacyStatusOptions = ['REJECTED', 'ARCHIVED'];
const opportunityTypeOptions = [
  { value: 'JOB', label: 'Job' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'RESEARCH', label: 'Research / Lab' },
  { value: 'OTHER_OUTREACH', label: 'Other Outreach' },
];
const outcomeOptions = ['ACTIVE', 'ACCEPTED', 'REJECTED', 'NO_RESPONSE', 'WITHDRAWN', 'ARCHIVED'];

function getOpportunityTypeLabel(value?: string) {
  switch (value) {
    case 'JOB':
      return 'Job';
    case 'INTERNSHIP':
      return 'Internship';
    case 'RESEARCH':
    case 'LAB':
      return 'Research / Lab';
    case 'PROFESSOR_OUTREACH':
    case 'OTHER_OUTREACH':
      return 'Other Outreach';
    default:
      return value ?? 'Unknown';
  }
}

function normalizeOpportunityTypeForForm(value?: string) {
  switch (value) {
    case 'INTERNSHIP':
      return 'INTERNSHIP';
    case 'RESEARCH':
    case 'LAB':
      return 'RESEARCH';
    case 'PROFESSOR_OUTREACH':
    case 'OTHER_OUTREACH':
      return 'OTHER_OUTREACH';
    case 'JOB':
    default:
      return 'JOB';
  }
}

function isFinalOutcome(value?: string) {
  return value && value !== 'ACTIVE';
}

function isActiveOpportunity(application: Application) {
  return !isFinalOutcome(application.outcome);
}

function getCelebrationMessage(application: Application) {
  if (application.outcome === 'ACCEPTED') {
    return '🎉 Accepted — congratulations!';
  }

  if (application.status === 'OFFER') {
    return '🎉 Offer received!';
  }

  return null;
}

function formatDateForInput(value?: string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatDateTimeForInput(value?: Date) {
  if (!value) {
    return '';
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultFollowUpDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(9, 0, 0, 0);
  return date;
}

function getDueDateForFollowUpTiming(timing: FollowUpTimingOption, customDateTime?: string) {
  if (timing === 'CUSTOM') {
    if (!customDateTime) {
      return null;
    }

    const parsedDate = new Date(customDateTime);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (timing === 'THREE_DAYS') {
    return getDefaultFollowUpDate(3);
  }

  if (timing === 'TWO_WEEKS') {
    return getDefaultFollowUpDate(14);
  }

  return getDefaultFollowUpDate(7);
}

function isLegacyStatus(value: string) {
  return legacyStatusOptions.includes(value);
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingApplicationId, setGeneratingApplicationId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [editingApplicationId, setEditingApplicationId] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('SAVED');
  const [opportunityType, setOpportunityType] = useState('JOB');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [outcome, setOutcome] = useState('ACTIVE');
  const [outcomeDate, setOutcomeDate] = useState('');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [usedResumeId, setUsedResumeId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedResumeIds, setSelectedResumeIds] = useState<Record<string, string>>({});
  const [aiInsights, setAiInsights] = useState<Record<string, AiInsight>>({});
  const [creatingReminderForId, setCreatingReminderForId] = useState('');
  const [reminderMessages, setReminderMessages] = useState<Record<string, string>>({});
  const [followUpTimingById, setFollowUpTimingById] = useState<Record<string, FollowUpTimingOption>>({});
  const [followUpCustomDateTimeById, setFollowUpCustomDateTimeById] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [opportunityTypeFilter, setOpportunityTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [focusFormAfterModeSwitch, setFocusFormAfterModeSwitch] = useState(false);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  async function loadData() {
    setIsLoading(true);
    setLoadError('');

    try {
      const [applicationsResponse, companiesResponse, resumesResponse, remindersResponse] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/companies'),
        fetch('/api/resumes'),
        fetch('/api/reminders'),
      ]);

      if (!applicationsResponse.ok) {
        throw new Error('Could not load opportunities.');
      }

      if (!companiesResponse.ok) {
        throw new Error('Could not load opportunities.');
      }

      if (!resumesResponse.ok) {
        throw new Error('Could not load opportunities.');
      }

      if (!remindersResponse.ok) {
        throw new Error('Could not load opportunities.');
      }

      const applicationsData = (await applicationsResponse.json()) as { applications: Application[] };
      const companiesData = (await companiesResponse.json()) as { companies: Company[] };
      const resumesData = (await resumesResponse.json()) as { resumes: Resume[] };
      const remindersData = (await remindersResponse.json()) as { reminders: Reminder[] };

      setApplications(applicationsData.applications ?? []);
      setCompanies(companiesData.companies ?? []);
      setResumes(resumesData.resumes ?? []);
      setReminders(remindersData.reminders ?? []);

      if (resumesData.resumes?.length) {
        setSelectedResumeIds((currentSelections) => {
          const nextSelections = { ...currentSelections };
          const validResumeIds = new Set((resumesData.resumes ?? []).map((resume) => resume.id));

          for (const application of applicationsData.applications ?? []) {
            if (!nextSelections[application.id]) {
              if (application.usedResumeId && validResumeIds.has(application.usedResumeId)) {
                nextSelections[application.id] = application.usedResumeId;
              } else {
                nextSelections[application.id] = resumesData.resumes[0].id;
              }
            }
          }

          return nextSelections;
        });
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load opportunities.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (viewMode !== 'card' || !focusFormAfterModeSwitch) {
      return;
    }

    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleInputRef.current?.focus();
    setFocusFormAfterModeSwitch(false);
  }, [viewMode, focusFormAfterModeSwitch]);

  async function getOrCreateCompanyId(name: string) {
    const normalizedName = name.trim().toLowerCase();
    const existingCompany = companies.find((company) => company.name.trim().toLowerCase() === normalizedName);

    if (existingCompany) {
      return existingCompany.id;
    }

    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const refreshResponse = await fetch('/api/companies');
        if (refreshResponse.ok) {
          const refreshData = (await refreshResponse.json()) as { companies: Company[] };
          setCompanies(refreshData.companies ?? []);
          const refreshedCompany = refreshData.companies?.find(
            (company) => company.name.trim().toLowerCase() === normalizedName
          );

          if (refreshedCompany) {
            return refreshedCompany.id;
          }
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error ?? 'Failed to create company.');
    }

    const data = (await response.json()) as { company: Company };
    setCompanies((currentCompanies) => [...currentCompanies, data.company]);
    return data.company.id;
  }

  function resetForm() {
    setEditingApplicationId('');
    setTitle('');
    setCompanyName('');
    setJobUrl('');
    setDescription('');
    setStatus('SAVED');
    setOpportunityType('JOB');
    setContactName('');
    setContactEmail('');
    setOutcome('ACTIVE');
    setOutcomeDate('');
    setOutcomeNotes('');
    setAppliedDate('');
    setUsedResumeId('');
    setNotes('');
    setFormError('');
  }

  function startEdit(application: Application) {
    setEditingApplicationId(application.id);
    setTitle(application.title);
    setCompanyName(application.company?.name ?? '');
    setJobUrl(application.jobUrl ?? '');
    setDescription(application.description ?? '');
    setStatus(application.status);
    setOpportunityType(normalizeOpportunityTypeForForm(application.opportunityType));
    setContactName(application.contactName ?? '');
    setContactEmail(application.contactEmail ?? '');
    setOutcome(application.outcome ?? 'ACTIVE');
    setOutcomeDate(formatDateForInput(application.outcomeDate));
    setOutcomeNotes(application.outcomeNotes ?? '');
    setAppliedDate(formatDateForInput(application.appliedDate));
    setUsedResumeId(application.usedResumeId ?? application.usedResume?.id ?? '');
    setNotes(application.notes ?? '');
    setFormError('');
  }

  function cancelEdit() {
    resetForm();
  }

  function getSelectedResumeId(applicationId: string) {
    return selectedResumeIds[applicationId] ?? resumes[0]?.id ?? '';
  }

  async function generateAiInsight(application: Application) {
    setAiErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[application.id];
      return nextErrors;
    });

    const selectedResumeId = getSelectedResumeId(application.id);

    if (!selectedResumeId) {
      setAiErrors((currentErrors) => ({
        ...currentErrors,
        [application.id]: 'Select a resume first.',
      }));
      return;
    }

    setGeneratingApplicationId(application.id);

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          resumeId: selectedResumeId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to generate AI insight.');
      }

      setAiInsights((currentInsights) => ({
        ...currentInsights,
        [application.id]: data.insight as AiInsight,
      }));
    } catch (error) {
      setAiErrors((currentErrors) => ({
        ...currentErrors,
        [application.id]:
          error instanceof Error && error.message
            ? error.message
            : 'Failed to generate AI insight. Check your OpenAI configuration and try again.',
      }));
    } finally {
      setGeneratingApplicationId('');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      let companyId: string | null | undefined;

      if (companyName.trim()) {
        companyId = await getOrCreateCompanyId(companyName);
      } else if (editingApplicationId) {
        companyId = null;
      }

      const isEditing = Boolean(editingApplicationId);
      const response = await fetch(isEditing ? `/api/applications/${editingApplicationId}` : '/api/applications', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          companyId,
          jobUrl,
          description,
          status,
          opportunityType,
          contactName,
          contactEmail,
          outcome,
          outcomeDate: outcomeDate ? new Date(outcomeDate).toISOString() : undefined,
          outcomeNotes,
          appliedDate: appliedDate ? new Date(appliedDate).toISOString() : undefined,
          usedResumeId: usedResumeId || null,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not save opportunity.');
      }

      setTitle('');
      setCompanyName('');
      setJobUrl('');
      setDescription('');
      setStatus('SAVED');
      setOpportunityType('JOB');
      setContactName('');
      setContactEmail('');
      setOutcome('ACTIVE');
      setOutcomeDate('');
      setOutcomeNotes('');
      setAppliedDate('');
      setUsedResumeId('');
      setNotes('');
      setEditingApplicationId('');

      await loadData();
      setSuccessMessage(isEditing ? 'Opportunity updated.' : 'Opportunity created.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save opportunity.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteApplication(applicationId: string) {
    const confirmed = window.confirm('Delete this application?');

    if (!confirmed) {
      return;
    }

    setLoadError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Could not delete opportunity.');
      }

      if (editingApplicationId === applicationId) {
        resetForm();
      }

      await loadData();
      setSuccessMessage('Opportunity deleted.');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not delete opportunity.');
    }
  }

  function getSelectedFollowUpTiming(applicationId: string) {
    return followUpTimingById[applicationId] ?? 'ONE_WEEK';
  }

  function getSelectedFollowUpCustomDateTime(applicationId: string) {
    if (followUpCustomDateTimeById[applicationId]) {
      return followUpCustomDateTimeById[applicationId];
    }

    return formatDateTimeForInput(getDefaultFollowUpDate(7));
  }

  async function addFollowUpReminder(application: Application) {
    setReminderMessages((currentMessages) => {
      const nextMessages = { ...currentMessages };
      delete nextMessages[application.id];
      return nextMessages;
    });
    setCreatingReminderForId(application.id);

    try {
      const selectedTiming = getSelectedFollowUpTiming(application.id);
      const dueDate = getDueDateForFollowUpTiming(
        selectedTiming,
        selectedTiming === 'CUSTOM' ? getSelectedFollowUpCustomDateTime(application.id) : undefined
      );

      if (!dueDate) {
        throw new Error('Could not create follow-up reminder.');
      }

      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Follow up about ${application.title}`,
          dueDate: dueDate.toISOString(),
          status: 'PENDING',
          applicationId: application.id,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error('Could not create follow-up reminder.');
      }

      setReminderMessages((currentMessages) => ({
        ...currentMessages,
        [application.id]: 'Follow-up reminder created.',
      }));
      setSuccessMessage('Follow-up reminder created.');
    } catch (error) {
      setReminderMessages((currentMessages) => ({
        ...currentMessages,
        [application.id]: error instanceof Error ? error.message : 'Could not create follow-up reminder.',
      }));
    } finally {
      setCreatingReminderForId('');
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setOpportunityTypeFilter('ALL');
    setStatusFilter('ALL');
    setOutcomeFilter('ALL');
  }

  function matchesSearch(application: Application, query: string) {
    if (!query) {
      return true;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    const fields = [application.title, application.company?.name, application.contactName, application.contactEmail]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());

    return fields.some((value) => value.includes(normalizedQuery));
  }

  function matchesOpportunityType(application: Application) {
    if (opportunityTypeFilter === 'ALL') {
      return true;
    }

    return normalizeOpportunityTypeForForm(application.opportunityType) === opportunityTypeFilter;
  }

  function matchesStatus(application: Application) {
    if (statusFilter === 'ALL') {
      return true;
    }

    return application.status === statusFilter;
  }

  function matchesOutcome(application: Application) {
    if (outcomeFilter === 'ALL') {
      return true;
    }

    return (application.outcome ?? 'ACTIVE') === outcomeFilter;
  }

  const filteredApplications = applications.filter(
    (application) =>
      matchesSearch(application, searchQuery) &&
      matchesOpportunityType(application) &&
      matchesStatus(application) &&
      matchesOutcome(application)
  );

  const activeApplications = filteredApplications.filter(isActiveOpportunity);
  const archivedApplications = filteredApplications.filter((application) => !isActiveOpportunity(application));

  const pendingRemindersByApplication = reminders
    .filter((reminder) => reminder.status === 'PENDING' && reminder.application?.id)
    .reduce<Record<string, Reminder[]>>((accumulator, reminder) => {
      const applicationId = reminder.application?.id;

      if (!applicationId) {
        return accumulator;
      }

      if (!accumulator[applicationId]) {
        accumulator[applicationId] = [];
      }

      accumulator[applicationId].push(reminder);
      return accumulator;
    }, {});

  function getNextPendingReminder(applicationId: string) {
    const reminderList = pendingRemindersByApplication[applicationId];

    if (!reminderList || reminderList.length === 0) {
      return null;
    }

    return [...reminderList].sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())[0] ?? null;
  }

  function getNextReminderLabel(applicationId: string) {
    const nextReminder = getNextPendingReminder(applicationId);

    if (!nextReminder) {
      return '—';
    }

    const dueDate = new Date(nextReminder.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return '—';
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    if (dueDate < startOfToday) {
      return 'Overdue';
    }

    if (dueDate >= startOfToday && dueDate < startOfTomorrow) {
      return 'Due today';
    }

    return dueDate.toLocaleDateString();
  }

  function openNewOpportunityFormFromTableMode() {
    setViewMode('card');
    setFocusFormAfterModeSwitch(true);
  }

  function renderOpportunityCard(application: Application) {
    const celebrationMessage = getCelebrationMessage(application);

    return (
      <article key={application.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/50">
        {celebrationMessage ? (
          <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">{celebrationMessage}</p>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{application.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {application.company?.name ?? 'No company'} · {application.status}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {getOpportunityTypeLabel(application.opportunityType)}
              </span>
              {isFinalOutcome(application.outcome) ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {application.outcome}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => startEdit(application)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteApplication(application.id)}
              className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 dark:border-red-800 dark:text-red-300"
            >
              Delete
            </button>
            {isActiveOpportunity(application) ? (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={getSelectedFollowUpTiming(application.id)}
                  onChange={(event) =>
                    setFollowUpTimingById((current) => ({
                      ...current,
                      [application.id]: event.target.value as FollowUpTimingOption,
                    }))
                  }
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="THREE_DAYS">Remind me in 3 days</option>
                  <option value="ONE_WEEK">Remind me in 1 week</option>
                  <option value="TWO_WEEKS">Remind me in 2 weeks</option>
                  <option value="CUSTOM">Custom date/time</option>
                </select>

                {getSelectedFollowUpTiming(application.id) === 'CUSTOM' ? (
                  <input
                    type="datetime-local"
                    value={getSelectedFollowUpCustomDateTime(application.id)}
                    onChange={(event) =>
                      setFollowUpCustomDateTimeById((current) => ({
                        ...current,
                        [application.id]: event.target.value,
                      }))
                    }
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  />
                ) : null}

                <button
                  type="button"
                  onClick={() => addFollowUpReminder(application)}
                  disabled={creatingReminderForId === application.id}
                  className="rounded-md border border-sky-300 px-3 py-1 text-sm text-sky-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-sky-700 dark:text-sky-300"
                >
                  {creatingReminderForId === application.id ? 'Adding...' : 'Add follow-up reminder'}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {reminderMessages[application.id] ? (
          <FeedbackMessage
            variant={reminderMessages[application.id] === 'Follow-up reminder created.' ? 'success' : 'error'}
            message={reminderMessages[application.id]}
            onDismiss={() =>
              setReminderMessages((currentMessages) => {
                const nextMessages = { ...currentMessages };
                delete nextMessages[application.id];
                return nextMessages;
              })
            }
            autoDismissMs={reminderMessages[application.id] === 'Follow-up reminder created.' ? 5000 : undefined}
            className="mt-2"
          />
        ) : null}

        <dl className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {application.contactName ? (
            <div>
              <dt className="sr-only">Contact name</dt>
              <dd>Contact: {application.contactName}</dd>
            </div>
          ) : null}
          {application.contactEmail ? (
            <div>
              <dt className="sr-only">Contact email</dt>
              <dd>
                <a className="text-slate-900 underline dark:text-slate-100" href={`mailto:${application.contactEmail}`}>
                  {application.contactEmail}
                </a>
              </dd>
            </div>
          ) : null}
          {application.jobUrl ? (
            <div>
              <dt className="sr-only">Job URL</dt>
              <dd>
                <a className="text-slate-900 underline dark:text-slate-100" href={application.jobUrl} target="_blank" rel="noreferrer">
                  View job posting
                </a>
              </dd>
            </div>
          ) : null}
          {application.appliedDate ? (
            <div>
              <dt className="sr-only">Applied date</dt>
              <dd>Applied: {new Date(application.appliedDate).toLocaleDateString()}</dd>
            </div>
          ) : null}
          {application.outcomeDate ? (
            <div>
              <dt className="sr-only">Outcome date</dt>
              <dd>Outcome: {new Date(application.outcomeDate).toLocaleDateString()}</dd>
            </div>
          ) : null}
          {application.description ? (
            <div>
              <dt className="sr-only">Description</dt>
              <dd>{application.description}</dd>
            </div>
          ) : null}
          {application.notes ? (
            <div>
              <dt className="sr-only">Notes</dt>
              <dd>{application.notes}</dd>
            </div>
          ) : null}
          {application.outcomeNotes ? (
            <div>
              <dt className="sr-only">Outcome notes</dt>
              <dd>{application.outcomeNotes}</dd>
            </div>
          ) : null}
          {application.usedResume ? (
            <div>
              <dt className="sr-only">Resume used</dt>
              <dd>Resume/CV used: {application.usedResume.title}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI insight</h4>

          {resumes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create a resume first to generate an insight.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={`resume-${application.id}`}>
                  Resume
                </label>
                <select
                  id={`resume-${application.id}`}
                  value={getSelectedResumeId(application.id)}
                  onChange={(event) =>
                    setSelectedResumeIds((currentSelections) => ({
                      ...currentSelections,
                      [application.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Select a resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title}
                    </option>
                  ))}
                </select>
              </div>

              {aiErrors[application.id] ? <p className="text-sm text-red-600 dark:text-red-400">{aiErrors[application.id]}</p> : null}

              <button
                type="button"
                onClick={() => generateAiInsight(application)}
                disabled={generatingApplicationId === application.id}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:text-slate-200"
              >
                {generatingApplicationId === application.id ? 'Generating...' : 'Generate AI Insight'}
              </button>

              {aiInsights[application.id] ? (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Match score: {aiInsights[application.id].matchScore}</p>
                  <p className="mt-2">{aiInsights[application.id].summary}</p>

                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Strengths</p>
                      <ul className="list-disc pl-5">
                        {(aiInsights[application.id].strengths ?? []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Gaps</p>
                      <ul className="list-disc pl-5">
                        {(aiInsights[application.id].gaps ?? []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Suggestions</p>
                      <ul className="list-disc pl-5">
                        {(aiInsights[application.id].suggestions ?? []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </article>
    );
  }

  function renderOpportunityTable(application: Application, options: { allowFollowUp: boolean }) {
    return (
      <tr key={application.id} className="border-t border-slate-200 dark:border-slate-700">
        <td className="px-3 py-3 align-top">
          <p className="font-medium text-slate-900 dark:text-slate-100">{application.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{application.company?.name ?? 'No company'}</p>
          {application.jobUrl ? (
            <a
              className="mt-1 inline-flex text-xs text-slate-700 underline dark:text-slate-300"
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open link
            </a>
          ) : null}
        </td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">{getOpportunityTypeLabel(application.opportunityType)}</td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">{application.status}</td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">{application.outcome ?? 'ACTIVE'}</td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">
          {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : '—'}
        </td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">
          {application.usedResume?.title ?? '—'}
        </td>
        <td className="px-3 py-3 align-top text-sm text-slate-700 dark:text-slate-200">{getNextReminderLabel(application.id)}</td>
        <td className="px-3 py-3 align-top">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startEdit(application)}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Edit
            </button>
            {options.allowFollowUp ? (
              <button
                type="button"
                onClick={() => addFollowUpReminder(application)}
                disabled={creatingReminderForId === application.id}
                className="rounded-md border border-sky-300 px-2.5 py-1 text-xs font-medium text-sky-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-sky-700 dark:text-sky-300"
              >
                {creatingReminderForId === application.id ? 'Adding...' : 'Add follow-up'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => deleteApplication(application.id)}
              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:text-red-300"
            >
              Delete
            </button>
          </div>
          {reminderMessages[application.id] ? (
            <FeedbackMessage
              variant={reminderMessages[application.id] === 'Follow-up reminder created.' ? 'success' : 'error'}
              message={reminderMessages[application.id]}
              onDismiss={() =>
                setReminderMessages((currentMessages) => {
                  const nextMessages = { ...currentMessages };
                  delete nextMessages[application.id];
                  return nextMessages;
                })
              }
              autoDismissMs={reminderMessages[application.id] === 'Follow-up reminder created.' ? 5000 : undefined}
              className="mt-2"
            />
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Opportunities</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track applications, outreach, and follow-ups in one place.</p>
        </header>

        {successMessage ? (
          <FeedbackMessage
            variant="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
            autoDismissMs={5000}
            className="mb-6"
          />
        ) : null}

        <div className={viewMode === 'card' ? 'grid gap-8 lg:grid-cols-[1.1fr_0.9fr]' : 'space-y-6'}>
          {viewMode === 'card' ? (
          <section ref={formSectionRef} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingApplicationId ? 'Edit opportunity' : 'New opportunity'}
            </h2>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="opportunityType">
                    Opportunity type
                  </label>
                  <select
                    id="opportunityType"
                    value={opportunityType}
                    onChange={(event) => setOpportunityType(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {opportunityTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="contactName">
                    Contact name
                  </label>
                  <input
                    id="contactName"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    ref={titleInputRef}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="companyName">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="jobUrl">
                    Job URL
                  </label>
                  <input
                    id="jobUrl"
                    type="url"
                    value={jobUrl}
                    onChange={(event) => setJobUrl(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    {isLegacyStatus(status) ? (
                      <option value={status}>{`${status} (Legacy)`}</option>
                    ) : null}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="contactEmail">
                    Contact email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="outcome">
                    Outcome
                  </label>
                  <select
                    id="outcome"
                    value={outcome}
                    onChange={(event) => setOutcome(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {outcomeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="outcomeDate">
                    Outcome date
                  </label>
                  <input
                    id="outcomeDate"
                    type="date"
                    value={outcomeDate}
                    onChange={(event) => setOutcomeDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="appliedDate">
                    Applied date
                  </label>
                  <input
                    id="appliedDate"
                    type="date"
                    value={appliedDate}
                    onChange={(event) => setAppliedDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="usedResumeId">
                  Resume/CV used (optional)
                </label>
                <select
                  id="usedResumeId"
                  value={usedResumeId}
                  onChange={(event) => setUsedResumeId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">No resume selected</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="outcomeNotes">
                  Outcome notes
                </label>
                <textarea
                  id="outcomeNotes"
                  value={outcomeNotes}
                  onChange={(event) => setOutcomeNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {formError ? (
                <FeedbackMessage
                  variant="error"
                  title="Could not save opportunity."
                  message={formError}
                  onDismiss={() => setFormError('')}
                />
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (editingApplicationId ? 'Saving...' : 'Creating...') : editingApplicationId ? 'Save changes' : 'Create application'}
              </button>
              {editingApplicationId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="ml-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel edit
                </button>
              ) : null}
            </form>
          </section>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your opportunities</h2>
              <div className="flex flex-wrap items-center justify-end gap-3">
                {viewMode === 'table' ? (
                  <button
                    type="button"
                    onClick={openNewOpportunityFormFromTableMode}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    New opportunity
                  </button>
                ) : null}
                <div className="inline-flex rounded-lg border border-slate-300 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      viewMode === 'card'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      viewMode === 'table'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    Table
                  </button>
                </div>

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredApplications.length} shown / {applications.length} total
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="searchOpportunities">
                    Search
                  </label>
                  <input
                    id="searchOpportunities"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by title, company, contact name, or email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="filterOpportunityType">
                    Opportunity type
                  </label>
                  <select
                    id="filterOpportunityType"
                    value={opportunityTypeFilter}
                    onChange={(event) => setOpportunityTypeFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="ALL">All types</option>
                    {opportunityTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="filterStatus">
                    Status
                  </label>
                  <select
                    id="filterStatus"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="ALL">All statuses</option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="filterOutcome">
                    Outcome
                  </label>
                  <select
                    id="filterOutcome"
                    value={outcomeFilter}
                    onChange={(event) => setOutcomeFilter(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="ALL">All outcomes</option>
                    {outcomeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading opportunities...</p> : null}
            {loadError ? (
              <FeedbackMessage
                variant="error"
                title="Could not load opportunities."
                message={loadError}
                onDismiss={() => setLoadError('')}
                className="mt-4"
              />
            ) : null}

            {!isLoading && !loadError && applications.length === 0 ? (
              <EmptyState
                title="No opportunities yet"
                description="Create your first opportunity to start tracking applications and outreach."
                className="mt-4 p-6"
              />
            ) : null}

            {!isLoading && !loadError && applications.length > 0 && filteredApplications.length === 0 ? (
              <EmptyState
                title="No matches found"
                description="No opportunities match your current search or filters."
                className="mt-4 p-6"
              />
            ) : null}

            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Active / Ongoing</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Opportunities where outcome is ACTIVE.
                </p>
                {activeApplications.length === 0 ? (
                  <EmptyState
                    title="No active opportunities"
                    description="Active opportunities will appear here when outcome is ACTIVE."
                    className="mt-3 p-6"
                  />
                ) : viewMode === 'card' ? (
                  <div className="mt-3 space-y-3">{activeApplications.map(renderOpportunityCard)}</div>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-[980px] w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/70">
                        <tr>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Opportunity</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Type</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Outcome</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Applied</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Resume/CV</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Next reminder</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900">{activeApplications.map((application) => renderOpportunityTable(application, { allowFollowUp: true }))}</tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Archive / Final outcomes</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Outcomes: ACCEPTED, REJECTED, NO_RESPONSE, WITHDRAWN, ARCHIVED.
                </p>
                {archivedApplications.length === 0 ? (
                  <EmptyState
                    title="No archived or final opportunities"
                    description="Archived and final-outcome opportunities will appear here."
                    className="mt-3 p-6"
                  />
                ) : viewMode === 'card' ? (
                  <div className="mt-3 space-y-3">{archivedApplications.map(renderOpportunityCard)}</div>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-[980px] w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/70">
                        <tr>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Opportunity</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Type</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Outcome</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Applied</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Resume/CV</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Next reminder</th>
                          <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900">{archivedApplications.map((application) => renderOpportunityTable(application, { allowFollowUp: false }))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
