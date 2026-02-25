-- 1. 查看所有分类数据，确认 parent_id 关系
SELECT id, name, parent_id, sort 
FROM category 
ORDER BY parent_id, sort;

-- 2. 特别检查：是否有 parent_id = 4 的数据（即 "Java基础语法" 的子分类）
SELECT * 
FROM category 
WHERE parent_id = 4;
