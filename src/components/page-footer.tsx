'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Globe, Pencil, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

interface FooterLink {
  name: React.ReactNode;
  url: string;
}

interface FeedbackReason {
  id: string;
  label: string;
  hint?: string;
}

const FEEDBACK_REASONS: Record<'yes' | 'no', { heading: string; reasons: FeedbackReason[] }> = {
  yes: {
    heading: 'What did you like?',
    reasons: [
      { id: 'accurate', label: 'Accurate', hint: 'Matches how the API or SDK actually behaves.' },
      { id: 'clear', label: 'Clear explanation', hint: 'Easy to follow and understand.' },
      { id: 'working-sample', label: 'Working code sample', hint: 'The example ran without changes.' },
      { id: 'unblocked', label: 'Solved my problem', hint: 'Got me past the issue I came here for.' },
      { id: 'other', label: 'Another reason' },
    ],
  },
  no: {
    heading: 'What went wrong?',
    reasons: [
      { id: 'inaccurate', label: 'Inaccurate', hint: "Doesn't match the actual behavior." },
      { id: 'missing-info', label: 'Missing information', hint: "Couldn't find what I needed." },
      { id: 'confusing', label: 'Confusing', hint: 'Too complex or hard to follow.' },
      { id: 'broken-sample', label: 'Code sample errors', hint: 'The example errored or gave unexpected results.' },
      { id: 'other', label: 'Another reason' },
    ],
  },
};

// Swap this out for a real request (e.g. `fetch('/api/feedback', ...)`) once
// there's somewhere to store submissions.
async function submitFeedback(payload: {
  sentiment: 'yes' | 'no';
  reason: string;
  comment: string;
  path: string;
}) {
  console.info('[feedback]', payload);
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export function PageFooter({
  previous,
  next,
  editUrl,
}: {
  previous?: FooterLink;
  next?: FooterLink;
  editUrl: string;
}) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="mt-12 flex flex-col gap-8 border-t border-fd-border pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Feedback onOpenChange={setFeedbackOpen} />
        {!feedbackOpen && (
          <Link
            href={editUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2.5 rounded border border-fd-border px-4 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
          >
            <Pencil className="size-3.5" />
            Suggest edits
          </Link>
        )}
      </div>

      {(previous || next) && (
        <div className="flex items-center justify-between gap-4">
          {previous ? (
            <Link
              href={previous.url}
              className="inline-flex items-center gap-2 text-sm font-medium text-fd-foreground transition-colors hover:text-fd-primary"
            >
              <ChevronLeft className="size-4" />
              {previous.name}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={next.url}
              className="inline-flex items-center gap-2 text-sm font-medium text-fd-foreground transition-colors hover:text-fd-primary"
            >
              {next.name}
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-fd-border pt-8">
        <div className="flex items-center gap-4 text-fd-muted-foreground">
          <SocialLink href="https://github.com/cochlearai" label="GitHub">
            <GithubIcon />
          </SocialLink>
          <SocialLink href="https://www.linkedin.com/company/cochl" label="LinkedIn">
            <LinkedinIcon />
          </SocialLink>
          <SocialLink href="https://medium.com/cochl" label="Medium">
            <MediumIcon />
          </SocialLink>
          <SocialLink href="https://www.cochl.ai" label="Website">
            <Globe className="size-4" />
          </SocialLink>
        </div>
        <p className="text-sm text-fd-muted-foreground">Powered by Cochl</p>
      </div>
    </div>
  );
}

type FeedbackStep =
  | { name: 'idle' }
  | { name: 'selecting'; sentiment: 'yes' | 'no'; reason: string | null; comment: string }
  | { name: 'submitting'; sentiment: 'yes' | 'no'; reason: string; comment: string }
  | { name: 'submitted' };

function Feedback({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<FeedbackStep>({ name: 'idle' });

  function choose(sentiment: 'yes' | 'no') {
    setStep({ name: 'selecting', sentiment, reason: null, comment: '' });
    onOpenChange(true);
  }

  async function submit() {
    if (step.name !== 'selecting' || !step.reason) return;
    const { sentiment, reason, comment } = step;
    setStep({ name: 'submitting', sentiment, reason, comment });
    await submitFeedback({ sentiment, reason, comment, path: window.location.pathname });
    setStep({ name: 'submitted' });
    onOpenChange(true);
    setTimeout(() => {
      setStep({ name: 'idle' });
      onOpenChange(false);
    }, 5000);
  }

  if (step.name === 'idle') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-fd-muted-foreground">Was this page helpful?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => choose('yes')}
            className="inline-flex items-center gap-2.5 rounded border border-fd-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-fd-muted"
          >
            <ThumbsUp className="size-3.5" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => choose('no')}
            className="inline-flex items-center gap-2.5 rounded border border-fd-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-fd-muted"
          >
            <ThumbsDown className="size-3.5" />
            No
          </button>
        </div>
      </div>
    );
  }

  if (step.name === 'submitted') {
    return (
      <p className="text-sm font-medium text-fd-foreground">
        Thanks for helping us improve the Cochl.Sense docs!
      </p>
    );
  }

  const { heading, reasons } = FEEDBACK_REASONS[step.sentiment];
  const submitting = step.name === 'submitting';

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-medium text-fd-foreground">{heading}</p>
      <div className="flex flex-col gap-3">
        {reasons.map((reason) => {
          const selected = step.reason === reason.id;
          return (
            <div key={reason.id}>
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="feedback-reason"
                  className="mt-0.5 size-4 accent-fd-primary"
                  checked={selected}
                  onChange={() =>
                    setStep({ name: 'selecting', sentiment: step.sentiment, reason: reason.id, comment: step.comment })
                  }
                />
                <span className="text-sm">
                  <span className="font-medium text-fd-foreground">{reason.label}</span>
                  {reason.hint && <span className="block text-fd-muted-foreground">{reason.hint}</span>}
                </span>
              </label>
              {selected && (
                <textarea
                  autoFocus
                  rows={3}
                  value={step.comment}
                  onChange={(e) =>
                    setStep({ name: 'selecting', sentiment: step.sentiment, reason: reason.id, comment: e.target.value })
                  }
                  placeholder={
                    reason.id === 'other'
                      ? 'Tell us more about your experience.'
                      : '(Optional) The more detail, the better.'
                  }
                  className="mt-2 ml-[26px] w-full max-w-md rounded border border-fd-border bg-fd-background p-3 text-sm text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                />
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!step.reason || submitting}
        onClick={submit}
        className="mt-4 rounded border border-fd-border px-4 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted disabled:cursor-not-allowed disabled:text-fd-muted-foreground disabled:hover:bg-transparent"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="transition-colors hover:text-fd-foreground"
    >
      {children}
    </Link>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  );
}

function MediumIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M13.54 12a6.72 6.72 0 0 1-6.77 6.67A6.72 6.72 0 0 1 0 12a6.72 6.72 0 0 1 6.77-6.67A6.72 6.72 0 0 1 13.54 12Zm7.36 0c0 3.54-1.51 6.4-3.38 6.4-1.87 0-3.39-2.86-3.39-6.4s1.52-6.4 3.39-6.4c1.87 0 3.38 2.86 3.38 6.4ZM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" />
    </svg>
  );
}
