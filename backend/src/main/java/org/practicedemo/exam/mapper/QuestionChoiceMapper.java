package org.practicedemo.exam.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Select;
import org.practicedemo.exam.entity.QuestionChoice;

import java.util.List;

/**
 * 题目选项
 */
public interface QuestionChoiceMapper extends BaseMapper<QuestionChoice> {
    // 根据题目ID查询选项列表，过滤掉已删除的选项
    @Select("select * from question_choices where question_id = #{questionId} and is_deleted = 0 order by sort desc ")
    List<QuestionChoice> selectByQuestionId(Long questionId);
} 