import './SearchInput.css';

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  return (
    <div className="search-input">
      <span className="search-input__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className="input search-input__field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        enterKeyHint="search"
      />
      {value && (
        <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  );
}
