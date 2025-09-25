import React, { useState, useEffect } from 'react';
import useFetchReadingGames from '@/hooks/useFetchReadingGames';
import useAddGamesToPath from '@/hooks/useAddGamesToPath';
import { AddGameModalProps, AvailableGame, GameFilters } from '@/types/gameModal';
import { GAME_TYPES } from '@/utils/constants/options';

const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  readingId,
  learningPathId,
  learningPathCategoryId
}) => {
  const [selectedGames, setSelectedGames] = useState<AvailableGame[]>([]);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [filters, setFilters] = useState<GameFilters>({
    searchTerm: ''
  });
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Fetch games for the reading
  const {
    games,
    loading,
    error: gamesError,
    refetch,
    filterGames
  } = useFetchReadingGames(readingId);

  // Add games to reading
  const { addGamesToPath , isSubmitting } = useAddGamesToPath();

  // Fetch games data when modal opens
  useEffect(() => {
    if (isOpen && readingId) {
      setHasLoadedData(false);
      refetch(); // Fetch fresh data when modal opens
    }
  }, [isOpen, readingId]); // Remove refetch from dependencies to prevent infinite loop

  // Track when data has been loaded
  useEffect(() => {
    if (games.length >= 0) { // This will be true even for empty arrays
      setHasLoadedData(true);
    }
  }, [games]);

  // Apply filters when search term changes and data is loaded
  useEffect(() => {
    if (hasLoadedData) {
      filterGames(filters);
    }
  }, [filters, hasLoadedData]); // Only depend on filters and hasLoadedData flag

  // Handle game selection
  const handleGameToggle = (game: AvailableGame) => {
    // Don't allow toggling games that are already in a learning path
    if (game.availability_learning_path_id !== null) {
      return;
    }
    
    setSelectedGames(prev => {
      const isSelected = prev.some(g => g.id === game.id);
      if (isSelected) {
        return prev.filter(g => g.id !== game.id);
      } else {
        return [...prev, game];
      }
    });
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters({ searchTerm });
  };

  // Handle select button click
  const handleSelect = async () => {
    const gameIds = selectedGames.map(g => g.id);
    
    try {
      await addGamesToPath(
        learningPathId,
        learningPathCategoryId,
        readingId,
        gameIds,
        (responseData) => {
          // Mark as successful and call onSelect callback
          setWasSuccessful(true);
          onSelect(selectedGames);
          
          // Clear selected games after successful addition
          setSelectedGames([]);
          
          // Refresh the games list to show updated availability status
          refetch();
        }
      );
      
      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose(true); // Pass true to indicate success
      }, 2000);
      
    } catch (error) {
      // Don't close modal on failure, let user retry or close manually
      console.error('Failed to add games:', error);
      setWasSuccessful(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSelectedGames([]);
    setFilters({ searchTerm: '' });
    setWasSuccessful(false); // Reset success state
    setHasLoadedData(false); // Reset data loaded flag
    onClose(false); // Pass false to indicate manual close (not success)
  };

  // Get game type name
  const getGameTypeName = (type: number) => {
    const found = GAME_TYPES.find(t => t.value === type);
    return found ? found.label : `Type ${type}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Games to Reading</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ minHeight: '400px' }}>
            {/* Search */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search games..."
                    value={filters.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </div>
            </div>

            {/* Games List */}
            <div className="border rounded p-3" style={{ height: '300px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading games...</p>
                </div>
              ) : games.length > 0 ? (
                games.map(game => (
                  <div
                    key={game.id}
                    className={`d-flex align-items-center p-3 border-bottom ${
                      selectedGames.some(g => g.id === game.id) ? 'bg-light' : ''
                    } ${
                      game.availability_learning_path_id !== null ? 'opacity-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      checked={selectedGames.some(g => g.id === game.id)}
                      disabled={game.availability_learning_path_id !== null}
                      onChange={() => handleGameToggle(game)}
                    />
                    <div className="me-3">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="rounded"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/no-image-available.png';
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{game.title}</h6>
                          {game.description && (
                            <p className="text-muted small mb-1">{game.description}</p>
                          )}
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info text-dark">
                              {getGameTypeName(game.type)}
                            </span>
                            <span className={`badge ${game.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {game.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          {game.availability_learning_path_id !== null ? (
                            <span className="badge bg-warning text-dark">
                              In Learning Path
                            </span>
                          ) : (
                            <span className="badge bg-primary">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-controller me-2"></i>
                  {filters.searchTerm ? 'No games found matching your search' : 'No games available for this reading'}
                </div>
              )}
            </div>

            {/* Selection count */}
            <div className="mt-2 text-muted">
              <small>{selectedGames.length} game(s) selected</small>
            </div>

            {gamesError && (
              <div className="alert alert-danger mt-2">
                <small>Error loading games: {gamesError}</small>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSelect}
              disabled={selectedGames.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                `Add to Reading (${selectedGames.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGameModal;