package org.practicedemo.exam.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.practicedemo.exam.entity.Category;
import org.practicedemo.exam.entity.Question;
import org.practicedemo.exam.mapper.CategoryMapper;
import org.practicedemo.exam.mapper.QuestionMapper;
import org.practicedemo.exam.service.CategoryService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private final QuestionMapper questionMapper;

    public CategoryServiceImpl(QuestionMapper questionMapper) {
        this.questionMapper = questionMapper;
    }

    @Override
    public List<Category> getCategoriesList() {
        //查询所有分类信息
        List<Category> categories = list();
        //查询每个分类下的题目数量
        fillCategoryQuestionCount(categories);
        //返回完整结果
        return categories;
    }

    @Override
    public List<Category> getCategoriesTree() {
        //查询所有分类信息
        List<Category> categories = list();
        //查询每个分类下的题目数量
        fillCategoryQuestionCount(categories);
        //构建分类树结构
        //给所有分类按照parent_id分组，parent_id对应子分类列表
        Map<Long, List<Category>> parentMap = categories.stream()
                .collect(Collectors.groupingBy(Category::getParentId));
        //找到所有顶级分类（parent_id为0的分类）
        List<Category> treeCategories =
                categories.stream()
                        .filter(category -> category.getParentId().equals(0L))
                        .toList();
        //对筛选的集合进行循环
        treeCategories.forEach(category -> {
            //设置子分类列表，
            List<Category> orDefault = parentMap.getOrDefault(category.getId(), new ArrayList<>());
            //排序
            orDefault.sort(Comparator.comparing(Category::getSort));
            //设置子分类列表
            category.setChildren(orDefault);
            //赋值count
            long sum = orDefault.stream().mapToLong(Category::getCount).sum();
            category.setCount(sum + category.getCount());
        });
        //返回分类树结构
        return treeCategories;
    }

    @Override
    public void saveCategory(Category category) throws Exception {
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getName, category.getName());
        long count = count(queryWrapper);
        if (count > 0){
            Category parentCategory = getById(category.getParentId());
            throw new Exception(String.format("在%s父分类下已存在相同名称%s的子分类！", parentCategory.getName(), category.getName()));
        }
         save(category);
    }

    @Override
    public void updateCategory(Category category) throws Exception {
        //判断分类是否存在,同一父分类下是否存在同名分类，可以和自己同名，但不能和其他分类同名
        LambdaQueryWrapper<Category> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Category::getName, category.getName());
        queryWrapper.eq(Category::getParentId, category.getParentId());
        queryWrapper.ne(Category::getId, category.getId());
        boolean exists = getBaseMapper().exists(queryWrapper);
        if (exists){
            Category parentCategory = getById(category.getParentId());
            throw new Exception(String.format("在%s父分类下已存在相同名称%s的子分类！", parentCategory.getName(), category.getName()));
        }
        //更新分类信息
        updateById(category);
        log.info("更新分类成功！ 分类ID：{}", category.getId());
    }

     @Override
    public void removeCategoryById(Long id) {
        //1.检查是否为一级标题
        Category byId = getById(id);
        if(byId.getParentId()==0L){
            throw new RuntimeException("无法删除一级分类！");
        }
        //2.检查分类下是否存在题目
        LambdaQueryWrapper<Question> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Question::getCategoryId,id);
        long count = questionMapper.selectCount(queryWrapper);
        if (count > 0){
            throw new RuntimeException(String.format("当前分类%s,无法删除分类！原因：分类下存在%s题目！",byId.getName(),count));
        }
        //3.删除分类
        removeById(id);
    }


    private void fillCategoryQuestionCount(List<Category> categories) {
        //判断分类列表是否为空
        if (categories == null || categories.isEmpty()){
            throw new RuntimeException("查询分类列表失败！原因：分类列表为空！");
        }
        //遍历分类列表，查询每个分类下的题目数量
        List<Map<String, Object>> categoryQuestionCountList = questionMapper.selectCategoryQuestionCount();
        //将查询结果转换为分类ID到题目数量的映射
        Map<Long, Long> categoryQuestionCountMap = categoryQuestionCountList.stream()
                .collect(java.util.stream.Collectors.toMap(
                        map -> Long.parseLong(map.get("category_id").toString()),
                        map -> Long.parseLong(map.get("count").toString())
                ));
        //填充每个分类的题目数量
        categories.forEach(category -> {
            category.setCount(categoryQuestionCountMap.getOrDefault(category.getId(), 0L));
        });
    }

}