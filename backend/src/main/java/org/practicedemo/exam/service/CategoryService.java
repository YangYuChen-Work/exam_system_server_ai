package org.practicedemo.exam.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.practicedemo.exam.entity.Category;

import java.util.List;

public interface CategoryService extends IService<Category> {
    /**
     * 获取分类列表（包含题目数量）
     * @return 分类列表数据
     */
    List<Category> getCategoriesList();


    /**
     * 获取分类树结构
     * @return 分类树结构数据
     */
    List<Category> getCategoriesTree();


    /**
     * 保存分类
     * @param category 分类对象
     * @throws Exception 分类名称已存在异常
     */
    void saveCategory(Category category) throws Exception;

    /**
     * 更新分类
     * @param category 分类对象
     * @throws Exception 分类名称已存在异常
     */
    void updateCategory(Category category) throws Exception;


    /**
     * 删除分类
     * @param id 分类ID
     * @throws Exception 分类下存在题目异常
     */
    void removeCategoryById(Long id);
}