import React, { useState, useEffect } from 'react';
import { DIFFICULTY_OPTIONS, SEARCH_AVAILABLE_READING } from '@/utils/constants/options';
import useFetchReadingCategories from '@/hooks/useFetchReadingCategories';
import useFetchAvailableReadings from '@/hooks/useFetchAvailableReadings';
import useAddReadingsToPath from '@/hooks/useAddReadingsToPath';
import { AddReadingModalProps, AvailableReading, ReadingFilters } from '@/types/readingModal';

const AddReadingModal: React.FC<AddReadingModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCategoryId = null,
  learningPathId
}) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(selectedCategoryId);
  const [selectedReadings, setSelectedReadings] = useState<AvailableReading[]>([]);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [filters, setFilters] = useState<ReadingFilters>({
    difficulty: null,
    available: null,
    searchTerm: ''
  });

  // Fetch categories (only if not pre-selected)
  const { categories, error: categoriesError } = useFetchReadingCategories();

  // Fetch readings for selected category
  const {
    category,
    readings,
    totalReadings,
    error: readingsError,
    refetchWithFilters,
    refetch
  } = useFetchAvailableReadings(activeCategory);

  // Add readings to learning path
  const { addReadingsToPath, isSubmitting } = useAddReadingsToPath();

  // Set initial active category when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedCategoryId && activeCategory !== selectedCategoryId) {
        setActiveCategory(selectedCategoryId);
      } else if (categories.length > 0 && !activeCategory && !selectedCategoryId) {
        setActiveCategory(categories[0].id);
      }
    }
  }, [isOpen, selectedCategoryId, categories, activeCategory]);

  // Fetch readings data when modal opens and activeCategory is set
  useEffect(() => {
    if (isOpen && activeCategory) {
      refetch(); // Fetch fresh data when modal opens with a category
    }
  }, [isOpen, activeCategory]); // Remove refetch from dependencies to prevent infinite loop

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    if (!selectedCategoryId) { // Only allow changing if not pre-selected
      setActiveCategory(categoryId);
      setSelectedReadings([]); // Clear selections when changing category
      const resetFilters = { difficulty: null, available: null, searchTerm: '' };
      setFilters(resetFilters);
      // Don't call refetchWithFilters here - let the hook handle it automatically when categoryId changes
    }
  };

  // Handle reading selection
  const handleReadingToggle = (reading: AvailableReading) => {
    // Don't allow toggling readings that are already in a learning path
    if (reading.availability_learning_path_id !== null || reading.availability_name !== 'Available') {
      return;
    }
    
    setSelectedReadings(prev => {
      const isSelected = prev.some(r => r.id === reading.id);
      if (isSelected) {
        return prev.filter(r => r.id !== reading.id);
      } else {
        return [...prev, reading];
      }
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ReadingFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    refetchWithFilters(updatedFilters);
  };

  // Handle search
  const handleSearch = () => {
    refetchWithFilters(filters);
  };

  // Handle select button click
  const handleSelect = async () => {
    const readingIds = selectedReadings.map(r => r.id);
    
    try {
      await addReadingsToPath(learningPathId, readingIds, () => {
        // Mark as successful and call onSelect callback
        setWasSuccessful(true);
        onSelect(selectedReadings);
        
        // Clear selected readings after successful addition
        setSelectedReadings([]);
        
        // Refresh the readings list to show updated availability status
        refetch();
      });
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose(true); // Pass true to indicate success
      }, 2000);
      
    } catch (error) {
      // Don't close modal on failure, let user retry or close manually
      console.error('Failed to add readings:', error);
      setWasSuccessful(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedReadings([]);
    setFilters({ difficulty: null, available: null, searchTerm: '' });
    setWasSuccessful(false); // Reset success state
    onClose(false); // Pass false to indicate manual close (not success)
  };

  // Render difficulty stars
  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: level }, (_, index) => (
      <span key={index} className="text-warning">⭐</span>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Reading to Learning Path</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ minHeight: '500px' }}>
            <div className="row h-100">
              {/* Categories Panel */}
              <div className="col-md-4 border-end">
                <h6 className="fw-bold mb-3">Categories</h6>
                <div className="list-group">
                  {!selectedCategoryId ? (
                    // Show all categories if not pre-selected
                    categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center ${activeCategory === cat.id ? 'active' : ''
                          }`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <i className="bi bi-folder-fill me-2"></i>
                        {cat.title}
                        {activeCategory === cat.id && (
                          <span className="ms-auto">
                            <i className="bi bi-chevron-right"></i>
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    // Show only selected category
                    categories
                      .filter(cat => cat.id === selectedCategoryId)
                      .map(cat => (
                        <div key={cat.id} className="list-group-item active d-flex align-items-center">
                          <i className="bi bi-chevron-right me-2"></i>
                          <i className="bi bi-folder-fill me-2"></i>
                          {cat.title} (selected)
                        </div>
                      ))
                  )}
                </div>
                {categoriesError && (
                  <div className="alert alert-danger mt-2">
                    <small>Error loading categories: {categoriesError}</small>
                  </div>
                )}
              </div>

              {/* Readings Panel */}
              <div className="col-md-8">
                <h6 className="fw-bold mb-3">
                  Readings
                </h6>

                {/* Filters */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={filters.difficulty ?? ''}
                      onChange={e => handleFilterChange({
                        difficulty: e.target.value ? parseInt(e.target.value) : null
                      })}
                    >
                      {DIFFICULTY_OPTIONS.map((opt: { value: number | null; label: string }) => (
                        <option key={String(opt.value)} value={opt.value ?? ''}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={filters.available === null || filters.available === undefined ? '' : String(filters.available)}
                      onChange={e => handleFilterChange({
                        available: e.target.value === '' ? null : e.target.value === 'true'
                      })}
                    >
                      {SEARCH_AVAILABLE_READING.map((opt: { value: boolean | null; label: string }) => (
                        <option key={String(opt.value)} value={opt.value === null ? '' : String(opt.value)}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search readings..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleSearch}
                      >
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Readings List */}
                <div className="border rounded p-3" style={{ height: '350px', overflowY: 'auto' }}>
                  {readings.length > 0 ? (
                    readings.map(reading => (
                      <div
                        key={reading.id}
                        className={`d-flex align-items-center p-2 border-bottom ${
                          selectedReadings.some(r => r.id === reading.id) ? 'bg-light' : ''
                        } ${
                          reading.availability_learning_path_id !== null || reading.availability_name !== 'Available' 
                            ? 'opacity-50' 
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedReadings.some(r => r.id === reading.id)}
                          disabled={reading.availability_learning_path_id !== null || reading.availability_name !== 'Available'}
                          onChange={() => handleReadingToggle(reading)}
                        />
                        <i className="bi bi-book-fill text-info me-3"></i>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-medium">{reading.title}</span>
                            <div className="d-flex align-items-center gap-3">
                              <span className="small">
                                {renderDifficultyStars(reading.difficulty_level)}
                              </span>
                              <span className={`badge ${reading.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                {reading.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`badge ${reading.availability_name === 'Available' ? 'bg-primary' : 'bg-warning text-dark'
                                }`}>
                                {reading.availability_name === 'Available' ? '[Available]' : '[In This Path]'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-book me-2"></i>
                      {activeCategory ? 'No readings found in this category' : 'Select a category to view readings'}
                    </div>
                  )}
                </div>

                {/* Selection count */}
                <div className="mt-2 text-muted">
                  <small>{selectedReadings.length} readings selected</small>
                </div>

                {readingsError && (
                  <div className="alert alert-danger mt-2">
                    <small>Error loading readings: {readingsError}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSelect}
              disabled={selectedReadings.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                `Add to Learning Path (${selectedReadings.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReadingModal;