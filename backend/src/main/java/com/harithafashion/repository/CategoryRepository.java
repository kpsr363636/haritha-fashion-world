package com.harithafashion.repository;

import com.harithafashion.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
    List<Category> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(UUID parentId);

    @Query(value = """
            WITH RECURSIVE cat_tree AS (
                SELECT id FROM categories WHERE id = :categoryId
                UNION ALL
                SELECT c.id FROM categories c JOIN cat_tree ct ON c.parent_id = ct.id
            )
            SELECT id FROM cat_tree
            """, nativeQuery = true)
    List<UUID> findCategoryTreeIds(UUID categoryId);
}
