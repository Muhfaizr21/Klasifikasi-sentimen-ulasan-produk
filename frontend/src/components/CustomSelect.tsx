import React, { useEffect, useMemo, useRef, useState } from 'react'

export interface SelectOptionItem {
  value: string
  label: string
  badge?: string
  group?: string
  description?: string
}

export interface CustomSelectProps {
  value: string
  onChange: (nextVal: string) => void
  options: SelectOptionItem[]
  prefixLabel?: string
  ariaLabel?: string
  align?: 'left' | 'right'
  fullWidth?: boolean
  minWidth?: number
  searchable?: boolean
  disabled?: boolean
  placeholder?: string
  dropUp?: boolean
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  prefixLabel,
  ariaLabel,
  align = 'left',
  fullWidth = false,
  minWidth = 210,
  searchable = false,
  disabled = false,
  placeholder = 'Pilih opsi...',
  dropUp = false,
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [autoDropUp, setAutoDropUp] = useState(dropUp)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.group && opt.group.toLowerCase().includes(q)) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    )
  }, [options, searchable, searchQuery])

  // Detect available vertical space on toggle
  const handleToggle = () => {
    if (disabled) return
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setAutoDropUp(dropUp || (spaceBelow < 320 && spaceAbove > spaceBelow))
    }
    setOpen((prev) => !prev)
    setSearchQuery('')
  }

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`cih-dropdown ${fullWidth ? 'is-full' : ''} ${open ? 'is-open' : ''} ${
        disabled ? 'is-disabled' : ''
      }`}
      style={{ minWidth: fullWidth ? undefined : `${minWidth}px` }}
    >
      <button
        type="button"
        className="cih-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || prefixLabel || 'Pilih opsi'}
        disabled={disabled}
        onClick={handleToggle}
      >
        <span className="cih-dropdown-trigger-text">
          {prefixLabel && <span className="cih-dropdown-prefix">{prefixLabel}:</span>}
          <span className="cih-dropdown-value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        {selectedOption?.badge && (
          <span className="cih-dropdown-trigger-badge">{selectedOption.badge}</span>
        )}
        <svg
          className="cih-dropdown-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`cih-dropdown-popover ${align === 'right' ? 'align-right' : 'align-left'} ${
            autoDropUp ? 'is-dropup' : ''
          }`}
          role="listbox"
        >
          {searchable && (
            <div className="cih-dropdown-search-box">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                style={{ color: 'var(--color-ash, #66645e)' }}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam daftar..."
                className="cih-dropdown-search-input"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--color-ash)',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="cih-dropdown-list">
            {filteredOptions.length === 0 ? (
              <div className="cih-dropdown-empty">Tidak ada opsi yang cocok</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value
                const prevOpt = filteredOptions[idx - 1]
                const showGroupHeader = Boolean(opt.group && opt.group !== prevOpt?.group)

                return (
                  <React.Fragment key={opt.value}>
                    {showGroupHeader && (
                      <div className="cih-dropdown-group-header">
                        <span>{opt.group}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`cih-dropdown-option ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        onChange(opt.value)
                        setOpen(false)
                      }}
                    >
                      <span className="cih-dropdown-option-main">
                        <span className="cih-dropdown-option-label">{opt.label}</span>
                        {opt.description && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--color-ash, #66645e)',
                              display: 'block',
                              marginTop: '2px',
                            }}
                          >
                            {opt.description}
                          </span>
                        )}
                      </span>
                      <span className="cih-dropdown-option-right">
                        {opt.badge && (
                          <span className="cih-dropdown-option-badge">{opt.badge}</span>
                        )}
                        {isSelected && (
                          <svg
                            className="cih-dropdown-check"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.3"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </React.Fragment>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
