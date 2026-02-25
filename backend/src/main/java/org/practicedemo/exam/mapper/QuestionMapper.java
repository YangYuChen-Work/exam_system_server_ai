package org.practicedemo.exam.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.practicedemo.exam.entity.Question;
import org.practicedemo.exam.entity.QuestionChoice;
import org.practicedemo.exam.vo.QuestionPageVo;

import java.util.List;
import java.util.Map;

/**
 * 题目Mapper接口
 * 继承MyBatis Plus的BaseMapper，提供基础的CRUD操作
 */
public interface QuestionMapper extends BaseMapper<Question> {

    /**
     * 查询每个分类下的题目数量
     * @return 分类ID到题目数量的映射列表
     */
    @Select("SELECT category_id , COUNT(*) as count FROM questions WHERE is_deleted = 0 GROUP BY category_id")
    List<Map<String, Object>> selectCategoryQuestionCount();

    /**
     * 分页查询题目列表，支持多条件筛选
     * @param page 分页对象，包含页码和每页大小
     * @param queryVo 查询条件封装对象，包含题目名称、分类ID、难度等级等筛选条件
     * @return 分页结果，包含符合条件的题目列表和分页信息
     */
    IPage<Question> customPage(IPage page, @Param("queryVo") QuestionPageVo queryVo);

}