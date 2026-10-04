'use client';

import type { FilterGroup } from '@/lib/search';

interface TechFilterProps {
  groups: FilterGroup[];
  selected: string[];
  onChange?: (next: string[]) => void;
  disabled?: boolean;
}

export function TechFilter({ groups, selected, onChange, disabled = false }: TechFilterProps) {
  const toggle = (slug: string, checked: boolean) => {
    const next = checked ? [...selected, slug] : selected.filter((item) => item !== slug);
    onChange?.([...new Set(next)].sort());
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((group) => (
        <fieldset key={group.category} className="min-w-0">
          <legend className="mb-1 text-sm font-semibold">{group.label}</legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <label
                key={option.slug}
                className="inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-md border px-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selected.includes(option.slug)}
                  disabled={disabled}
                  onChange={(event) => toggle(option.slug, event.target.checked)}
                />
                {`${option.name} (${option.count})`}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
