import React from 'react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'bills', label: 'Bills' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange, count }) => {
  return (
    <div className="filter-wrapper">
      <div className="filter-label-group">
        <label htmlFor="category-filter-select" className="filter-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter by Category:
        </label>
        {typeof count === 'number' && (
          <span className="filter-count-badge">{count} {count === 1 ? 'item' : 'items'}</span>
        )}
      </div>

      <div className="select-container">
        <select
          id="category-filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategoryFilter;
