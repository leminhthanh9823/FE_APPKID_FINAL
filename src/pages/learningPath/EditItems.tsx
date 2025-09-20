import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { ROUTES } from "@/routers/routes";
import useFetchLearningPathItems from '@/hooks/useFetchLearningPathItems';
import useReorderCategories from '@/hooks/useReorderCategories';
import useReorderItems from '@/hooks/useReorderItems';
import { CategoryComponent } from '@/components/LearningPathDragDrop';
import AddReadingModal from '@/components/AddReadingModal';
import { Category, LearningPathItem } from '@/types/learningPath';
import { AvailableReading } from '@/types/readingModal';

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

  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);

  // Hook for reordering categories
  const { reorderCategories, isSubmitting: isReordering } = useReorderCategories();
  
  // Hook for reordering items within categories
  const { reorderItems, isSubmitting: isReorderingItems } = useReorderItems();

  useEffect(() => {
    if (fetchedCategories) {
      setCategoriesState(fetchedCategories);
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
      
      // Reconstruct category items (readings first, then games)
      category.items = [...readings, ...games];
      
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
      
      // Get games for this specific reading
      const games = category.items.filter(item => 
        item.game_id && item.prerequisite_reading_id && item.prerequisite_reading_id.toString() === readingId
      );
      
      const [movedGame] = games.splice(source.index, 1);
      games.splice(destination.index, 0, movedGame);

      // Reconstruct category items
      const readings = category.items.filter(item => item.reading_id && !item.game_id);
      const otherGames = category.items.filter(item => 
        item.game_id && (!item.prerequisite_reading_id || item.prerequisite_reading_id.toString() !== readingId)
      );
      
      category.items = [...readings, ...games, ...otherGames];
      
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
    console.log('Edit reading:', item);
    // TODO: Implement edit reading functionality
    toast.info('Edit reading feature will be implemented');
  };

  const handleRemoveReading = (item: LearningPathItem) => {
    console.log('Remove reading:', item);
    // TODO: Implement remove reading functionality  
    toast.info('Remove reading feature will be implemented');
  };

  const handleEditGame = (item: LearningPathItem) => {
    console.log('Edit game:', item);
    // TODO: Implement edit game functionality
    toast.info('Edit game feature will be implemented');
  };

  const handleRemoveGame = (item: LearningPathItem) => {
    console.log('Remove game:', item);
    // TODO: Implement remove game functionality
    toast.info('Remove game feature will be implemented');
  };

  const handleAddReading = (categoryId?: number) => {
    setModalCategoryId(categoryId || null);
    setIsModalOpen(true);
  };

  const handleModalClose = (wasSuccessful?: boolean) => {
    setIsModalOpen(false);
    setModalCategoryId(null);
    // Only refetch learning path items if readings were successfully added
    if (wasSuccessful) {
      refetch();
    }
  };

  const handleReadingSelect = (selectedReadings: AvailableReading[]) => {
    // This callback will be called when readings are successfully added
    console.log('Selected readings:', selectedReadings);
  };

  const handleAddGame = (readingId: number) => {
    // TODO: Implement add game functionality
    toast.info('Add game feature will be implemented');
  };

  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: level }, (_, index) => (
      <span key={index} className="star">★</span>
    ));
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
                  Edit Learning Path Items: "{learningPath.name}"
                </h2>
                <div className="d-flex align-items-center">
                  <span className="badge bg-warning text-dark me-2">
                    <i className="bi bi-star-fill me-1"></i>
                    Difficulty: {renderDifficultyStars(learningPath.difficulty_level)}
                  </span>
                </div>
              </div>
              <button className="btn btn-success" onClick={() => handleAddReading()}>
                <i className="bi bi-plus-lg me-1"></i>
                Thêm reading
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
        />
      )}
    </main>
  );
};

export default EditItems;