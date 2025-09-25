import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ROUTES } from "@/routers/routes";
import useFetchLearningPathItems from '@/hooks/useFetchLearningPathItems';
import useReorderCategories from '@/hooks/useReorderCategories';
import useReorderItems from '@/hooks/useReorderItems';
import useDeleteReading from '@/hooks/useDeleteReading';
import useDeleteGame from '@/hooks/useDeleteGame';
import useFetchCategoryItems from '@/hooks/useFetchCategoryItems';
import { CategoryComponent } from '@/components/LearningPathDragDrop';
import AddReadingModal from '@/components/AddReadingModal';
import AddGameModal from '@/components/AddGameModal';
import { Category, LearningPathItem } from '@/types/learningPath';
import { AvailableReading } from '@/types/readingModal';
import { AvailableGame } from '@/types/gameModal';

const EditItems = () => {
  const { id } = useParams<{ id: string }>();
  const learningPathId = id ? parseInt(id) : null;
  
  const { 
    learningPath, 
    categories: fetchedCategories, 
    setCategories,
    totalItems, 
    error, 
    refetch 
  } = useFetchLearningPathItems(learningPathId);

  const navigate = useNavigate();

  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedReadingId, setSelectedReadingId] = useState<number | null>(null);
  const [selectedLearningPathCategoryId, setSelectedLearningPathCategoryId] = useState<number | null>(null);

  // Hook for reordering categories
  const { reorderCategories, isSubmitting: isReordering } = useReorderCategories();
  
  // Hook for reordering items within categories
  const { reorderItems, isSubmitting: isReorderingItems } = useReorderItems();

  // Hooks for deleting items
  const { deleteReading, isSubmitting: isDeletingReading } = useDeleteReading();
  const { deleteGame, isSubmitting: isDeletingGame } = useDeleteGame();
  
  // Hook for fetching category-specific items
  const { refetchCategoryItems } = useFetchCategoryItems();

  // Helper function to ensure proper sequential ordering
  const ensureSequentialOrdering = (categories: Category[]): Category[] => {
    return categories.map(category => {
      const readings = category.items.filter(item => item.reading_id && !item.game_id);
      const games = category.items.filter(item => item.game_id);
      
      const orderedItems: LearningPathItem[] = [];
      let sequenceCounter = 1;
      
      readings.forEach(reading => {
        // Add reading with sequential order
        orderedItems.push({ ...reading, sequence_order: sequenceCounter++ });
        
        // Add games belonging to this reading with sequential order
        const readingGames = games.filter(game => 
          game.prerequisite_reading_id === reading.reading_id
        );
        readingGames.forEach(game => {
          orderedItems.push({ ...game, sequence_order: sequenceCounter++ });
        });
      });
      
      return { ...category, items: orderedItems };
    });
  };

  // Helper function to find category containing a specific item
  const findCategoryByItem = (readingId?: number, gameId?: number): Category | null => {
    return categories.find(category => 
      category.items.some(item => 
        (readingId && item.reading_id === readingId) ||
        (gameId && item.game_id === gameId)
      )
    ) || null;
  };

  // Helper function to update a specific category's items
  const updateCategoryItems = (learningPathCategoryId: number, newItems: LearningPathItem[]) => {
    console.log('Updating category items:', { learningPathCategoryId, newItems, currentCategories: categories });
    
    const newCategories = categories.map(category => {
      if (category.learning_path_category_id === learningPathCategoryId) {
        console.log('Found matching category, updating items:', category.learning_path_category_id);
        return { ...category, items: newItems };
      }
      return category;
    });
    
    console.log('New categories after update:', newCategories);
    setCategoriesState(newCategories);
    setCategories(newCategories);
  };

  useEffect(() => {
    if (fetchedCategories) {
      const orderedCategories = ensureSequentialOrdering(fetchedCategories);
      setCategoriesState(orderedCategories);
    }
  }, [fetchedCategories]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If dropped outside droppable area
    if (!destination) return;

    // If dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newCategories = Array.from(categories);

    if (type === 'category') {
      // Reordering categories
      const [reorderedCategory] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, reorderedCategory);
      
      // Update UI immediately (optimistic update)
      setCategoriesState(newCategories);
      setCategories(newCategories);
      
      // Call API to persist the changes
      if (learningPathId) {
        reorderCategories(
          learningPathId,
          newCategories,
          () => {
            // Success callback - already updated UI, just need to refetch to ensure consistency
            refetch();
          },
          (originalCategories) => {
            // Error callback - rollback to original order
            setCategoriesState(originalCategories);
            setCategories(originalCategories);
          }
        );
      }
      return;
    }

    if (type === 'reading') {
      // Handle reading reordering within same category only
      const sourceCategoryId = source.droppableId.replace('category-', '').replace('-readings', '');
      const destCategoryId = destination.droppableId.replace('category-', '').replace('-readings', '');
      
      // Only allow reordering within the same category
      if (sourceCategoryId !== destCategoryId) {
        toast.error('Readings can only be reordered within the same category!');
        return;
      }
      
      const categoryIndex = newCategories.findIndex(cat => cat.category_id.toString() === sourceCategoryId);
      if (categoryIndex === -1) return;

      const category = { ...newCategories[categoryIndex] };
      const originalItems = [...category.items];
      
      // Separate readings and games
      const readings = category.items.filter(item => item.reading_id && !item.game_id);
      const games = category.items.filter(item => item.game_id);
      
      // Reorder readings
      const [movedReading] = readings.splice(source.index, 1);
      readings.splice(destination.index, 0, movedReading);
      
      // Reconstruct category items with proper sequential ordering
      // Each reading followed by its games in sequence
      const reconstructedItems: LearningPathItem[] = [];
      let sequenceCounter = 1;
      
      readings.forEach(reading => {
        // Add reading with sequential order
        reconstructedItems.push({ ...reading, sequence_order: sequenceCounter++ });
        
        // Add games belonging to this reading with sequential order
        const readingGames = games.filter(game => 
          game.prerequisite_reading_id === reading.reading_id
        );
        readingGames.forEach(game => {
          reconstructedItems.push({ ...game, sequence_order: sequenceCounter++ });
        });
      });
      
      category.items = reconstructedItems;
      
      // Update UI immediately (optimistic update)
      newCategories[categoryIndex] = category;
      setCategoriesState(newCategories);
      setCategories(newCategories);
      
      // Call API to persist the changes
      if (learningPathId) {
        reorderItems(
          learningPathId,
          parseInt(sourceCategoryId),
          category.items,
          () => {
            // Success callback - refetch to ensure consistency
            refetch();
          },
          (originalItemsOrder) => {
            // Error callback - rollback to original order
            const rollbackCategory = { ...newCategories[categoryIndex] };
            rollbackCategory.items = originalItems;
            const rollbackCategories = [...newCategories];
            rollbackCategories[categoryIndex] = rollbackCategory;
            setCategoriesState(rollbackCategories);
            setCategories(rollbackCategories);
          }
        );
      }
      return;
    }

    if (type === 'game') {
      // Handle game reordering within readings
      const readingId = source.droppableId.replace('reading-', '').replace('-games', '');
      const destReadingId = destination.droppableId.replace('reading-', '').replace('-games', '');

      if (readingId !== destReadingId) {
        toast.error('Games can only be reordered within the same reading!');
        return;
      }

      // Find the category containing this reading
      const categoryIndex = newCategories.findIndex(cat => 
        cat.items.some(item => item.reading_id && item.reading_id.toString() === readingId)
      );

      if (categoryIndex === -1) return;

      const category = { ...newCategories[categoryIndex] };
      const originalItems = [...category.items];
      
      // Get games for this specific reading and reorder them
      const thisReadingGames = category.items.filter(item => 
        item.game_id && item.prerequisite_reading_id && item.prerequisite_reading_id.toString() === readingId
      );
      
      const [movedGame] = thisReadingGames.splice(source.index, 1);
      thisReadingGames.splice(destination.index, 0, movedGame);

      // Reconstruct category items with proper sequential ordering
      // Each reading followed by its games in sequence
      const readings = category.items.filter(item => item.reading_id && !item.game_id);
      const allGames = category.items.filter(item => item.game_id);
      
      const reconstructedItems: LearningPathItem[] = [];
      let sequenceCounter = 1;
      
      readings.forEach(reading => {
        // Add reading with sequential order
        reconstructedItems.push({ ...reading, sequence_order: sequenceCounter++ });
        
        // Add games belonging to this reading with sequential order
        const readingGames = reading.reading_id?.toString() === readingId 
          ? thisReadingGames  // Use reordered games for the affected reading
          : allGames.filter(game => game.prerequisite_reading_id === reading.reading_id);
        
        readingGames.forEach(game => {
          reconstructedItems.push({ ...game, sequence_order: sequenceCounter++ });
        });
      });
      
      category.items = reconstructedItems;
      
      // Update UI immediately (optimistic update)
      newCategories[categoryIndex] = category;
      setCategoriesState(newCategories);
      setCategories(newCategories);
      
      // Call API to persist the changes
      if (learningPathId) {
        reorderItems(
          learningPathId,
          category.category_id,
          category.items,
          () => {
            // Success callback - refetch to ensure consistency
            refetch();
          },
          (originalItemsOrder) => {
            // Error callback - rollback to original order
            const rollbackCategory = { ...newCategories[categoryIndex] };
            rollbackCategory.items = originalItems;
            const rollbackCategories = [...newCategories];
            rollbackCategories[categoryIndex] = rollbackCategory;
            setCategoriesState(rollbackCategories);
            setCategories(rollbackCategories);
          }
        );
      }
    }
  };

  const handleEditReading = (item: LearningPathItem) => {
    const params = new URLSearchParams();

    if (item.name) {
      params.set('searchTerm', item.name);
      const url = `${window.location.origin}${ROUTES.READING}?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRemoveReading = (item: LearningPathItem) => {
    if (!learningPathId || !item.reading_id) {
      toast.error('Invalid learning path or reading ID');
      return;
    }
    const category = findCategoryByItem(item.reading_id);
    if (!category) {
      toast.error('Category not found for this reading');
      return;
    }
    // Capture non-null IDs for use inside the async callback
    const readingId = item.reading_id as number;
    const learningPathCategoryIdForDelete = item.learning_path_category_id;

    // Ask for confirmation using SweetAlert2
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will also remove all associated games.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) return;

      // Call delete API first, wait for completion before updating UI
      deleteReading(
        learningPathId,
        readingId,
        // Success callback
        (responseData) => {
          console.log('Reading deleted successfully:', responseData);
          
          // After successful deletion, refetch items for the affected category only
          console.log('Refetching category items for category ID:', learningPathCategoryIdForDelete);
          
          refetchCategoryItems(
            learningPathCategoryIdForDelete,
            (updatedItems) => {
              console.log('Successfully refetched items for category:', learningPathCategoryIdForDelete);
              console.log('Updated items:', updatedItems);
              
              // Apply sequential ordering and update the specific category
              const orderedItems = ensureSequentialOrdering([{ 
                ...category, 
                items: updatedItems 
              }])[0].items;
              
              console.log('Final ordered items:', orderedItems);
              updateCategoryItems(learningPathCategoryIdForDelete, orderedItems);
            },
            (error) => {
              console.error('Failed to refetch category items after successful deletion:', error);
              // Fallback: refetch entire learning path
              refetch();
            }
          );
        },
        // Error callback
        (error) => {
          console.error('Failed to delete reading:', error);
          // No UI rollback needed since we didn't update UI optimistically
        }
      );
    });
  };

  const handleEditGame = (item: LearningPathItem) => {
    if (item.game_id) {
      const url = `${window.location.origin}/games/${item.game_id}/edit`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRemoveGame = (item: LearningPathItem) => {
    if (!learningPathId || !item.game_id) {
      toast.error('Invalid learning path or game ID');
      return;
    }
    const category = findCategoryByItem(undefined, item.game_id);
    if (!category) {
      toast.error('Category not found for this game');
      return;
    }

    // Capture non-null game id for use inside async callback
    const gameId = item.game_id as number;
    const learningPathCategoryIdForDelete = item.learning_path_category_id;

    // Ask for confirmation using SweetAlert2
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the game permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) return;

      // Call delete API first, wait for completion before updating UI
      deleteGame(
        learningPathId,
        gameId,
        // Success callback
        (responseData) => {
          console.log('Game deleted successfully:', responseData);
          
          // After successful deletion, refetch items for the affected category only
          console.log('Refetching category items for category ID:', learningPathCategoryIdForDelete);
          
          refetchCategoryItems(
            learningPathCategoryIdForDelete,
            (updatedItems) => {
              console.log('Successfully refetched items for category:', learningPathCategoryIdForDelete);
              console.log('Updated items:', updatedItems);
              
              // Apply sequential ordering and update the specific category
              const orderedItems = ensureSequentialOrdering([{ 
                ...category, 
                items: updatedItems 
              }])[0].items;
              
              console.log('Final ordered items:', orderedItems);
              updateCategoryItems(learningPathCategoryIdForDelete, orderedItems);
            },
            (error) => {
              console.error('Failed to refetch category items after successful deletion:', error);
              // Fallback: refetch entire learning path
              refetch();
            }
          );
        },
        // Error callback
        (error) => {
          console.error('Failed to delete game:', error);
          // No UI rollback needed since we didn't update UI optimistically
        }
      );
    });
  };

  const handleAddReading = (categoryId?: number) => {
    setModalCategoryId(categoryId || null);
    setIsModalOpen(true);
  };

  const handleModalClose = (wasSuccessful?: boolean) => {
    setIsModalOpen(false);
    const categoryId = modalCategoryId;
    setModalCategoryId(null);
    
    // Only refetch learning path items if readings were successfully added
    if (wasSuccessful) {
      if (categoryId) {
        // If we know which category was affected, refetch only that category
        const lpCategory = categories.find(cat => cat.category_id === categoryId);
        if (lpCategory && lpCategory.learning_path_category_id) {
          refetchCategoryItems(
            lpCategory.learning_path_category_id,
            (updatedItems) => {
              // Apply sequential ordering and update category
              const orderedItems = ensureSequentialOrdering([{ 
                ...lpCategory, 
                items: updatedItems 
              }])[0].items;
              
              updateCategoryItems(lpCategory.learning_path_category_id, orderedItems);
            },
            (error) => {
              console.error('Failed to refetch category items after adding reading:', error);
              // Fallback: refetch all learning path items
              refetch();
            }
          );
        } else {
          refetch(); // Fallback if category not found or no learning_path_category_id
        }
      } else {
        // If no specific category, refetch all items
        refetch();
      }
    }
  };

  const handleReadingSelect = (selectedReadings: AvailableReading[]) => {
    // This callback will be called when readings are successfully added
    console.log('Selected readings:', selectedReadings);
  };

  const handleGameModalClose = (wasSuccessful?: boolean) => {
    setIsGameModalOpen(false);
    const readingId = selectedReadingId;
    setSelectedReadingId(null);
    setSelectedLearningPathCategoryId(null);
    
    // Only refetch if games were successfully added
    if (wasSuccessful && readingId) {
      // Find category containing this reading
      const category = categories.find(cat => 
        cat.items.some(item => item.reading_id === readingId)
      );
      
      if (category) {
        refetchCategoryItems(
          category.learning_path_category_id,
          (updatedItems) => {
            // Apply sequential ordering and update category
            const orderedItems = ensureSequentialOrdering([{ 
              ...category, 
              items: updatedItems 
            }])[0].items;
            
            updateCategoryItems(category.learning_path_category_id, orderedItems);
          },
          (error) => {
            console.error('Failed to refetch category items after adding game:', error);
            // Fallback: refetch all learning path items
            refetch();
          }
        );
      } else {
        refetch(); // Fallback if category not found
      }
    }
  };

  const handleGameSelect = (selectedGames: AvailableGame[]) => {
    // This callback will be called when games are successfully added
    console.log('Selected games:', selectedGames);
  };

  const handleAddGame = (readingId: number) => {
    if (readingId) {
      navigate(`${ROUTES.CREATE_GAME.replace(':id', readingId.toString())}`)
    }
  };

  const handleAddGameFromLibrary = (readingId: number) => {
    // Find the category that contains this reading
    const category = categories.find(cat => 
      cat.items.some(item => item.reading_id === readingId)
    );
    
    if (category) {
      setSelectedReadingId(readingId);
      setSelectedLearningPathCategoryId(category.learning_path_category_id);
      setIsGameModalOpen(true);
    } else {
      console.error('Category not found for reading ID:', readingId);
    }
  };

  if (error) {
    return (
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Items Management</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/dashboard">CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.LEARNING_PATH}`}>Learning Paths</a>
              </li>
              <li className="breadcrumb-item active">Edit Items</li>
            </ol>
          </nav>
        </div>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="alert alert-danger d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>Error loading learning path items: {error}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Items Management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item">
              <a href={`${ROUTES.LEARNING_PATH}`}>Learning Paths</a>
            </li>
            <li className="breadcrumb-item active">Edit Items</li>
          </ol>
        </nav>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          {learningPath && (
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <div>
                <h2 className="h3 mb-2">
                  <i className="bi bi-book me-2 text-primary"></i>
                  Edit learning path items: {learningPath.name}
                </h2>
                <div className="d-flex align-items-center">
                  <span className="badge text-dark me-2"  style={{ fontSize: '1em' }}>
                    <i className="bi bi-star-fill me-1"></i>
                    Difficulty: Level: {learningPath.difficulty_level}
                  </span>
                </div>
              </div>
              <button className="btn btn-success" onClick={() => handleAddReading()}>
                <i className="bi bi-plus-lg me-1"></i>
                Add reading
              </button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories" type="category">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${snapshot.isDraggingOver ? 'bg-light rounded p-3' : ''}`}
                  style={{ minHeight: '200px' }}
                >
                  {categories.map((category, index) => (
                    <CategoryComponent
                      key={category.category_id}
                      category={category}
                      index={index}
                      onEditReading={handleEditReading}
                      onRemoveReading={handleRemoveReading}
                      onEditGame={handleEditGame}
                      onRemoveGame={handleRemoveGame}
                      onAddReading={handleAddReading}
                      onAddGame={handleAddGame}
                      onAddGameFromLibrary={handleAddGameFromLibrary}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {categories.length === 0 && !error && (
            <div className="text-center py-5">
              <i className="bi bi-folder2-open text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No categories found for this learning path.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Reading Modal */}
      {learningPathId && (
        <AddReadingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSelect={handleReadingSelect}
          selectedCategoryId={modalCategoryId}
          learningPathId={learningPathId}
          difficultyLevel={learningPath ? learningPath.difficulty_level : null}
        />
      )}

      {/* Add Game Modal */}
      {learningPathId && selectedReadingId && selectedLearningPathCategoryId && (
        <AddGameModal
          isOpen={isGameModalOpen}
          onClose={handleGameModalClose}
          onSelect={handleGameSelect}
          readingId={selectedReadingId}
          learningPathId={learningPathId}
          learningPathCategoryId={selectedLearningPathCategoryId}
        />
      )}
    </main>
  );
};

export default EditItems;