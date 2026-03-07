"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import {
  workspaceSearchItems,
  type WorkspaceSearchGroup,
} from "@/lib/workspace-search";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const groupOrder: WorkspaceSearchGroup[] = [
  "Creators",
  "Codes",
  "Events",
  "Payouts",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function WorkspaceSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const groupedResults = useMemo(() => {
    const normalizedQuery = normalize(query);

    return groupOrder
      .map((group) => {
        const items = workspaceSearchItems.filter((item) => {
          if (item.group !== group) {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          const haystack = `${item.title} ${item.description} ${item.keywords.join(" ")}`;
          return haystack.toLowerCase().includes(normalizedQuery);
        });

        return {
          group,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [query]);

  const flatResults = useMemo(
    () => groupedResults.flatMap((group) => group.items),
    [groupedResults],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/") {
        const target = event.target as HTMLElement | null;
        const isTypingTarget =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);

        if (isTypingTarget && event.key === "/") {
          return;
        }

        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openSearch() {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (flatResults.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatResults.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = flatResults[activeIndex];

      if (target) {
        close();
        router.push(target.href);
      }
    }
  }

  return (
    <>
      <label className="relative hidden w-full max-w-[360px] items-center lg:flex">
        <Search
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-4 text-ink-subtle"
        />
        <input
          type="search"
          readOnly
          value=""
          onFocus={openSearch}
          onClick={openSearch}
          placeholder="Search creators, codes, payouts..."
          className="h-10 w-full rounded-full border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] pl-11 pr-16 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary focus:bg-white"
        />
        <span className="pointer-events-none absolute right-3 rounded-full border border-[var(--aa-shell-border)] px-2 py-1 text-[11px] font-semibold text-ink-subtle">
          /
        </span>
      </label>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="aa-search-backdrop fixed inset-0 z-40 bg-[rgba(17,24,39,0.08)] backdrop-blur-[4px]"
          />
          <div className="aa-search-modal fixed inset-x-0 top-24 z-50 mx-auto w-full max-w-[720px] px-4">
            <div className="rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white p-4 shadow-[0_24px_56px_rgba(17,24,39,0.08)]">
              <div className="relative">
                <Search
                  size={18}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search creators, codes, payouts..."
                  className="h-12 w-full rounded-full border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] pl-12 pr-4 text-[15px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary focus:bg-white"
                />
              </div>

              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {groupedResults.length > 0 ? (
                  <div className="space-y-5">
                    {groupedResults.map((group) => (
                      <div key={group.group}>
                        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                          {group.group}
                        </p>
                        <div className="mt-2 space-y-1">
                          {group.items.map((item) => {
                            const index = flatResults.findIndex((result) => result.id === item.id);
                            const active = index === activeIndex;

                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={close}
                                className={joinClasses(
                                  "block rounded-[var(--radius-card)] border px-4 py-3 transition-colors",
                                  active
                                    ? "border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] bg-primary-soft"
                                    : "border-transparent hover:border-[var(--aa-shell-border)] hover:bg-[var(--aa-shell-panel-muted)]",
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[15px] font-semibold text-ink">{item.title}</p>
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                                    {group.group}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm leading-5 text-ink-muted">
                                  {item.description}
                                </p>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] px-4 py-8 text-center">
                    <p className="text-[15px] font-semibold text-ink">No matching shortcuts</p>
                    <p className="mt-2 text-sm leading-5 text-ink-muted">
                      Try a creator, code, event, or payout keyword.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
